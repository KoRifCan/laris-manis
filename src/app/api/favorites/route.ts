import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const favoritesRef = adminDb.collection('users').doc(user.uid).collection('favorites');

    // Status favorit untuk satu produk (dipakai tombol di halaman detail)
    const statusProductId = searchParams.get('productId');
    if (statusProductId) {
      const favDoc = await favoritesRef.doc(statusProductId).get();
      return NextResponse.json({
        success: true,
        data: { productId: statusProductId, isFavorite: favDoc.exists },
      });
    }
    
    const countSnapshot = await favoritesRef.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    let query = favoritesRef.orderBy('createdAt', 'desc').limit(limit);
    
    if (offset > 0) {
      const cursorSnapshot = await favoritesRef.orderBy('createdAt', 'desc').limit(offset).get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const favorites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: favorites,
        total,
        page,
        limit,
        hasMore: favorites.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get favorites error:', error);
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

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID wajib diisi' },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const productDoc = await adminDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    const product = productDoc.data()!;
    
    if (product.status !== 'aktif') {
      return NextResponse.json(
        { success: false, error: 'Produk tidak tersedia' },
        { status: 400 }
      );
    }

    // Get store info
    const storeDoc = await adminDb.collection('stores').doc(product.storeId).get();
    const store = storeDoc.data()!;

    const favoriteRef = adminDb.collection('users').doc(user.uid).collection('favorites').doc(productId);
    const existing = await favoriteRef.get();

    if (existing.exists) {
      // Remove from favorites
      await favoriteRef.delete();
      
      // Decrement favorite count
      await adminDb.collection('products').doc(productId).update({
        favoriteCount: FieldValue.increment(-1),
      });

      return NextResponse.json({
        success: true,
        message: 'Produk dihapus dari favorit',
        data: { isFavorite: false },
      });
    } else {
      // Add to favorites
      await favoriteRef.set({
        productId,
        productName: product.name,
        productImage: product.images[0] || '',
        storeId: product.storeId,
        storeName: store.name,
        storeSlug: store.slug || '',
        price: product.price,
        createdAt: new Date(),
      });

      // Increment favorite count
      await adminDb.collection('products').doc(productId).update({
        favoriteCount: FieldValue.increment(1),
      });

      return NextResponse.json({
        success: true,
        message: 'Produk ditambahkan ke favorit',
        data: { isFavorite: true },
      });
    }
  } catch (error: any) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}