import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { validateSchema, applySellerSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only pembeli can apply
    if (user.role !== 'pembeli') {
      return NextResponse.json(
        { success: false, error: 'Hanya pembeli yang bisa mengajukan jadi penjual' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(applySellerSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Check if already applied
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (userData?.sellerApplicationStatus === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Anda sudah mengajukan, menunggu verifikasi admin' },
        { status: 400 }
      );
    }

    if (userData?.sellerApplicationStatus === 'approved') {
      return NextResponse.json(
        { success: false, error: 'Anda sudah menjadi penjual' },
        { status: 400 }
      );
    }

    // Store application
    await adminDb.collection('users').doc(user.uid).update({
      sellerApplication: {
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        storeAddress: data.storeAddress,
        storeCity: data.storeCity,
        storeProvince: data.storeProvince,
        storePhone: data.storePhone,
        storeWhatsapp: data.storeWhatsapp,
        appliedAt: new Date(),
      },
      sellerApplicationStatus: 'pending',
      updatedAt: new Date(),
    });

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'apply_seller',
      'user',
      user.uid,
      { storeName: data.storeName, storeCity: data.storeCity },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Pengajuan menjadi penjual berhasil dikirim. Menunggu verifikasi admin.',
    });
  } catch (error: any) {
    console.error('Apply seller error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// GET endpoint to check application status
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        status: userData?.sellerApplicationStatus || 'none',
        application: userData?.sellerApplication || null,
      },
    });
  } catch (error: any) {
    console.error('Get seller application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}