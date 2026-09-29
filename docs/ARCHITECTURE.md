# Arsitektur & Alur Pengguna - Laris Manis

## 1. Ringkasan Sistem

**Laris Manis** adalah platform etalase produk UMKM (marketplace multi-toko) berbasis web + PWA dengan arsitektur:
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Firebase Authentication + Firestore + Firebase Admin SDK (server-side)
- **Storage**: Vercel Blob untuk foto produk
- **Deploy**: Vercel (web), GitHub Actions + Capacitor (APK Android)
- **Bahasa**: Indonesia, format Rupiah, mobile-first

## 2. Role & Hak Akses (RBAC)

| Role | Deskripsi | Cara Dapat | Hak Akses Utama |
|------|-----------|------------|-----------------|
| **Super Admin** | Pengelola sistem tertinggi | Script seed sekali jalan | Kelola akun & role, kategori, pengaturan, laporan, audit log |
| **Admin/Moderator** | Verifikator konten | Diberikan Super Admin | Verifikasi UMKM, setujui/tolak produk + alasan, hapus konten melanggar |
| **Penjual** | Pemilik toko UMKM | Ajukan jadi Penjual → diverifikasi Admin | Kelola profil toko, CRUD produk miliknya, lihat statistik |
| **Staf Toko** | Karyawan toko | Ditugaskan Penjual | Tambah/edit produk & stok toko yang ditugaskan; tanpa hapus/pengaturan |
| **Pembeli** | Pengguna belanja | Daftar default (auto) | Cari, favorit, ulasan, hubungi penjual via WhatsApp |
| **Pengunjung** | Tanpa login | - | Hanya melihat katalog |

## 3. Alur Pengguna (User Flows)

### 3.1 Autentikasi & Onboarding
```
Pengunjung → Daftar (email/password) → Verifikasi Email → Role: Pembeli
                                                    ↓
                                            Ajukan Jadi Penjual
                                                    ↓
                                            Admin Verifikasi UMKM
                                                    ↓
                                            Disetujui → Role: Penjual + Buat Toko
                                                    ↓
                                            Ditolak → Tetap Pembeli + Notifikasi Alasan
```

### 3.2 Alur Produk (Penjual → Admin → Publik)
```
Penjual Login → Isi Form Produk (draft/menunggu review) → Status: "Menunggu Review"
                                                      ↓
                                            Admin Review (Setuju/Tolak + Alasan)
                                                      ↓
                                    Setuju → Status: "Aktif" → Tayang di Katalog
                                    Tolak → Status: "Ditolak" → Notifikasi ke Penjual
```

### 3.3 Alur Belanja (Pembeli)
```
Pembeli/Pengunjung → Katalog (search, filter kategori/harga/lokasi)
                                          ↓
                                    Detail Produk → Profil Toko
                                          ↓
                                    Tombol "Pesan via WhatsApp"
                                          ↓
                                    Buka WhatsApp dengan template pesan otomatis
```

### 3.4 Dashboard per Role
| Role | Dashboard Utama |
|------|-----------------|
| Super Admin | Statistik sistem, kelola user/role, kategori, audit log, pengaturan global |
| Admin | Daftar UMKM pending, produk menunggu review, konten melanggar |
| Penjual | Profil toko, daftar produk (draft/aktif/nonaktif/ditolak), statistik penjualan, notifikasi status produk |
| Staf Toko | Produk toko yang ditugaskan (tambah/edit stok), notifikasi |
| Pembeli | Favorit, riwayat ulasan, notifikasi |

## 4. Arsitektur Teknis

### 4.1 Diagram Arsitektur High-Level
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client (PWA)  │────▶│  Next.js Server  │────▶│  Firebase Auth  │
│  (Next.js App)  │     │  (API Routes)    │     │  (Custom Claims)│
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌───────────┐ ┌────────────┐
             │ Firestore│ │ Vercel Blob│ │  WhatsApp  │
             │(Admin SDK)│ │ (Foto)     │ │  Deep Link │
             └──────────┘ └───────────┘ └────────────┘
```

### 4.2 Prinsip Keamanan
1. **RBAC di Backend**: Validasi role & kepemilikan di API server, bukan hanya sembunyikan UI
2. **Firebase Custom Claims**: Role disimpan sebagai custom claims; hanya Super Admin yang bisa ubah
3. **Firestore Security Rules**: Default-deny untuk klien; semua tulis lewat API server (Admin SDK)
4. **Sesi & Rate Limit**: Sesi ber-expired, rate limit pada API sensitif (login, unggah)
5. **Validasi & Sanitasi**: Input validation di server, batasi tipe/ukuran file (max 2MB, 1-5 foto)
6. **Audit Log**: Catat aksi admin (verifikasi, hapus, ubah role)

### 4.3 Data Flow - Produk
```
Client → POST /api/products (FormData: nama, deskripsi, kategori, harga, stok, foto[])
         │
         ▼
