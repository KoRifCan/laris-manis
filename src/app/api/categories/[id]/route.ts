import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

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

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa update kategori' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = ['name', 'description', 'imageUrl', 'parentId', 'sortOrder', 'isActive'];
    const updates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada field yang valid untuk diupdate' },
        { status: 400 }
      );
    }

    // Check slug if name changed
    if (updates.name) {
      const newSlug = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const existing = await adminDb
        .collection('categories')
        .where('slug', '==', newSlug)
        .where('__name__', '!=', id)
        .limit(1)
        .get();
      
      if (!existing.empty) {
        return NextResponse.json(
          { success: false, error: 'Nama kategori sudah digunakan' },
          { status: 400 }
        );
      }
      
      updates.slug = newSlug;
    }

    updates.updatedAt = new Date();

    await adminDb.collection('categories').doc(id).update(updates);

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'update_category',
      'category',
      id,
      { changes: updates },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: updates,
    });
  } catch (error: any) {
    console.error('Update category error:', error);
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

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa hapus kategori' },
        { status: 403 }
      );
    }

    // Check if category has products
    const productsSnapshot = await adminDb.collection('products').where('categoryId', '==', id).limit(1).get();
    if (!productsSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Kategori masih memiliki produk, tidak bisa dihapus' },
        { status: 400 }
      );
    }

    await adminDb.collection('categories').doc(id).delete();

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'delete_category',
      'category',
      id,
      {},
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}