import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, updateProductSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

async function checkProductAccess(user: any, productId: string) {
  const productDoc = await adminDb.collection('products').doc(productId).get();
  
  if (!productDoc.exists) {
    return { success: false, error: 'Produk tidak ditemukan', status: 404 };
  }

  const product = productDoc.data()!;
  
  if (user.role === 'super_admin' || user.role === 'admin') {
    return { success: true, product, productDoc };
  }

  // Pemilik: pembuat produk ATAU pemilik toko produknya
  // (role bisa masih 'pembeli' selama verifikasi toko berjalan)
  if (product.sellerId === user.uid) {
    return { success: true, product, productDoc };
  }

  const storeDoc = await adminDb.collection('stores').doc(product.storeId).get();
  if (storeDoc.exists && storeDoc.data()!.ownerId === user.uid) {
    return { success: true, product, productDoc };
  }

  if (user.role === 'staf_toko') {
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    if (userData?.assignedStoreIds?.includes(product.storeId)) {
      return { success: true, product, productDoc };
    }
  }

  return { success: false, error: 'Anda tidak memiliki akses ke produk ini', status: 403 };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productDoc = await adminDb.collection('products').doc(id).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    const product = { id: productDoc.id, ...productDoc.data()! };

    // Autentikasi opsional: publik hanya boleh melihat produk aktif;
    // pemilik/staf/admin boleh melihat produk non-aktif (preview)
    let user: any = null;
    if (request.headers.get('authorization')) {
      const authResult = await authenticateRequest(request);
      if (!(authResult instanceof NextResponse)) {
        user = authResult.user;
      }
    }

    if (product.status !== 'aktif') {
      let allowed = user && ['super_admin', 'admin'].includes(user.role);
      if (user && !allowed) {
        if (product.sellerId === user.uid) {
          allowed = true;
        } else {
          const storeDoc = product.storeId
            ? await adminDb.collection('stores').doc(product.storeId).get()
            : null;
          if (storeDoc?.exists && storeDoc.data()!.ownerId === user.uid) {
            allowed = true;
          } else if (user.role === 'staf_toko') {
            const userDoc = await adminDb.collection('users').doc(user.uid).get();
            allowed = !!userDoc.data()?.assignedStoreIds?.includes(product.storeId);
          }
        }
      }
      if (!allowed) {
        return NextResponse.json(
          { success: false, error: 'Produk tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    // Gabung info toko (halaman detail /produk/[id] butuh field store*)
    let store: Record<string, any> | null = null;
    if (product.storeId) {
      const storeDoc = await adminDb.collection('stores').doc(product.storeId).get();
      if (storeDoc.exists) {
        store = { id: storeDoc.id, ...storeDoc.data()! };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        product: {
          ...product,
          storeName: store?.name || '',
          storeSlug: store?.slug || '',
          storeLogoUrl: store?.logoUrl || null,
          storeDescription: store?.description || '',
          storeCity: store?.city || '',
          storeProvince: store?.province || '',
          storePhone: store?.phone || '',
          storeWhatsapp: store?.whatsapp || '',
          storeIsVerified: !!store?.isVerified,
          storeRating: typeof store?.rating === 'number' ? store.rating : 0,
          storeReviewCount: store?.reviewCount || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const accessCheck = await checkProductAccess(user, id);
    if (!accessCheck.success) {
      return NextResponse.json(
        { success: false, error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { product } = accessCheck;
    const body = await request.json();
    const { success, data, errors } = validateSchema(updateProductSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Penjual/Staf can't change status to aktif directly
    if (data.status === 'aktif' && !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya admin yang bisa mengaktifkan produk' },
        { status: 403 }
      );
    }

    // If categoryId changed, get new category name
    let categoryName = product.categoryName;
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const categoryDoc = await adminDb.collection('categories').doc(data.categoryId).get();
      if (!categoryDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Kategori tidak ditemukan' },
          { status: 400 }
        );
      }
      categoryName = categoryDoc.data()!.name;
    }

    const updates = {
      ...data,
      categoryName,
      updatedAt: new Date(),
    };

    await adminDb.collection('products').doc(id).update(updates);

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'update_product',
      'product',
      id,
      { changes: data },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: { id, ...product, ...updates },
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const accessCheck = await checkProductAccess(user, id);
    if (!accessCheck.success) {
      return NextResponse.json(
        { success: false, error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { product } = accessCheck;

    // Staf toko cannot delete
    if (user.role === 'staf_toko') {
      return NextResponse.json(
        { success: false, error: 'Staf toko tidak bisa menghapus produk' },
        { status: 403 }
      );
    }

    // Pemilik (non-admin) hanya bisa menghapus produk non-aktif
    if (!['admin', 'super_admin'].includes(user.role) && product.status === 'aktif') {
      return NextResponse.json(
        { success: false, error: 'Produk aktif tidak bisa dihapus, nonaktifkan dulu' },
        { status: 400 }
      );
    }

    await adminDb.collection('products').doc(id).delete();

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'delete_product',
      'product',
      id,
      { productName: product.name },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}