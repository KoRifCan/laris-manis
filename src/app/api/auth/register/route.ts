import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { validateSchema, registerSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { success, data, errors } = validateSchema(registerSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const { email, password, displayName, phoneNumber } = data;

    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create user (nomor telepon opsional hanya disimpan di Firestore —
    // tidak dikirim ke Firebase Auth karena Auth mewajibkan nomor unik
    // global, sehingga pendaftaran publik bisa digagalkan nomor orang lain)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Set default role: pembeli
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'pembeli' });

    // Create user document
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      phoneNumber: phoneNumber || null,
      role: 'pembeli',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send verification email — non-fatal: kegagalan membuat tautan
    // (mis. domain belum masuk allowlist Firebase) tidak boleh menggagalkan
    // registrasi karena akun sudah terlanjur dibuat
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.nextUrl.protocol}//${request.headers.get('host') || request.nextUrl.host}`;
    try {
      await adminAuth.generateEmailVerificationLink(email, {
        url: `${origin}/auth/verify-email`,
        handleCodeInApp: true,
      });
      // Note: In production, send this link via email service (SendGrid, etc.)
    } catch (e: any) {
      console.warn('Gagal membuat tautan verifikasi email:', e?.message || e);
    }

    // Audit log
    await createAuditLog(
      userRecord.uid,
      'pembeli',
      'register',
      'user',
      userRecord.uid,
      { email, displayName },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
      data: { uid: userRecord.uid, email },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}