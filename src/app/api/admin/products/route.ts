import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

// List semua produk untuk moderasi (admin / super admin)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa mengakses' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    let query = adminDb.collection('products').orderBy('createdAt', 'desc').limit(limit);
    if (status) {
      query = adminDb
        .collection('products')
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .limit(limit);
    }

    const snapshot = await query.get();

    // Nama toko untuk setiap storeId (batch kecil)
    const storeIds = [...new Set(snapshot.docs.map(d => d.data().storeId).filter(Boolean))];
    const storeNames = new Map<string, { name: string; slug: string }>();
    await Promise.all(
      storeIds.map(async (sid) => {
        const s = await adminDb.collection('stores').doc(sid).get();
        if (s.exists) {
          const sd = s.data()!;
          storeNames.set(sid, { name: sd.name || '-', slug: sd.slug || '' });
        }
      })
    );

    const items = snapshot.docs.map((doc) => {
      const d = doc.data();
      const store = d.storeId ? storeNames.get(d.storeId) : undefined;
      return {
        id: doc.id,
        name: d.name,
        price: d.price,
        stock: d.stock,
        images: d.images ?? [],
        status: d.status,
        rejectionReason: d.rejectionReason ?? null,
        categoryId: d.categoryId,
        storeId: d.storeId,
        storeName: store?.name ?? '-',
        storeSlug: store?.slug ?? '',
        sellerId: d.sellerId,
        createdAt: d.createdAt?.toDate?.() ? d.createdAt.toDate().toISOString() : d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ? d.updatedAt.toDate().toISOString() : d.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: { items, total: items.length },
    });
  } catch (error: unknown) {
    console.error('Get products (admin) error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
