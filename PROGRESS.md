# Progress Tracking - Laris Manis

## Project Overview
Platform etalase produk UMKM (marketplace multi-toko) berbasis web + PWA

## Phases

### Phase 1: Arsitektur & Alur Pengguna ✅ COMPLETED
- [x] Dokumentasi arsitektur sistem
- [x] User flow diagrams
- [x] Teknologi stack final
- [x] Desain koleksi Firestore
- [x] RBAC Matrix
- [x] API Endpoints Overview

### Phase 2: Struktur Koleksi Firestore & Security Rules ✅ COMPLETED
- [x] Desain koleksi (users, stores, products, categories, reviews, auditLogs)
- [x] Index yang diperlukan
- [x] Security Rules (default-deny untuk klien)

### Phase 3: Endpoint API + Matriks Hak Akses ✅ COMPLETED
- [x] Daftar endpoint API
- [x] RBAC matrix per role
- [x] Validasi input & rate limiting

### Phase 4: Kode Inti: Auth, RBAC, CRUD Produk ✅ COMPLETED
- [x] Firebase Admin SDK setup
- [x] Auth (daftar, login, lupa password, verifikasi email)
- [x] Custom claims untuk role
- [x] CRUD produk dengan alur review
- [x] API Routes: Auth, Users, Products, Stores, Admin, Categories, Upload, Favorites, Reviews, Audit Logs
- [x] Rate limiting middleware (basic)
- [x] Input sanitization (Zod)

### Phase 5: UI Halaman Utama ✅ COMPLETED
- [x] Halaman publik (Beranda, Katalog, Detail Produk)
- [x] Dashboard layout (Header, Footer, Navigation)
- [x] UI Components (Button, Card, Badge, Input, Modal, Avatar)
- [x] PWA manifest & service worker
- [x] Install prompt component

### Phase 5b: Redesign Visual "Etalase Gerobak" ✅ COMPLETED (branch `redesign/homepage-v2`)
- [x] Palet baru: Merah Pasar `#9E1B32`, Kunyit Emas `#E4A82E`, Hijau Pandan `#1F6B4E`, Ink Hangat `#1D1714`, Kertas Bungkus `#FBF8F3` + netral hangat menggantikan abu-abu biru
- [x] Tipografi: Fraunces (judul/wordmark) + Plus Jakarta Sans (body/UI), menggantikan Geist
- [x] Token `brand-*` menggantikan `indigo-*` di seluruh halaman (124 occurrences)
- [x] Hero baru: tanpa angka statistik palsu, search bar, 3 chip kepercayaan, kolase produk asli (fetch `/api/products` + skeleton + fallback ilustrasi)
- [x] Animasi tunggal: kartu kolase "turun ke rak" (`shelf-settle`), hormati `prefers-reduced-motion`
- [x] Ikon kategori: heroicons outline, emoji dihapus
- [x] Section "Yang bikin beda" (bento asimetris) menggantikan 4 kartu seragam
- [x] Alur 3 langkah bergaya stempel + band CTA emas ("Punya dagangan? Pasang etalasenya.")
- [x] Footer: blok 4 poin pengulangan dihapus
- [x] Katalog membaca `?q=` dan `?category=` dari URL
- [x] Composite index Firestore dideploy (`firestore.indexes.json`, 23 index) — katalog & API produk sebelumnya gagal total ("requires an index")
- [x] Seed produk dideduplikasi (13 produk) dan script seed dibuat idempoten

