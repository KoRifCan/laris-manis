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

  if (user.role === 'penjual' && product.sellerId === user.uid) {
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

    // Penjual can only delete non-active products
    if (user.role === 'penjual' && product.status === 'aktif') {
      return NextResponse.json(
        { success: false, error: 'Produk aktif tidak bisa dihapus, nonaktifkan dulu' },
        { status: 400 }
      );
    }

    // Staf toko cannot delete
    if (user.role === 'staf_toko') {
      return NextResponse.json(
        { success: false, error: 'Staf toko tidak bisa menghapus produk' },
        { status: 403 }
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