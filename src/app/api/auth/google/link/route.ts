import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

/**
 * Penyelesaian penautan Google: client sudah berhasil linkWithPopup di sisi
 * klien. Server memverifikasi idToken Google benar-benar milik uid yang sama
 * dan provider Google memang terpasang, lalu menandai Firestore.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const body = await request.json().catch(() => ({}));
    const googleIdToken = typeof body?.googleIdToken === 'string' ? body.googleIdToken : '';
    if (!googleIdToken) {
      return NextResponse.json(
        { success: false, error: 'Token Google wajib diisi' },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(googleIdToken);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token Google tidak valid' },
        { status: 401 }
      );
    }

    if (decoded.uid !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Token Google tidak cocok dengan sesi Anda' },
        { status: 403 }
      );
    }

    const record = await adminAuth.getUser(user.uid);
    const linked = (record.providerData || []).some(
      (p) => p.providerId === 'google.com'
    );
    if (!linked) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Akun Google belum tertaut. Selesaikan proses pemilihan akun Google terlebih dahulu.',
        },
        { status: 400 }
      );
    }

    const googleEmail =
      (record.providerData || []).find((p) => p.providerId === 'google.com')
        ?.email || null;

    await adminDb.collection('users').doc(user.uid).set(
      {
        googleProviderLinked: true,
        googleEmail,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    await createAuditLog(
      user.uid,
      user.role,
      'link_google',
      'user',
      user.uid,
      { googleEmail },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Akun Google berhasil dikaitkan',
      data: { googleProviderLinked: true, googleEmail },
    });
  } catch (error) {
    console.error('Google link error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
