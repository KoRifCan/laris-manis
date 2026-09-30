import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get fresh user record
    const userRecord = await adminAuth.getUser(user.uid);
    
    if (userRecord.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email sudah terverifikasi',
      });
    }

    // Send verification email — non-fatal (lihat catatan di register)
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      `${request.nextUrl.protocol}//${request.headers.get('host') || request.nextUrl.host}`;
    try {
      await adminAuth.generateEmailVerificationLink(userRecord.email!, {
        url: `${origin}/auth/verify-email`,
        handleCodeInApp: true,
      });
    } catch (e: any) {
      console.warn('Gagal membuat tautan verifikasi email:', e?.message || e);
    }

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'request_email_verification',
      'user',
      user.uid,
      { email: userRecord.email },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Link verifikasi email telah dikirim',
    });
  } catch (error: any) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}