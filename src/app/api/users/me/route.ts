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

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Get store if exists
    let store = null;
    if (userData.storeId) {
      const storeDoc = await adminDb.collection('stores').doc(userData.storeId).get();
      if (storeDoc.exists) {
        store = { id: storeDoc.id, ...storeDoc.data() };
      }
    }

    // Get assigned stores for staf toko
    let assignedStores = [];
    if (userData.assignedStoreIds?.length) {
      const storesSnapshot = await adminDb
        .collection('stores')
        .where('__name__', 'in', userData.assignedStoreIds)
        .get();
      assignedStores = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    return NextResponse.json({
      success: true,
      data: {
        uid: user.uid,
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        emailVerified: userData.emailVerified,
        storeId: userData.storeId,
        assignedStoreIds: userData.assignedStoreIds,
        sellerApplicationStatus: userData.sellerApplicationStatus,
        sellerApplication: userData.sellerApplication,
        store,
        assignedStores,
        createdAt: userData.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
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
    const body = await request.json();

    // Only allow updating displayName and phoneNumber
    const allowedFields = ['displayName', 'phoneNumber'];
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

    updates.updatedAt = new Date();

    await adminDb.collection('users').doc(user.uid).update(updates);

    // Also update Firebase Auth profile
    if (updates.displayName) {
      await adminAuth.updateUser(user.uid, { displayName: updates.displayName });
    }
    if (updates.phoneNumber) {
      await adminAuth.updateUser(user.uid, { phoneNumber: updates.phoneNumber });
    }

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diupdate',
      data: updates,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}