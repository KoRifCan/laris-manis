import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, createReviewSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const storeId = searchParams.get('storeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId && !storeId) {
      return NextResponse.json(
        { success: false, error: 'Product ID atau Store ID wajib diisi' },
        { status: 400 }
      );
    }

    let query = adminDb.collection('reviews').orderBy('createdAt', 'desc');
    
    if (productId) {
      query = query.where('productId', '==', productId);
    } else if (storeId) {
      query = query.where('storeId', '==', storeId);
    }

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorQuery = adminDb.collection('reviews').orderBy('createdAt', 'desc');
      if (productId) cursorQuery.where('productId', '==', productId);
      if (storeId) cursorQuery.where('storeId', '==', storeId);
      cursorQuery.limit(offset);
      const cursorSnapshot = await cursorQuery.get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        limit,
        hasMore: reviews.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== 'pembeli') {
      return NextResponse.json(
        { success: false, error: 'Hanya pembeli yang bisa memberi ulasan' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(createReviewSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const productDoc = await adminDb.collection('products').doc(data.productId).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    const product = productDoc.data()!;
    
    if (product.status !== 'aktif') {
      return NextResponse.json(
        { success: false, error: 'Produk tidak tersedia untuk diulas' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await adminDb
      .collection('reviews')
      .where('productId', '==', data.productId)
      .where('buyerId', '==', user.uid)
      .limit(1)
      .get();
    
    if (!existingReview.empty) {
      return NextResponse.json(
        { success: false, error: 'Anda sudah mengulas produk ini' },
        { status: 400 }
      );
    }

    // Get store info
    const storeDoc = await adminDb.collection('stores').doc(product.storeId).get();
    if (!storeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get user name
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data()!;

    const reviewRef = adminDb.collection('reviews').doc();
    const reviewData = {
      ...data,
      id: reviewRef.id,
      storeId: product.storeId,
      buyerId: user.uid,
      buyerName: userData.displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await reviewRef.set(reviewData);

    // Update store rating (simple average)
    const reviewsSnapshot = await adminDb
      .collection('reviews')
      .where('storeId', '==', product.storeId)
      .get();
    
    let totalRating = 0;
    reviewsSnapshot.docs.forEach(doc => {
      totalRating += doc.data().rating;
    });
    const avgRating = totalRating / reviewsSnapshot.size;

    await adminDb.collection('stores').doc(product.storeId).update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviewsSnapshot.size,
    });

    // Update product review count
    const productReviewsSnapshot = await adminDb
      .collection('reviews')
      .where('productId', '==', data.productId)
      .get();

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'create_review',
      'review',
      reviewRef.id,
      { productId: data.productId, rating: data.rating },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Ulasan berhasil ditambahkan',
      data: reviewData,
    });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}