import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, createStoreSchema, updateStoreSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Kepemilikan toko diambil dari dokumen user (bukan role tunggal),
    // sehingga akun dengan mode ganda tetap bisa mengelola tokonya.
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.storeId) {
      return NextResponse.json(
        { success: false, error: 'Anda belum memiliki toko' },
        { status: 404 }
      );
    }

    const storeDoc = await adminDb.collection('stores').doc(userData.storeId).get();
    
    if (!storeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: storeDoc.id, ...storeDoc.data() },
    });
  } catch (error: any) {
    console.error('Get my store error:', error);
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

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (userData?.storeId) {
      return NextResponse.json(
        { success: false, error: 'Anda sudah memiliki toko' },
        { status: 400 }
      );
    }

    if (userData?.sellerApplicationStatus !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Pengajuan menjadi penjual belum disetujui' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(createStoreSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Generate slug from store name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Check slug uniqueness
    while (true) {
      const existing = await adminDb.collection('stores').where('slug', '==', slug).limit(1).get();
      if (existing.empty) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const storeRef = adminDb.collection('stores').doc();
    const storeData = {
      ...data,
      id: storeRef.id,
      ownerId: user.uid,
      slug,
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storeRef.set(storeData);

    // Update user with storeId
    await adminDb.collection('users').doc(user.uid).update({
      storeId: storeRef.id,
      updatedAt: new Date(),
    });

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'create_store',
      'store',
      storeRef.id,
      { storeName: data.name },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Toko berhasil dibuat',
      data: storeData,
    });
  } catch (error: any) {
    console.error('Create store error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.storeId) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(updateStoreSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // If name changed, check slug
    if (data.name) {
      const newSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const existing = await adminDb
        .collection('stores')
        .where('slug', '==', newSlug)
        .where('__name__', '!=', userData.storeId)
        .limit(1)
        .get();
      
      if (!existing.empty) {
        return NextResponse.json(
          { success: false, error: 'Nama toko sudah digunakan' },
          { status: 400 }
        );
      }
      
      data.slug = newSlug;
    }

    const updates = {
      ...data,
      updatedAt: new Date(),
    };

    await adminDb.collection('stores').doc(userData.storeId).update(updates);

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'update_store',
      'store',
      userData.storeId,
      { changes: data },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Toko berhasil diupdate',
      data: updates,
    });
  } catch (error: any) {
    console.error('Update store error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}