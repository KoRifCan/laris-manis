import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

export async function POST(
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

    if (!['penjual', 'staf_toko'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya penjual dan staf toko yang bisa submit review' },
        { status: 403 }
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

    // Kepemilikan: penjual pemilik produk, pemilik toko, atau staf yang ditugasi
    const storeDoc = await adminDb.collection('stores').doc(product.storeId).get();
    const isSeller = product.sellerId === user.uid;
    const isStoreOwner = storeDoc.exists && storeDoc.data()!.ownerId === user.uid;
    const isAssignedStaff =
      user.role === 'staf_toko' && user.assignedStoreIds?.includes(product.storeId);

    if (!isSeller && !isStoreOwner && !isAssignedStaff) {
      return NextResponse.json(
        { success: false, error: 'Produk ini bukan milik Anda' },
        { status: 403 }
      );
    }

    // Validate product is ready for review
    if (product.status !== 'draft' && product.status !== 'ditolak') {
      return NextResponse.json(
        { success: false, error: 'Produk harus berstatus draft atau ditolak untuk submit review' },
        { status: 400 }
      );
    }

    // Check required fields
    if (!product.name || !product.description || !product.categoryId || 
        !product.price || product.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Produk belum lengkap: nama, deskripsi, kategori, harga, dan minimal 1 foto wajib diisi' },
        { status: 400 }
      );
    }

    await adminDb.collection('products').doc(id).update({
      status: 'menunggu_review',
      updatedAt: new Date(),
    });

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'submit_product_review',
      'product',
      id,
      { productName: product.name },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dikirim untuk review admin',
      data: { id, status: 'menunggu_review' },
    });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}