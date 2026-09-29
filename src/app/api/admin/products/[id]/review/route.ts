import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { validateSchema, reviewProductSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

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
        { success: false, error: 'Hanya admin yang bisa review produk' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(reviewProductSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const productDoc = await adminDb.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    const product = productDoc.data()!;

    if (product.status !== 'menunggu_review') {
      return NextResponse.json(
        { success: false, error: 'Produk tidak dalam status menunggu review' },
        { status: 400 }
      );
    }

    const newStatus = data.action === 'approve' ? 'aktif' : 'ditolak';
    const updates: any = {
      status: newStatus,
      reviewedBy: user.uid,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (data.action === 'reject') {
      if (!data.reason) {
        return NextResponse.json(
          { success: false, error: 'Alasan penolakan wajib diisi' },
          { status: 400 }
        );
      }
      updates.rejectionReason = data.reason;
    } else {
      updates.publishedAt = new Date();
      // Increment store product count
      await adminDb.collection('stores').doc(product.storeId).update({
        productCount: FieldValue.increment(1),
      });
    }

    await adminDb.collection('products').doc(id).update(updates);

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      data.action === 'approve' ? 'approve_product' : 'reject_product',
      'product',
      id,
      { 
        productName: product.name,
        storeId: product.storeId,
        reason: data.reason,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: `Produk berhasil ${data.action === 'approve' ? 'disetujui' : 'ditolak'}`,
      data: { id, status: newStatus, rejectionReason: data.reason },
    });
  } catch (error: any) {
    console.error('Review product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}