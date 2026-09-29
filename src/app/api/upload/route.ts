import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { put } from '@vercel/blob';
import { createAuditLog } from '@/lib/rbac';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (!['penjual', 'staf_toko'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Hanya penjual dan staf toko yang bisa upload foto' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 2MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = file.type.split('/')[1];
    const filename = `products/${user.uid}/${timestamp}-${random}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Audit log
    await createAuditLog(
      user.uid,
      user.role,
      'upload_product_image',
      'product',
      'temp',
      { url: blob.url, size: file.size, type: file.type },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil diupload',
      data: { url: blob.url },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}