Server (API Route) → Validasi input & role (Penjual/Staf)
         │
         ▼
Upload foto ke Vercel Blob (satu per satu) → Dapat URL publik
         │
         ▼
Simpan ke Firestore (Admin SDK) → status: "menunggu_review"
         │
         ▼
Return response ke client
```

## 5. Koleksi Firestore (Desain Awal)

### 5.1 `users` (Document ID = Firebase UID)
```typescript
interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: 'pembeli' | 'penjual' | 'staf_toko' | 'admin' | 'super_admin';
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Denormalisasi untuk query cepat
  storeId?: string;           // Jika penjual/staf
  assignedStoreIds?: string[]; // Jika staf toko (multi-toko)
  notificationTokens?: string[]; // FCM tokens
}
```

### 5.2 `stores`
```typescript
interface StoreDoc {
  id: string; // Auto-generated
  ownerId: string; // UID penjual
  name: string;
  slug: string; // Unique, untuk URL publik
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string; // Nomor WA untuk tombol pesan
  logoUrl?: string;
  bannerUrl?: string;
  isVerified: boolean; // Verifikasi Admin
  verifiedAt?: Timestamp;
  verifiedBy?: string; // UID admin
  rating: number; // Avg rating
  reviewCount: number;
  productCount: number; // Denormalisasi
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5.3 `products`
```typescript
interface ProductDoc {
  id: string;
  storeId: string;
  sellerId: string; // UID penjual (denormalisasi untuk query "produk saya")
  name: string;
  description: string;
  categoryId: string;
  categoryName: string; // Denormalisasi
  price: number; // Integer (rupiah, tanpa desimal)
  stock: number;
  images: string[]; // Vercel Blob URLs (max 5)
  status: 'draft' | 'menunggu_review' | 'aktif' | 'nonaktif' | 'ditolak';
  rejectionReason?: string; // Jika ditolak
  reviewedBy?: string; // UID admin
  reviewedAt?: Timestamp;
  viewCount: number; // Denormalisasi
  favoriteCount: number; // Denormalisasi
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp; // Saat status jadi aktif
}
```

### 5.4 `categories`
```typescript
interface CategoryDoc {
  id: string;
  name: string;
  slug: string; // Unique
  description?: string;
  imageUrl?: string;
  parentId?: string; // Untuk sub-kategori
  sortOrder: number;
  productCount: number; // Denormalisasi
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5.5 `reviews`
```typescript
interface ReviewDoc {
  id: string;
  productId: string;
  storeId: string; // Denormalisasi
  buyerId: string; // UID pembeli
  buyerName: string; // Denormalisasi
  rating: number; // 1-5
  comment: string;
  images?: string[]; // Opsional, max 3
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5.6 `auditLogs`
```typescript
interface AuditLogDoc {
  id: string;
  actorId: string; // UID pelaku
  actorRole: string;
  action: string; // 'verify_umkm', 'approve_product', 'reject_product', 'delete_content', 'change_role', etc.
  targetType: 'user' | 'store' | 'product' | 'category' | 'review';
  targetId: string;
  details: Record<string, any>; // Alasan, perubahan, dll
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}
```

### 5.7 `favorites` (Subcollection atau koleksi terpisah)
```typescript
// Option A: Subcollection users/{uid}/favorites/{productId}
interface FavoriteDoc {
  productId: string;
  productName: string; // Denormalisasi
  productImage: string; // Denormalisasi
  storeId: string;
  storeName: string; // Denormalisasi
  price: number;
  createdAt: Timestamp;
}
```

## 6. Index Firestore yang Diperlukan

```javascript
// products
db.collection('products').where('status', '==', 'aktif').orderBy('createdAt', 'desc')
db.collection('products').where('storeId', '==', 'xxx').where('status', 'in', ['aktif', 'nonaktif', 'draft']).orderBy('updatedAt', 'desc')
db.collection('products').where('categoryId', '==', 'xxx').where('status', '==', 'aktif').orderBy('price', 'asc')
db.collection('products').where('sellerId', '==', 'xxx').orderBy('updatedAt', 'desc')

// stores
db.collection('stores').where('ownerId', '==', 'xxx')
db.collection('stores').where('isVerified', '==', true).orderBy('rating', 'desc')

// reviews
db.collection('reviews').where('productId', '==', 'xxx').orderBy('createdAt', 'desc')
db.collection('reviews').where('storeId', '==', 'xxx').orderBy('createdAt', 'desc')

// auditLogs
db.collection('auditLogs').where('actorId', '==', 'xxx').orderBy('createdAt', 'desc')
db.collection('auditLogs').where('targetType', '==', 'product').where('targetId', '==', 'xxx').orderBy('createdAt', 'desc')
```

## 7. PWA Requirements

- **Manifest**: name, short_name, icons (192, 512), start_url, display: standalone, theme_color
- **Service Worker**: Cache halaman publik (ISR), offline fallback
- **Install Prompt**: Custom install button di mobile

## 8. Environment Variables

### Client-side (NEXT_PUBLIC_)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_VERCEL_BLOB_TOKEN` (untuk upload dari client jika diperlukan)
- `NEXT_PUBLIC_APP_URL` (URL production Vercel)

### Server-side only
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (dengan \n untuk newline)

## 9. API Endpoints Overview

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | No | - | Daftar akun baru (role: pembeli) |
| POST | /api/auth/login | No | - | Login email/password |
| POST | /api/auth/logout | Yes | All | Logout |
| POST | /api/auth/forgot-password | No | - | Kirim email reset password |
| POST | /api/auth/verify-email | Yes | All | Verifikasi email (OTP) |
| POST | /api/auth/apply-seller | Yes | Pembeli | Ajukan jadi Penjual |
| GET | /api/users/me | Yes | All | Profil user + role + storeId |
| PATCH | /api/users/me | Yes | All | Update profil |
| GET | /api/stores/me | Yes | Penjual | Profil toko sendiri |
| POST | /api/stores | Yes | Penjual | Buat toko (saat disetujui jadi penjual) |
| PATCH | /api/stores/me | Yes | Penjual | Update toko |
| GET | /api/products | No | - | List produk publik (search, filter, pagination) |
| GET | /api/products/:id | No | - | Detail produk publik |
| POST | /api/products | Yes | Penjual/Staf | Buat produk (status: draft/menunggu_review) |
| GET | /api/products/me | Yes | Penjual/Staf | List produk sendiri |
| PATCH | /api/products/:id | Yes | Penjual/Staf | Update produk sendiri |
| DELETE | /api/products/:id | Yes | Penjual | Hapus produk sendiri |
| POST | /api/products/:id/submit-review | Yes | Penjual/Staf | Submit ke review (status: menunggu_review) |
| PATCH | /api/admin/products/:id/review | Yes | Admin | Setujui/tolak produk + alasan |
| GET | /api/admin/products/pending | Yes | Admin | List produk menunggu review |
| GET | /api/admin/users | Yes | Super Admin | List semua user |
| PATCH | /api/admin/users/:id/role | Yes | Super Admin | Ubah role user |
| GET | /api/admin/stores/pending | Yes | Admin | List UMKM pending verifikasi |
| PATCH | /api/admin/stores/:id/verify | Yes | Admin | Verifikasi/tolak UMKM |
| GET | /api/categories | No | - | List kategori aktif |
| POST | /api/categories | Yes | Super Admin | Buat kategori |
| PATCH | /api/categories/:id | Yes | Super Admin | Update kategori |
| DELETE | /api/categories/:id | Yes | Super Admin | Hapus kategori |
| POST | /api/upload | Yes | Penjual/Staf | Upload foto ke Vercel Blob (satu per request) |
| POST | /api/favorites | Yes | Pembeli | Toggle favorit |
| GET | /api/favorites | Yes | Pembeli | List favorit |
| POST | /api/reviews | Yes | Pembeli | Buat ulasan |
| GET | /api/reviews/product/:id | No | - | List ulasan produk |
| GET | /api/audit-logs | Yes | Super Admin | List audit log |

## 10. Matriks Hak Akses (RBAC Matrix)

| Resource/Action | Super Admin | Admin | Penjual | Staf Toko | Pembeli | Pengunjung |
|-----------------|-------------|-------|---------|-----------|---------|------------|
| **Users** |
| List all users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Change role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Stores** |
| Create store | ✅ | ❌ | ✅ (own) | ❌ | ❌ | ❌ |
| Update own store | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Verify store | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View public store | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Products** |
| Create product | ✅ | ❌ | ✅ (own store) | ✅ (assigned store) | ❌ | ❌ |
| Update own product | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Delete own product | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Submit for review | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Approve/reject product | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View pending review | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View public catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Categories** |
| CRUD categories | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View categories | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Reviews** |
| Create review | ✅ | ✅ | ❌ | ❌ | ✅ (verified purchase) | ❌ |
| View reviews | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Audit Logs** |
| View audit logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Upload** |
| Upload photo | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

## 11. Catatan Implementasi

### Prioritas Tahap 1 (Saat Ini)
1. Setup Firebase project (Auth, Firestore, Service Account)
2. Konfigurasi Next.js + Firebase Client SDK + Admin SDK
3. Implementasi Auth (register, login, logout, verifikasi email)
4. Custom claims untuk role
5. Middleware RBAC di API routes
6. Koleksi Firestore dasar + Security Rules

### Deferred ke Fase Berikutnya
- Keranjang & Checkout
- Full-text search (Algolia/Meilisearch/Typesense)
- Notifikasi push (FCM)
- Chat real-time
- Multi-bahasa
- Native mobile app (React Native/Flutter)

---

**Next Step**: Setup Firebase project langkah demi langkah, lalu implementasi auth & RBAC core.