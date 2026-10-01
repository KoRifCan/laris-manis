import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * Custom token uid yang sama dengan sesi berjalan — dipakai Firebase client
 * (signInWithCustomToken) agar currentUser tersedia utk linkWithPopup
 * menautkan Google ke akun email/password yang sedang login.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const customToken = await adminAuth.createCustomToken(user.uid);

    return NextResponse.json({
      success: true,
      data: { customToken },
    });
  } catch (error) {
    console.error('Google link-session error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
