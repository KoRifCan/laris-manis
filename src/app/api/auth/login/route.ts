import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { validateSchema, loginSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

// Verifikasi password via Identity Toolkit REST (server-side).
// Admin SDK tidak bisa verifikasi password, dan jalur REST ini
// tidak bergantung pada authorized-domain Firebase Console.
async function verifyPassword(email: string, password: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return { ok: false as const, status: 500, error: 'Konfigurasi autentikasi server tidak lengkap' };
  }

  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE}:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
  } catch (error) {
    console.error('Auth service unreachable:', error);
    return { ok: false as const, status: 500, error: 'Gagal menghubungi layanan autentikasi' };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const code: string = data?.error?.message || '';
    if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') {
      return { ok: false as const, status: 401, error: 'Email atau password salah' };
    }
    if (code === 'INVALID_EMAIL') {
      return { ok: false as const, status: 400, error: 'Format email tidak valid' };
    }
    if (code === 'USER_DISABLED') {
      return { ok: false as const, status: 403, error: 'Akun ini telah dinonaktifkan' };
    }
    console.error('SignIn failed:', code);
    return { ok: false as const, status: 500, error: 'Gagal memverifikasi login' };
  }

  return { ok: true as const, idToken: data.idToken as string, expiresIn: data.expiresIn as string };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { success, data, errors } = validateSchema(loginSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const { email, password } = data;

    const signIn = await verifyPassword(email, password);
    if (!signIn.ok) {
      return NextResponse.json({ success: false, error: signIn.error }, { status: signIn.status });
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/user-not-found') {
        return NextResponse.json(
          { success: false, error: 'Email atau password salah' },
          { status: 401 }
        );
      }
      throw error;
    }

    const customClaims = userRecord.customClaims || {};
    const role = customClaims.role || 'pembeli';

    await adminDb.collection('users').doc(userRecord.uid).set(
      {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    await createAuditLog(
      userRecord.uid,
      role,
      'login',
      'user',
      userRecord.uid,
      { email },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        idToken: signIn.idToken,
        expiresIn: parseInt(signIn.expiresIn, 10) || 3600,
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
        emailVerified: userRecord.emailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
