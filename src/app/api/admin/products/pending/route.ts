import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (!['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa mengakses' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = adminDb
      .collection('products')
      .where('status', '==', 'menunggu_review')
      .orderBy('updatedAt', 'asc'); // Oldest first (FIFO)

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorSnapshot = await adminDb
        .collection('products')
        .where('status', '==', 'menunggu_review')
        .orderBy('updatedAt', 'asc')
        .limit(offset)
        .get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch store info for each product
    const storeIds = [...new Set(products.map(p => p.storeId))];
    const storesSnapshot = await adminDb
      .collection('stores')
      .where('__name__', 'in', storeIds)
      .get();
    const storeMap = new Map();
    storesSnapshot.docs.forEach(doc => storeMap.set(doc.id, doc.data()));

    const productsWithStore = products.map(p => ({
      ...p,
      store: storeMap.get(p.storeId) ? { id: p.storeId, ...storeMap.get(p.storeId) } : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: productsWithStore,
        total,
        page,
        limit,
        hasMore: products.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get pending products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}