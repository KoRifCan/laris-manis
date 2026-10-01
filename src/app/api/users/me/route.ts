import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { toE164 } from '@/lib/phone';

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

    // Get store: prioritas dari userData.storeId, fallback kepemilikan ownerId
    let store = null;
    if (userData.storeId) {
      const storeDoc = await adminDb.collection('stores').doc(userData.storeId).get();
      if (storeDoc.exists) {
        store = { id: storeDoc.id, ...storeDoc.data() };
      }
    }
    if (!store) {
      const owned = await adminDb
        .collection('stores')
        .where('ownerId', '==', user.uid)
        .limit(1)
        .get();
      if (!owned.empty) {
        store = { id: owned.docs[0].id, ...owned.docs[0].data() };
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
        photoURL: userData.photoURL || null,
        address: userData.address || null,
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

    // Profil: nama, no HP, alamat, foto (data-URL hasil kompresi di klien)
    const allowedFields = ['displayName', 'phoneNumber', 'address', 'photoURL'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
      }
    }

    if (updates.displayName !== undefined && (updates.displayName.length < 2 || updates.displayName.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'Nama harus 2-100 karakter' },
        { status: 400 }
      );
    }
    if (updates.address !== undefined && updates.address.length > 300) {
      return NextResponse.json(
        { success: false, error: 'Alamat maksimal 300 karakter' },
        { status: 400 }
      );
    }
    if (updates.photoURL !== undefined) {
      const photo: string = updates.photoURL;
      const isValid = photo === '' || photo.startsWith('data:image/') || /^https:\/\//.test(photo);
      if (!isValid || photo.length > 300000) {
        return NextResponse.json(
          { success: false, error: 'Foto tidak valid atau terlalu besar (maks 300KB)' },
          { status: 400 }
        );
      }
    }
    if (updates.phoneNumber !== undefined && updates.phoneNumber !== '') {
      if (!toE164(updates.phoneNumber)) {
        return NextResponse.json(
          { success: false, error: 'Format nomor telepon tidak valid' },
          { status: 400 }
        );
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

    // Also update Firebase Auth profile (foto hanya disimpan di Firestore
    // karena data-URL melebihi batas field foto Firebase Auth)
    if (updates.displayName) {
      await adminAuth.updateUser(user.uid, { displayName: updates.displayName });
    }
    if (updates.phoneNumber !== undefined) {
      const e164 = updates.phoneNumber ? toE164(updates.phoneNumber) : null;
      try {
        await adminAuth.updateUser(user.uid, { phoneNumber: e164 });
      } catch (phoneErr: unknown) {
        // Nomor adalah data Firestore; bila Auth menolak (mis. nomor sudah
        // dipakai akun lain) jangan gagulkan seluruh update profil
        const code = (phoneErr as { code?: string })?.code;
        if (code !== 'auth/phone-number-already-exists' && code !== 'auth/invalid-phone-number') {
          throw phoneErr;
        }
      }
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