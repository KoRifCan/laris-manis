import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { validateSchema, verifyStoreSchema } from '@/lib/validation';
import { createAuditLog, setUserRole } from '@/lib/rbac';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = await params;

    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa verifikasi toko' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(verifyStoreSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const storeDoc = await adminDb.collection('stores').doc(id).get();
    
    if (!storeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 404 }
      );
    }

    const store = storeDoc.data()!;

    if (store.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Toko sudah terverifikasi' },
        { status: 400 }
      );
    }

    if (data.action === 'approve') {
      // Update store
      await adminDb.collection('stores').doc(id).update({
        isVerified: true,
        reviewStatus: 'approved',
        verifiedAt: new Date(),
        verifiedBy: user.uid,
        updatedAt: new Date(),
      });

      // Update user role to penjual
      await setUserRole(store.ownerId, 'penjual');

      // Update user with storeId
      await adminDb.collection('users').doc(store.ownerId).update({
        storeId: id,
        sellerApplicationStatus: 'approved',
        updatedAt: new Date(),
      });

    } else {
      // Reject - tandai toko ditolak & update status pengajuan user
      await adminDb.collection('stores').doc(id).update({
        reviewStatus: 'rejected',
        rejectedAt: new Date(),
        updatedAt: new Date(),
      });
      await adminDb.collection('users').doc(store.ownerId).update({
        sellerApplicationStatus: 'rejected',
        sellerApplicationRejectionReason: data.reason,
        updatedAt: new Date(),
      });
    }

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      data.action === 'approve' ? 'verify_store' : 'reject_store',
      'store',
      id,
      { 
        storeName: store.name,
        ownerId: store.ownerId,
        reason: data.reason,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Toko berhasil ${data.action === 'approve' ? 'diverifikasi' : 'ditolak'}`,
    });
  } catch (error: any) {
    console.error('Verify store error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}