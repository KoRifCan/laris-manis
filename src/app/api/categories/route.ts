import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { authenticateRequest, requireRole } from '@/lib/api-auth';
import { validateSchema, createCategorySchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const snapshot = await adminDb
      .collection('categories')
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();

    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
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

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa membuat kategori' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(createCategorySchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await adminDb.collection('categories').where('slug', '==', data.slug).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: 'Slug sudah digunakan' },
        { status: 400 }
      );
    }

    const categoryRef = adminDb.collection('categories').doc();
    const categoryData = {
      ...data,
      id: categoryRef.id,
      productCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await categoryRef.set(categoryData);

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'create_category',
      'category',
      categoryRef.id,
      { name: data.name, slug: data.slug },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: categoryData,
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}