### Phase 5c: Perbaikan Login & Favorit ✅ COMPLETED (branch `fix/auth-favorit-error`)
- **Akar masalah "Terjadi kesalahan jaringan"**: semua API route di Vercel 500 `ERR_REQUIRE_ESM` (`jwks-rsa` → `jose` ESM vs runtime CJS) sehingga `res.json()` melempar; fix: npm override `jose@5.10.0` + `engines.node` 22.x (branch ini juga membawa desain Phase 5b ke production)
- **Env vars Production**: lengkap (15 variabel) — bukan penyebab
- **Authorized domains**: tidak bisa dibaca via API; tes REST `signInWithPassword` tidak memvalidasi Origin → login server-side tidak terpengaruh; cek manual tetap disarankan bila kelak pakai client SDK
- **`/api/auth/login` diperbaiki**: sebelumnya tidak memverifikasi password & tidak menghasilkan sesi; kini verifikasi via Identity Toolkit REST, kembalikan `idToken` + role, update `lastLoginAt` pakai `set(merge)` (aman bila dokumen user belum ada)
- **`src/lib/client-auth.ts` baru**: simpan/hapus token, `authFetch` (Bearer otomatis), `readJson` aman terhadap body non-JSON, klasifikasi error offline / sesi habis / server
- **Halaman login**: pesan error terdiferensiasi (offline vs server 5xx vs kredensial salah vs respons tidak valid), token disimpan sebelum redirect
- **Halaman favorit**: kirim `Authorization: Bearer`, 401 → redirect ke login dengan pesan "Sesi berakhir...", 5xx → pesan server, offline → pesan offline; hapus favorit kini menampilkan error (sebelumnya ditelan `console.error`)
- **Verifikasi production** (`laris-manis-id.vercel.app`, deploy `laris-manis-rbgev3gse`): `/auth/login` 200; `GET /api/products` 200; login salah → 401 "Email atau password salah"; login benar → `idToken`; `/api/favorites` tanpa token → 401, dengan token → 200, toggle on/off → 200
- Akun uji (bisa dipakai manual di browser): `uji-favorit@larismanis.test` / `UjiFavorit123!` (role pembeli)
- Catatan: pesan "Terjadi kesalahan jaringan" generik di halaman lain (daftar, lupa-password, verifikasi-email) belum ditangani — hanya login & favorit sesuai lingkup tugas
- **Sesi tampilan** (laporan lanjutan: "login berhasil tapi tidak ada perubahan, disuruh login lagi"): `client-auth` kini menyimpan sesi (token + nama/email/role) dan memancarkan event `lm-auth-changed`; Header (desktop & mobile) menampilkan nama pengguna + tombol **Keluar** saat sesi valid (via `useSyncExternalStore`, tanpa hydration mismatch); halaman login **auto-redirect** bila sudah punya sesi valid — deploy production `laris-manis-gucj6ssd8`

### Phase 8: Audit Menyeluruh Produksi (branch `fix/audit-menyeluruh`)
Urutan kerja disepakati: rute 404 → tema → menu hamburger → akun/peran → sisa desain. Tiap kategori: commit kecil → push → deploy **production** → verifikasi URL production → update PROGRESS.

#### Kategori 1: Rute — 11 halaman 404 ✅ COMPLETED (commit `c8eceee`, deploy `laris-manis-hiwrlrts9`)
- **Temuan**: crawl 9 halaman utama production → 27 link internal, 11 di antaranya 404: `/kategori` (folder kosong), `/tentang`, `/bantuan`, `/bantuan/belanja`, `/privasi`, `/syarat`, `/panduan/penjual`, `/kebijakan/penjual`, `/karir`, `/blog`, `/kontak`
- **Dibuat**: 11 halaman penuh, bahasa Indonesia, tanpa konten palsu (karir & blog jujur "belum ada/ disiapkan", kontak tanpa email/telepon karangan) — kerangka bersama `src/components/StaticPage.tsx` (hero breadcrumb + konten + footer), token warna global agar ikut tema
- **Refactor**: tile kategori dipindah ke `src/lib/category-tiles.ts` (dipakai beranda + `/kategori`, tidak duplikasi)
- **Token**: shade `kunyit-50/800/900/950` dan `pandan-200/800/900/950` ditambahkan (dipakai halaman baru); nol kelas merah di semua halaman baru
- **Verifikasi production** (deploy Ready `laris-manis-hiwrlrts9`, alias `laris-manis-id.vercel.app`): ke-11 URL → **200**; BFS crawl ulang 20 halaman → seluruh link internal **200**, tidak ada sisa 404

### Phase 6: Testing & Deploy Produksi (Vercel)
- [ ] Unit & integration tests
- [ ] Deploy ke Vercel
- [ ] Environment variables setup

### Phase 7: APK Android + Rilis Otomatis GitHub
- [ ] Capacitor setup
- [ ] Keystore & signing
- [ ] GitHub Actions workflow
- [ ] Release notes & checksum

---

## Current Status
**Phase**: 8 - Audit Menyeluruh, Kategori 1 Rute (selesai, tayang di production)
**Branch**: fix/audit-menyeluruh
**Last Commit**: 11 halaman 404 → dibuat & diverifikasi 200
**Production**: https://laris-manis-id.vercel.app (deploy `laris-manis-hiwrlrts9`)

