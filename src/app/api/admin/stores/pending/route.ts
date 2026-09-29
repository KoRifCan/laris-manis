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
      .collection('stores')
      .where('isVerified', '==', false)
      .orderBy('createdAt', 'asc');

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorSnapshot = await adminDb
        .collection('stores')
        .where('isVerified', '==', false)
        .orderBy('createdAt', 'asc')
        .limit(offset)
        .get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: stores,
        total,
        page,
        limit,
        hasMore: stores.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get pending stores error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}