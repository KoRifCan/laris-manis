import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { createAuditLog } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'logout',
      'user',
      user.uid,
      {},
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    // Client should handle token removal
    return NextResponse.json({
      success: true,
      message: 'Logout berhasil. Hapus token di client.',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}