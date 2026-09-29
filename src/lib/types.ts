export type UserRole = 'pembeli' | 'penjual' | 'staf_toko' | 'admin' | 'super_admin';

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  storeId?: string;
  assignedStoreIds?: string[];
  notificationTokens?: string[];
}

export interface StoreDoc {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  bannerUrl?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = 'draft' | 'menunggu_review' | 'aktif' | 'nonaktif' | 'ditolak';

export interface ProductDoc {
  id: string;
  storeId: string;
  sellerId: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  images: string[];
  status: ProductStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  viewCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDoc {
  id: string;
  productId: string;
  storeId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogDoc {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType: 'user' | 'store' | 'product' | 'category' | 'review';
  targetId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface FavoriteDoc {
  productId: string;
  productName: string;
  productImage: string;
  storeId: string;
  storeName: string;
  price: number;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductFilters {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  province?: string;
  sortBy?: 'terbaru' | 'termurah' | 'termahal' | 'terlaris' | 'rating';
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
  status?: ProductStatus;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  stock?: number;
  images?: string[];
  status?: ProductStatus;
}

export interface CreateStoreInput {
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  whatsapp?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface ReviewInput {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface ApplySellerInput {
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  storeCity: string;
  storeProvince: string;
  storePhone: string;
  storeWhatsapp: string;
}

export interface VerifyStoreInput {
  storeId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ReviewProductInput {
  productId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ChangeRoleInput {
  uid: string;
  role: UserRole;
}