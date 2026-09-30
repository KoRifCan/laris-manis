import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, applySellerSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/rbac';

// Buat slug unik dari nama toko (kecuali milik toko tertentu).
async function generateUniqueSlug(name: string, excludeStoreId?: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await adminDb.collection('stores').where('slug', '==', slug).limit(1).get();
    if (existing.empty || existing.docs[0].id === excludeStoreId) break;
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

// POST: ajukan jadi penjual.
// Alur: buat/tinjau-ulang dokumen toko berstatus reviewStatus 'pending'
// → admin memverifikasi lewat /api/admin/stores/[id]/verify
// → setelah disetujui, role penjual disematkan dan akun yang sama bisa
//    berganti mode Belanja / Kelola Toko. Kepemilikan toko (ownerId)
//    adalah sumber kebenaran, bukan role tunggal eksklusif.
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const { success, data, errors } = validateSchema(applySellerSchema, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Validasi gagal', details: errors },
        { status: 400 }
      );
    }

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    // Gate berbasis kepemilikan/status toko, bukan role
    let existingStoreId = userData?.storeId as string | undefined;
    if (existingStoreId) {
      const storeDoc = await adminDb.collection('stores').doc(existingStoreId).get();
      if (storeDoc.exists) {
        const store = storeDoc.data()!;
        if (store.isVerified || userData?.sellerApplicationStatus === 'approved') {
          return NextResponse.json(
            { success: false, error: 'Anda sudah menjadi penjual' },
            { status: 400 }
          );
        }
        if (store.reviewStatus === 'pending' || userData?.sellerApplicationStatus === 'pending') {
          return NextResponse.json(
            { success: false, error: 'Anda sudah mengajukan, menunggu verifikasi admin' },
            { status: 400 }
          );
        }
        // reviewStatus 'rejected' → ajukan ulang: perbarui toko yang sama
      } else {
        existingStoreId = undefined;
      }
    }

    const application = {
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      storeAddress: data.storeAddress,
      storeCity: data.storeCity,
      storeProvince: data.storeProvince,
      storePhone: data.storePhone,
      storeWhatsapp: data.storeWhatsapp,
      appliedAt: new Date(),
    };

    const storeFields = {
      name: data.storeName,
      description: data.storeDescription,
      address: data.storeAddress,
      city: data.storeCity,
      province: data.storeProvince,
      phone: data.storePhone,
      whatsapp: data.storeWhatsapp,
    };

    let storeId: string;

    if (existingStoreId) {
      // Ajukan ulang setelah ditolak
      storeId = existingStoreId;
      const slug = await generateUniqueSlug(data.storeName, storeId);
      await adminDb.collection('stores').doc(storeId).update({
        ...storeFields,
        slug,
        reviewStatus: 'pending',
        isVerified: false,
        updatedAt: new Date(),
      });
    } else {
      // Pengajuan baru → buat dokumen toko (belum tayang sampai disetujui)
      const slug = await generateUniqueSlug(data.storeName);
      const storeRef = adminDb.collection('stores').doc();
      storeId = storeRef.id;
      await storeRef.set({
        ...storeFields,
        id: storeId,
        ownerId: user.uid,
        slug,
        isVerified: false,
        reviewStatus: 'pending',
        rating: 0,
        reviewCount: 0,
        productCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await adminDb.collection('users').doc(user.uid).update({
      storeId,
      sellerApplication: application,
      sellerApplicationStatus: 'pending',
      sellerApplicationRejectionReason: null,
      updatedAt: new Date(),
    });

    await createAuditLog(
      user.uid,
      user.role,
      'apply_seller',
      'store',
      storeId,
      { storeName: data.storeName, storeCity: data.storeCity },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Pengajuan menjadi penjual berhasil dikirim. Menunggu verifikasi admin.',
      data: { storeId },
    });
  } catch (error: any) {
    console.error('Apply seller error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// GET endpoint to check application status
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        status: userData?.sellerApplicationStatus || 'none',
        application: userData?.sellerApplication || null,
      },
    });
  } catch (error: any) {
    console.error('Get seller application error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
