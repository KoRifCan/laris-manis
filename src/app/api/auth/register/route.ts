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

    // Create user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      phoneNumber: phoneNumber || undefined,
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

    // Send verification email
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
      handleCodeInApp: true,
    };
    await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);
    // Note: In production, send this link via email service (SendGrid, etc.)

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