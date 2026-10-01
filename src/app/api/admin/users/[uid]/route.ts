import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { createAuditLog } from '@/lib/rbac';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { uid } = await params;

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa menghapus user' },
        { status: 403 }
      );
    }

    if (uid === user.uid) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menghapus akun sendiri' },
        { status: 400 }
      );
    }

    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const targetData = userDoc.data()!;

    if (targetData.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menghapus super admin lain' },
        { status: 400 }
      );
    }

    // Hapus dari Firebase Auth (best-effort bila sudah tidak ada)
    let authDeleted = false;
    try {
      await adminAuth.deleteUser(uid);
      authDeleted = true;
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code !== 'auth/user-not-found') {
        console.error('Delete auth user error:', err);
      }
    }

    // Hapus dokumen Firestore dan data terkait milik user
    const batch = adminDb.batch();
    batch.delete(adminDb.collection('users').doc(uid));
    if (targetData.storeId) {
      batch.delete(adminDb.collection('stores').doc(targetData.storeId));
    }
    const favSnapshot = await adminDb
      .collection('favorites')
      .where('userId', '==', uid)
      .limit(500)
      .get();
    favSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    await createAuditLog(
      user.uid,
      user.role,
      'delete_user',
      'user',
      uid,
      {
        targetEmail: targetData.email,
        targetRole: targetData.role,
        authDeleted,
        storeId: targetData.storeId || null,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}