## Environment Variables Needed (for Vercel/GitHub Secrets)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `NEXT_PUBLIC_VERCEL_BLOB_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## GitHub Repository
- URL: https://github.com/KoRifCan/laris-manis
- Main branch: `main`
- Current working branch: `fix/auth-favorit-error` (turunan `redesign/homepage-v2`)
- Preview deploy (branch `redesign/homepage-v2`): https://laris-manis-gxtmj719g-korifcan.vercel.app
  - Dilindungi Vercel Deployment Protection (SSO); buka via login Vercel, atau verifikasi via `vercel curl <url>`
  - Environment variable preview sudah terisi dari `.env.local` (14 var)
  - Fix API 500 di Vercel: `jwks-rsa` butuh jose ESM tapi runtime-nya CJS → npm override `jose@5.10.0` + pin `engines.node` 22.x (bug lama, juga menimpa production)

## Completed Files - Architecture & Backend
- `docs/ARCHITECTURE.md` - Full architecture documentation
- `firebase/firestore.rules` - Firestore security rules (default-deny)
- `firebase/storage.rules` - Storage rules note (using Vercel Blob)
- `scripts/seed-super-admin.js` - Super admin seed script
- `src/lib/firebase-client.ts` - Firebase client config
- `src/lib/firebase-admin.ts` - Firebase admin SDK config
- `src/lib/types.ts` - TypeScript types
- `src/lib/rbac.ts` - Role-based access control utilities
- `src/lib/api-auth.ts` - API authentication middleware
- `src/lib/validation.ts` - Zod validation schemas
- `src/lib/utils.ts` - Utility functions (formatRupiah, etc.)

## Completed Files - API Routes
- `src/app/api/auth/register/route.ts` - Register endpoint
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/app/api/auth/forgot-password/route.ts` - Forgot password endpoint
- `src/app/api/auth/verify-email/route.ts` - Verify email endpoint
- `src/app/api/auth/apply-seller/route.ts` - Apply seller endpoint
- `src/app/api/users/me/route.ts` - User profile endpoint
- `src/app/api/products/route.ts` - Public products list
- `src/app/api/products/[id]/route.ts` - Product detail
- `src/app/api/products/me/route.ts` - My products (seller)
- `src/app/api/products/[id]/submit-review/route.ts` - Submit for review
- `src/app/api/admin/products/pending/route.ts` - Admin pending products
- `src/app/api/admin/products/[id]/review/route.ts` - Admin review product
- `src/app/api/upload/route.ts` - Upload to Vercel Blob
- `src/app/api/stores/me/route.ts` - My store (seller)
- `src/app/api/stores/route.ts` - Public stores
- `src/app/api/admin/users/route.ts` - Admin user management
- `src/app/api/admin/stores/pending/route.ts` - Admin pending stores
- `src/app/api/admin/stores/[id]/verify/route.ts` - Admin verify store
- `src/app/api/categories/route.ts` - Categories CRUD
- `src/app/api/categories/[id]/route.ts` - Category update/delete
- `src/app/api/favorites/route.ts` - Favorites toggle
- `src/app/api/reviews/route.ts` - Reviews CRUD
- `src/app/api/audit-logs/route.ts` - Audit logs

## Completed Files - UI Components
- `src/components/ui/Button.tsx` - Button component with variants
- `src/components/ui/Input.tsx` - Input with label/error/helper
- `src/components/ui/Card.tsx` - Card with variants
- `src/components/ui/Badge.tsx` - Badge with status variants
- `src/components/ui/Avatar.tsx` - Avatar with fallback initials
- `src/components/ui/Modal.tsx` - Accessible modal dialog
- `src/components/layout/Header.tsx` - Responsive header with navigation
- `src/components/layout/Footer.tsx` - Footer with links and social
- `src/components/pwa/PWAInstallPrompt.tsx` - PWA install prompt

## Completed Files - Pages
- `src/app/page.tsx` - Homepage with hero, stats, categories, features
- `src/app/katalog/page.tsx` - Product catalog with search/filter/pagination
- `src/app/produk/[id]/page.tsx` - Product detail with gallery, store info, reviews
- `src/app/layout.tsx` - Root layout with metadata, fonts, providers
- `src/app/providers.tsx` - Session provider wrapper
- `src/app/globals.css` - Global styles with Tailwind v4
- `src/app/manifest.json` - PWA manifest
- `public/sw.js` - Service worker for offline support
- `public/icons/*.svg` - PWA icons (72-512px)

## Next Steps
1. Create dashboard pages for each role (penjual, admin, super_admin)
2. Implement authentication pages (login, register, forgot password)
3. Add rate limiting middleware (Upstash/Redis)
4. Write unit & integration tests
5. Deploy to Vercel and configure environment variables
6. Setup GitHub repository and push code
7. Configure Vercel project and connect to GitHub
8. Test all API endpoints with real Firebase project