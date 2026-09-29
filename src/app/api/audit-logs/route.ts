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

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa mengakses audit log' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const actorId = searchParams.get('actorId') || undefined;
    const targetType = searchParams.get('targetType') || undefined;
    const targetId = searchParams.get('targetId') || undefined;
    const action = searchParams.get('action') || undefined;

    let query = adminDb.collection('auditLogs').orderBy('createdAt', 'desc');
    
    if (actorId) {
      query = query.where('actorId', '==', actorId);
    }
    if (targetType) {
      query = query.where('targetType', '==', targetType);
    }
    if (targetId) {
      query = query.where('targetId', '==', targetId);
    }
    if (action) {
      query = query.where('action', '==', action);
    }

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorQuery = adminDb.collection('auditLogs').orderBy('createdAt', 'desc');
      if (actorId) cursorQuery.where('actorId', '==', actorId);
      if (targetType) cursorQuery.where('targetType', '==', targetType);
      if (targetId) cursorQuery.where('targetId', '==', targetId);
      if (action) cursorQuery.where('action', '==', action);
      cursorQuery.limit(offset);
      const cursorSnapshot = await cursorQuery.get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: logs,
        total,
        page,
        limit,
        hasMore: logs.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}