import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { validateSchema, loginSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

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

    // Get user by email
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { success: false, error: 'Email atau password salah' },
          { status: 401 }
        );
      }
      throw error;
    }

    // Note: Firebase Admin SDK doesn't verify password directly.
    // Client should use Firebase Client SDK to sign in and get ID token,
    // then send ID token to backend for session/cookie creation.
    // This endpoint returns user info for client-side sign-in.

    const customClaims = userRecord.customClaims || {};
    const role = customClaims.role || 'pembeli';

    // Update last login
    await adminDb.collection('users').doc(userRecord.uid).update({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });

    // Audit log
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
      message: 'Gunakan Firebase Client SDK untuk sign-in dan dapatkan ID token',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role,
        emailVerified: userRecord.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}