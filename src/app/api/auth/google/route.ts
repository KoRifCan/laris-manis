import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

/**
 * Masuk / daftar menggunakan akun Google.
 * Menerima idToken hasil signInWithPopup (client) lalu:
 * - doc users sudah ada utk uid → login (dan tandai provider Google).
 * - doc belum ada, email belum terpakai → daftar otomatis (role pembeli).
 * - doc belum ada, email sudah terdaftar utk akun lain → 409 dengan
 *   instruksi menautkan via password di Pengaturan (email = akun sama).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = typeof body?.idToken === 'string' ? body.idToken : '';
    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Token Google wajib diisi' },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Sesi Google tidak valid. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    const email = (decoded.email || '').toLowerCase();
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Akun Google tidak memiliki email.' },
        { status: 400 }
      );
    }
    if (!decoded.email_verified) {
      return NextResponse.json(
        { success: false, error: 'Email pada akun Google belum terverifikasi.' },
        { status: 400 }
      );
    }

    let authRecord;
    try {
      authRecord = await adminAuth.getUser(decoded.uid);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Akun Google tidak dikenali. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    const docRef = adminDb.collection('users').doc(decoded.uid);
    const doc = await docRef.get();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    const displayName =
      decoded.name || authRecord.displayName || email.split('@')[0];

    if (!doc.exists) {
      // Email sama dgn akun lain (uid berbeda) → jangan buat akun terpisah.
      const byEmail = await adminDb
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();
      if (!byEmail.empty) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Email ini sudah terdaftar. Masuk dengan email & password terlebih dahulu, lalu kaitkan akun Google di Pengaturan.',
          },
          { status: 409 }
        );
      }

      // Pendaftaran baru lewat Google
      const role = (authRecord.customClaims?.role as string) || 'pembeli';
      if (!authRecord.customClaims?.role) {
        await adminAuth.setCustomUserClaims(decoded.uid, { role });
      }
      await docRef.set({
        uid: decoded.uid,
        email,
        displayName,
        photoURL: decoded.picture || null,
        role,
        emailVerified: true,
        googleProviderLinked: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createAuditLog(
        decoded.uid,
        role,
        'register',
        'user',
        decoded.uid,
        { method: 'google', email },
        ip,
        ua
      );

      return NextResponse.json({
        success: true,
        message: 'Registrasi via Google berhasil',
        data: {
          idToken,
          expiresIn: 3600,
          uid: decoded.uid,
          email,
          displayName,
          role,
          emailVerified: true,
        },
      });
    }

    // Akun sudah ada → login
    const data = doc.data()!;
    const role = (authRecord.customClaims?.role as string) || data.role || 'pembeli';

    await docRef.set(
      {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
        // Login via Google berarti provider Google memang terpasang di akun ini
        googleProviderLinked: true,
        emailVerified: true,
        photoURL: data.photoURL || decoded.picture || null,
      },
      { merge: true }
    );

    await createAuditLog(
      decoded.uid,
      role,
      'login',
      'user',
      decoded.uid,
      { method: 'google', email },
      ip,
      ua
    );

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        idToken,
        expiresIn: 3600,
        uid: decoded.uid,
        email,
        displayName: data.displayName || displayName,
        role,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
