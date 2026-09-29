import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { validateSchema, forgotPasswordSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { success, data, errors } = validateSchema(forgotPasswordSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const { email } = data;

    // Check if user exists
    try {
      await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if email exists
        return NextResponse.json({
          success: true,
          message: 'Jika email terdaftar, link reset password akan dikirim',
        });
      }
      throw error;
    }

    // Generate password reset link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      handleCodeInApp: true,
    };
    
    const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    
    // Note: In production, send this link via email service
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, link reset password akan dikirim',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}