import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (slug) {
      // Get store by slug
      const snapshot = await adminDb
        .collection('stores')
        .where('slug', '==', slug)
        .where('isVerified', '==', true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { success: false, error: 'Toko tidak ditemukan' },
          { status: 404 }
        );
      }

      const store = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

      // Get store products
      const productsSnapshot = await adminDb
        .collection('products')
        .where('storeId', '==', store.id)
        .where('status', '==', 'aktif')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({
        success: true,
        data: { store, products },
      });
    }

    // List all verified stores
    let query = adminDb
      .collection('stores')
      .where('isVerified', '==', true)
      .orderBy('rating', 'desc');

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorSnapshot = await adminDb
        .collection('stores')
        .where('isVerified', '==', true)
        .orderBy('rating', 'desc')
        .limit(offset)
        .get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: stores,
        total,
        page,
        limit,
        hasMore: stores.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get stores error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}