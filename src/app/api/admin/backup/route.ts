import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

const COLLECTIONS = [
  'users',
  'stores',
  'products',
  'categories',
  'favorites',
  'reviews',
  'auditLogs',
] as const;

const MAX_DOCS_PER_COLLECTION = 10000;

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa melakukan backup' },
        { status: 403 }
      );
    }

    const collections: Record<string, unknown[]> = {};

    for (const name of COLLECTIONS) {
      const snapshot = await adminDb
        .collection(name)
        .limit(MAX_DOCS_PER_COLLECTION)
        .get();
      collections[name] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const body = JSON.stringify(
      {
        app: 'laris-manis',
        exportedAt: new Date().toISOString(),
        collections,
      },
      null,
      2
    );

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="laris-manis-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
