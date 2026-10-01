import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  displayName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const applySellerSchema = z.object({
  storeName: z.string().min(2, 'Nama toko minimal 2 karakter').max(100),
  storeDescription: z.string().min(10, 'Deskripsi minimal 10 karakter').max(1000),
  storeAddress: z.string().min(5, 'Alamat minimal 5 karakter').max(200),
  storeCity: z.string().min(2, 'Kota wajib diisi').max(50),
  storeProvince: z.string().min(2, 'Provinsi wajib diisi').max(50),
  storePhone: z.string().min(10, 'Nomor telepon tidak valid').max(20),
  storeWhatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid').max(20),
});

// Sumber gambar: path lokal (mulai dengan /) atau URL http(s)
const imageSrc = z
  .string()
  .refine((v) => v.startsWith('/') || /^https?:\/\//.test(v), 'URL gambar tidak valid');

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nama produk minimal 2 karakter').max(100),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter').max(5000),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  price: z.number().int().positive('Harga harus berupa angka positif'),
  stock: z.number().int().nonnegative('Stok tidak boleh negatif'),
  images: z.array(imageSrc).min(1, 'Minimal 1 foto').max(5, 'Maksimal 5 foto'),
  status: z.enum(['draft', 'menunggu_review']).default('draft'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(5000).optional(),
  categoryId: z.string().optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(imageSrc).min(1).max(5).optional(),
  status: z.enum(['draft', 'menunggu_review', 'aktif', 'nonaktif', 'ditolak']).optional(),
});

export const createStoreSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  province: z.string().min(2).max(50),
  phone: z.string().min(10).max(20),
  whatsapp: z.string().min(10).max(20),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  address: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(50).optional(),
  province: z.string().min(2).max(50).optional(),
  phone: z.string().min(10).max(20).optional(),
  whatsapp: z.string().min(10).max(20).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const reviewProductSchema = z.object({
  // productId diambil dari path param, field body bersifat opsional
  productId: z.string().min(1).optional(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
});

export const verifyStoreSchema = z.object({
  // storeId diambil dari path param, field body bersifat opsional
  storeId: z.string().min(1).optional(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
});

export const changeRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(['pembeli', 'penjual', 'staf_toko', 'admin', 'super_admin']),
});

// Buat akun baru dari dashboard super admin
export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  displayName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  role: z.enum(['pembeli', 'penjual', 'staf_toko', 'admin']),
  storeId: z.string().optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
  images: z.array(imageSrc).max(3).optional(),
});

export const productFiltersSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  sortBy: z.enum(['terbaru', 'termurah', 'termahal', 'terlaris', 'rating']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): 
  | { success: true; data: T; errors?: never }
  | { success: false; errors: string[]; data?: never } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  return { success: false, errors };
}