import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { validateSchema, changeRoleSchema, createUserSchema } from '@/lib/validation';
import { createAuditLog, setUserRole } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa mengakses' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') || undefined;

    let query = adminDb.collection('users').orderBy('createdAt', 'desc');
    
    if (role) {
      query = query.where('role', '==', role);
    }

    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    const offset = (page - 1) * limit;
    query = query.limit(limit);
    
    if (offset > 0) {
      const cursorQuery = adminDb.collection('users').orderBy('createdAt', 'desc');
      if (role) cursorQuery.where('role', '==', role);
      cursorQuery.limit(offset);
      const cursorSnapshot = await cursorQuery.get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: users,
        total,
        page,
        limit,
        hasMore: users.length === limit,
      },
    });
  } catch (error: unknown) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
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

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa mengubah role' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(changeRoleSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    // Prevent changing own role
    if (data.uid === user.uid) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa mengubah role sendiri' },
        { status: 400 }
      );
    }

    const targetUser = await adminAuth.getUser(data.uid);
    const targetUserDoc = await adminDb.collection('users').doc(data.uid).get();
    const targetData = targetUserDoc.data();

    if (targetData?.role === 'super_admin' && data.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa menurunkan role super admin lain' },
        { status: 400 }
      );
    }

    const result = await setUserRole(data.uid, data.role);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'change_role',
      'user',
      data.uid,
      { 
        oldRole: targetData?.role,
        newRole: data.role,
        targetEmail: targetUser.email,
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Role berhasil diubah',
    });
  } catch (error: unknown) {
    console.error('Change role error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
// Buat akun baru (Admin / Staf Toko / Penjual / Pembeli) dari dashboard super admin
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Hanya super admin yang bisa membuat akun' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { success, data, errors } = validateSchema(createUserSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    if (data.role === 'staf_toko' && !data.storeId) {
      return NextResponse.json(
        { success: false, error: 'Staf toko harus ditugaskan ke sebuah toko' },
        { status: 400 }
      );
    }

    // Cek email belum terpakai
    try {
      await adminAuth.getUserByEmail(data.email);
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    } catch (checkErr: unknown) {
      const code = (checkErr as { code?: string })?.code;
      if (code !== 'auth/user-not-found') throw checkErr;
    }

    // Verifikasi toko bila staf ditugaskan
    if (data.storeId) {
      const storeDoc = await adminDb.collection('stores').doc(data.storeId).get();
      if (!storeDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Toko tujuan tidak ditemukan' },
          { status: 400 }
        );
      }
    }

    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
      emailVerified: false,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: data.role });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      assignedStoreIds: data.role === 'staf_toko' && data.storeId ? [data.storeId] : [],
      phoneNumber: null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createAuditLog(
      user.uid,
      user.role,
      'create_user',
      'user',
      userRecord.uid,
      { email: data.email, role: data.role, storeId: data.storeId || null },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat',
      data: { uid: userRecord.uid, email: data.email, role: data.role },
    });
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    if (e?.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: e?.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
