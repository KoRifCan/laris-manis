import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, productFiltersSchema } from '@/lib/validation';

// Izin berbasis kepemilikan toko: pemilik toko (role apa pun, termasuk
// penjual yang menunggu verifikasi) & staf toko yang ditugaskan.
async function getOwnedStoreIds(user: { uid: string; role: string; assignedStoreIds?: string[] }): Promise<string[]> {
  if (user.role === 'staf_toko') {
    return user.assignedStoreIds ?? [];
  }
  const userDoc = await adminDb.collection('users').doc(user.uid).get();
  const userData = userDoc.data();
  if (userData?.storeId) return [userData.storeId];
  const snapshot = await adminDb.collection('stores').where('ownerId', '==', user.uid).limit(3).get();
  return snapshot.docs.map(doc => doc.id);
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const ownedStoreIds = await getOwnedStoreIds(user);
    if (!['penjual', 'staf_toko', 'admin', 'super_admin'].includes(user.role) && ownedStoreIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Anda belum memiliki toko' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query: any;
    
    if (user.role !== 'staf_toko') {
      // Pemilik toko melihat produk yang ia buat (sellerId = pembuat produk)
      query = adminDb.collection('products').where('sellerId', '==', user.uid);
    } else {
      // Staf toko - get products from assigned stores
      const storeIds = ownedStoreIds;

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
      if (user.role !== 'staf_toko') {
        cursorQuery.where('sellerId', '==', user.uid);
      } else {
        cursorQuery.where('storeId', 'in', ownedStoreIds);
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

    const ownedStoreIdsPost = await getOwnedStoreIds(user);
    if (!['penjual', 'staf_toko', 'admin', 'super_admin'].includes(user.role) && ownedStoreIdsPost.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Anda belum memiliki toko. Ajukan toko dulu lewat halaman Jadi Penjual.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    // Foto kosong → placeholder lokal supaya produk selalu punya gambar
    if (!Array.isArray(body.images) || body.images.filter((v: string) => typeof v === 'string' && v).length === 0) {
      body.images = ['/products/ph-umum.png'];
    }
    const { validateSchema, createProductSchema } = await import('@/lib/validation');
    const { success, data, errors } = validateSchema(createProductSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Get store info — pemilik pakai tokonya sendiri, staf wajib menentukan storeId
    let storeId: string;
    if (user.role !== 'staf_toko') {
      storeId = ownedStoreIdsPost[0];
    } else {
      storeId = body.storeId;
      if (!ownedStoreIdsPost.includes(storeId)) {
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

    // Produk baru hanya boleh dibuat setelah toko disetujui admin
    if (!store.isVerified && !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Toko belum terverifikasi admin. Penambahan produk dibuka setelah pengajuan disetujui.' },
        { status: 403 }
      );
    }

    // Get category name
    const categoryDoc = await adminDb.collection('categories').doc(data.categoryId).get();
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 400 }
      );
    }
    const categoryName = categoryDoc.data()!.name;

    // Sesuaikan placeholder generik dengan kategori
    const placeholderFor = (name: string) => {
      const n = (name || '').toLowerCase();
      if (n.includes('makanan')) return '/products/ph-makanan.png';
      if (n.includes('minuman')) return '/products/ph-minuman.png';
      if (n.includes('fashion') || n.includes('pakaian')) return '/products/ph-fashion.png';
      if (n.includes('kriya') || n.includes('kerajinan')) return '/products/ph-kriya.png';
      if (n.includes('elektronik') || n.includes('gadget')) return '/products/ph-elektronik.png';
      return '/products/ph-umum.png';
    };
    if (data.images.length === 1 && data.images[0] === '/products/ph-umum.png') {
      data.images = [placeholderFor(categoryName)];
    }

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