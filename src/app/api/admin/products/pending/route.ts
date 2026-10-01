import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
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
    })) as (Record<string, unknown> & { id: string; storeId?: string })[];

    // Fetch store info for each product (Firestore menolak filter 'in' dgn array kosong)
    const storeMap = new Map<string, Record<string, unknown>>();
    const storeIds = [...new Set(products.map(p => p.storeId).filter(Boolean))] as string[];
    for (let i = 0; i < storeIds.length; i += 30) {
      const chunk = storeIds.slice(i, i + 30);
      const storesSnapshot = await adminDb
        .collection('stores')
        .where('__name__', 'in', chunk)
        .get();
      storesSnapshot.docs.forEach(doc => storeMap.set(doc.id, doc.data() as Record<string, unknown>));
    }

    const productsWithStore = products.map(p => ({
      ...p,
      store: storeMap.get(p.storeId ?? '') ? { id: p.storeId, ...storeMap.get(p.storeId ?? '') } : null,
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
  } catch (error) {
    console.error('Get pending products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}