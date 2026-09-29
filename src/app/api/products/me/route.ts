import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, productFiltersSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (!['penjual', 'staf_toko'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya penjual dan staf toko yang bisa mengakses' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: any;
    
    if (user.role === 'penjual') {
      query = adminDb.collection('products').where('sellerId', '==', user.uid);
    } else {
      // Staf toko - get products from assigned stores
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const storeIds = userData?.assignedStoreIds || [];
      
      if (storeIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: { items: [], total: 0, page, limit, hasMore: false },
        });
      }
      
      query = adminDb.collection('products').where('storeId', 'in', storeIds);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    query = query.orderBy('updatedAt', 'desc');

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorQuery = adminDb.collection('products');
      if (user.role === 'penjual') {
        cursorQuery.where('sellerId', '==', user.uid);
      } else {
        const userDoc = await adminDb.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        cursorQuery.where('storeId', 'in', userData?.assignedStoreIds || []);
      }
      if (status) cursorQuery.where('status', '==', status);
      cursorQuery.orderBy('updatedAt', 'desc').limit(offset);
      const cursorSnapshot = await cursorQuery.get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: products,
        total,
        page,
        limit,
        hasMore: products.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get my products error:', error);
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

    if (!['penjual', 'staf_toko'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya penjual dan staf toko yang bisa membuat produk' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { validateSchema, createProductSchema } = await import('@/lib/validation');
    const { success, data, errors } = validateSchema(createProductSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Get store info
    let storeId: string;
    if (user.role === 'penjual') {
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      storeId = userData?.storeId;
    } else {
      // Staf toko - need to specify storeId in request or use first assigned
      storeId = body.storeId;
      const userDoc = await adminDb.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      if (!userData?.assignedStoreIds?.includes(storeId)) {
        return NextResponse.json(
          { success: false, error: 'Anda tidak memiliki akses ke toko ini' },
          { status: 403 }
        );
      }
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 400 }
      );
    }

    const storeDoc = await adminDb.collection('stores').doc(storeId).get();
    if (!storeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 404 }
      );
    }
    const store = storeDoc.data()!;

    // Get category name
    const categoryDoc = await adminDb.collection('categories').doc(data.categoryId).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 400 }
      );
    }
    const categoryName = categoryDoc.data()!.name;

    // Create product
    const productRef = adminDb.collection('products').doc();
    const productData = {
      ...data,
      id: productRef.id,
      storeId,
      sellerId: user.uid,
      categoryName,
      images: data.images,
      status: data.status || 'draft',
      viewCount: 0,
      favoriteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await productRef.set(productData);

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: { id: productRef.id, ...productData },
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}