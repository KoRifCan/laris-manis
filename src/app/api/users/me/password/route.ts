import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1/accounts';

// Verifikasi password lama via Identity Toolkit REST (Admin SDK tidak
// bisa memverifikasi password — pola yang sama dengan /api/auth/login).
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
  } catch {
    return { ok: false as const, status: 500, error: 'Gagal menghubungi layanan autentikasi' };
  }

  await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false as const, status: 400, error: 'Kata sandi saat ini salah' };
  }
  return { ok: true as const };
}

// PUT /api/users/me/password — ganti kata sandi dengan verifikasi sandi lama.
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const currentPassword: string = body.currentPassword || '';
    const newPassword: string = body.newPassword || '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi lama dan baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8 || newPassword.length > 64) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi baru harus 8-64 karakter' },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi baru tidak boleh sama dengan yang lama' },
        { status: 400 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { success: false, error: 'Akun ini tidak punya email untuk verifikasi sandi' },
        { status: 400 }
      );
    }

    const check = await verifyPassword(user.email, currentPassword);
    if (!check.ok) {
      return NextResponse.json(
        { success: false, error: check.error },
        { status: check.status }
      );
    }

    await adminAuth.updateUser(user.uid, { password: newPassword });

    await createAuditLog(
      user.uid,
      user.role,
      'change_password',
      'user',
      user.uid,
      {},
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diganti',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
