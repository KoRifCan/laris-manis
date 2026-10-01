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

#### Kategori 2: Tema Putih Pandan + toggle terang/gelap ✅ COMPLETED (commits `c9f099d`+`bc48fe8`, deploy `laris-manis-6bn7tuisq`)
- **Palet**: ramp `brand-*` merah → Pandan Hijau (`#176B51`/`#0E4F3B`/dst), kanvas `#fbf8f3` → **putih `#FFFFFF`** (abu hangat tetap jadi section alternatif), kunyit-400 → `#E8A317`; override high-contrast juga hijau tua; ilustrasi `EtalaseCollage` (gerobak) merah → hijau
- **Mode gelap**: `@custom-variant dark` berbasis **kelas `.dark`** (bukan media query) + skrip anti-flicker di `<head>` (baca `localStorage 'laris_manis_theme'`, default ikut sistem) + `color-scheme` mengikuti tema
- **Toggle**: `src/components/ThemeToggle.tsx` (ikon bulan/matahari) di header atas — tersedia desktop & mobile; pilihan tersimpan di localStorage; `suppressHydrationWarning` pada `<html>`
- **theme-color**: meta merah `#9e1b32` dihapus; satu meta dinamis `#lm-theme-color` = `#ffffff` terang / `#141310` gelap, diperbarui skrip & toggle
- **Aset ikut rapikan**: `manifest.json` theme_color indigo `#4f46e5` → `#176B51` (blok screenshots dihapus — filenya tidak pernah ada); ikon PWA PNG semuanya **placeholder 1×1** & SVG indigo → diregenerasi hijau (PIL); `shortcut-*.png` yang hilang dibuat; **`og-image.png` 404 → dibuat baru** 1200×630 (putih + logo hijau + aksen kunyit)
- **Verifikasi production** (deploy Ready `laris-manis-6bn7tuisq`): meta theme-color `#ffffff` ✓; nol hash `9e1b32`/`4f46e5` di HTML ✓; CSS build `--color-canvas:#fff`, `--color-brand-600:#176b51` ✓; kode toggle (`laris_manis_theme`) ada di JS bundle ✓; `/og-image.png`, `/icons/icon-512x512.png`, `/manifest.json` → 200, `theme_color: #176B51` ✓

#### Kategori 3: Menu hamburger & pencarian mobile ✅ COMPLETED (commit `4a4e0c1`, deploy `laris-manis-py5clqoxb`)
- Panel menu & pencarian mobile: `bg-white dark:bg-gray-950` **solid** + `border-l` + `shadow-2xl` (sebelumnya panel terang di atas halaman terang hanya bermodal `shadow-xl` — terlihat "tembus"); overlay `bg-black/60` + `backdrop-blur-[2px]`
- Konten panel: `flex-1 overflow-y-auto overscroll-contain` + padding `safe-area-inset-bottom` (menu panjang bisa di-scroll, tidak keluar layar)
- Halaman di belakang dikunci (`body overflow hidden`) selama panel terbuka; tombol **Escape** menutup panel; klik overlay menutup
- Verifikasi production (deploy Ready `laris-manis-py5clqoxb`): kode panel baru (`border-l ... shadow-2xl`, `bg-black/60`, `overscroll-contain`, `safe-area-inset-bottom`, handler `Escape`) ada di JS bundle ✓; kelas `shadow-2xl`/`backdrop-blur`/`safe-area` ada di CSS build ✓ (interaksi diverifikasi dari kode/bundle — lingkungan ini tanpa browser)
- **Perbaikan susulan Android** (laporan pengguna: panel "kecil" & background transparan; commit `0a80ea6`, deploy `laris-manis-4c5u5takk`): akar masalah = panel `fixed` berada **di dalam** `<header>` yang memakai `backdrop-filter` — elemen `backdrop-filter` menjadi *containing block* `position: fixed`, sehingga sidebar terpotong setinggi header (~64px) dan overlay-nya ikut "tembus". Kini menu & pencarian dirender **di luar** `<header>` (fragment), sidebar `absolute inset-y-0` full-height `w-[86%] max-w-sm`, latar solid putih/`gray-950`, animasi `slideInRight` 0,25s + overlay fade, `role="dialog" aria-modal`, safe-area atas; verifikasi prod: HTML `</header>` tepat setelah `</nav>` & tanpa `fixed` di dalam header ✓, keyframes `slideInRight` + `animate-slide-in-right` di CSS ✓, markup sidebar di bundle ✓, crawl ulang 42/42 ✓

#### Kategori 4: Akun, peran ganda & RBAC kepemilikan ✅ COMPLETED (commits `c779e24`+`e5f8d97`+`6bd2114`, deploy `laris-manis-rnwtw7s11`)
- **Temuan (alur penjual mati)**: `apply-seller` tidak pernah membuat dokumen toko → admin tak punya daftar pengajuan → peran tak pernah jadi `penjual`; dashboard memanggil API dengan `credentials: 'include'` tanpa Bearer → selalu 401; `/produk/baru` ditautkan tapi tidak ada halamannya
- **Model peran ganda**: sumber kebenaran = atribut kepemilikan (`stores.ownerId`, `users.storeId`), bukan peran eksklusif — pemilik toko tetap `pembeli` di klaim hingga disetujui, dan penjal tetap bisa memakai fitur pembeli (favorit dll lolos uji)
- **Backend**: `apply-seller` membuat/memperbarui toko (`reviewStatus: pending`, `ownerId`, slug unik); verifikasi admin menyetel `reviewStatus` + klaim `penjual`; pintu gerbang toko/produk/favorit berbasis kepemilikan, submit-review hanya untuk produk milik sendiri (milik orang lain → 403); `PATCH /api/users/me` (nama/alamat/foto data-URL ≤300KB, sinkron Auth + normalisasi E.164) + `PUT /api/users/me/password` (verifikasi sandi lama via Identity Toolkit)
- **Bug produksi yang ikut diperbaiki**: (1) `GET /api/products/[id]` **tidak pernah ada** → semua halaman detail produk 404/500 — kini ada, join info toko; (2) `formatDate` meledak pada Firestore Timestamp (`{_seconds}`) → halaman detail 500 — kini tahan timestamp/kosong; (3) `createAuditLog` menulis `undefined` → approve toko 500 setelah peran sempat ter-set; (4) skema `verifyStore`/`reviewProduct` mewajibkan field body yang tak dikirim route → "Validasi gagal"; (5) tautan verifikasi/reset menolak domain produksi (`unauthorized-continue-uri`) → registrasi 500 **setelah** akun dibuat — dibuat non-fatal; (6) `FilterSection.tsx` duplikat mati dihapus
- **UI baru**: `/akun/profil` (data diri + foto + status toko + ganti mode), `/akun/pengaturan` (tema terang/gelap/sistem, ganti sandi, sesi), `/produk/baru` (buat produk → `/api/products/me`); `Header`: dropdown profil + pindah mode belanja↔toko; dashboard penjual: state "belum punya toko" & banner tunggu verifikasi (tombol produk dinonaktifkan)
- **e2e production** (40/40 cek PASS pada deploy `laris-manis-rnwtw7s11`): daftar → login → PATCH profil → ganti sandi (login ulang) → apply-seller (pending, dobel ditolak) → blokir produk sebelum verifikasi → admin list/approve → klaim jadi `penjual` → buat/PATCH produk → submit-review sendiri `menunggu_review` → admin approve → `aktif` + join toko ✓; negatif: user lain PATCH/DELETE produk → 403, pembeli submit-review → 403, penjual akses endpoint admin → 403, produk tak ada → 404

#### Kategori 5: Sisa desain & audit link final ✅ COMPLETED (commit `970693e`, deploy `laris-manis-mpkxae3qg`)
- **favicon.ico**: ternyata ikon hitam default 256px → diregenerasi multi-size (16–128) dari ikon brand hijau Pandan; verifikasi prod: dominan `#176B51` + putih ✓
- **Bersih-bersih**: placeholder `verification.google` dihapus (kode asli menunggu Google Search Console), 5 SVG starter Next (`file/globe/next/vercel/window.svg`) tak direferensikan → dihapus (kini 404), folder `public/screenshots` kosong dihapus (blok manifest sudah dibersihkan di kategori 2)
- **Meta final**: `theme-color` `#ffffff` dinamis ✓, `og:image` absolut + 1200×630 ✓, `twitter:card summary_large_image` ✓, 0 kemunculan merah/indigo (`9e1b32`/`4f46e5`) ✓, `/og-image.png` & `/manifest.json` → 200 ✓
- **Crawl final production**: 42 URL (semua halaman dari beranda + aset statis) → **42/42 200**, nol link rusak

#### Perbaikan susulan: 404, fitur per-role, gambar produk ✅ COMPLETED (commit `9e3ca6d`, deploy `laris-manis-7umu97swy`)
- **404 dibasmi**: 4 halaman yang ditaut tapi tidak ada dibuat — `/produk/[id]/edit` (form edit produk + alasan penolakan admin), `/dashboard/penjual/edit` (edit profil toko, empty-state bila belum punya toko), `/dashboard/super-admin/kategori/baru` + `/dashboard/super-admin/kategori/[id]/edit` (CRUD kategori; slug auto dari nama, toggle aktif); semua verifikasi lokal + produksi → 200
- **Fitur per-role**: `/dashboard/super-admin/logs` (tabel audit-log: filter aksi, paginasi, detail JSON; link "Lihat Logs" di super-admin diarahkan ke sini, sebelumnya mentah ke JSON `/api/audit-logs`); endpoint baru `GET /api/categories/[id]` (super_admin) untuk halaman edit
- **Gambar produk**: 13 produk di DB menunjuk `via.placeholder.com` (host mati) → di-backfill ke placeholder lokal per kategori (`public/products/ph-{makanan,minuman,fashion,kriya,elektronik,umum}.png`, dibuat via PIL, dicek visual); komponen `ProductImage` (`<img>` + `onError` fallback) dipakai di katalog, toko, favorit, dashboard penjual/admin, galeri detail (ganti `next/image`), form edit; skema validasi menerima path lokal `/...`; `POST /api/products/me` memberi foto default per kategori bila kosong; form foto produk jadi opsional
- **Detail produk kini interaktif** (sebelumnya tombol mati): `ProductActions` (toggle favorit via `GET/POST /api/favorites` — endpoint status `?productId=` baru — + share `navigator.share`/clipboard), `ProductGallery` (klik thumbnail ganti foto utama)
- **Favorit**: `storeSlug` disimpan saat toggle (dokumen lama tak punya → link `/toko/undefined`; kini guard fallback `/toko` + backfill tak perlu karena koleksi favorit kosong)
- **Crawl/SEO**: `src/app/robots.ts` (disallow `/api/ /dashboard/ /akun/`) + `src/app/sitemap.ts` (route statis + produk aktif + toko terverifikasi + kategori, fallback statis bila Firestore gagal) → keduanya 200; direktori kosong `src/app/(public)`, `(dashboard)`, `products`, `stores` dihapus (tidak menghasilkan route, tak direferensikan)
- **Perbaikan internal**: fetch API dari server component kini pakai origin absolut via `src/lib/server-origin.ts` (Next 16 tidak lagi me-resolve fetch relatif — sebelumnya halaman detail/toko 404 di lokal bila `NEXT_PUBLIC_APP_URL` salah); `metadataBase` diset (hilangkan warning OG lokal)
- **Insiden data (diperbaiki)**: backfill awal memakai Firestore REST PATCH **tanpa `updateMask`** → 13 dokumen produk tersisa field `images`; dipulihkan penuh dari `scripts/restore-products.js` (data seed + join toko/seller/kategori, ID dokumen dipertahankan), `productCount` toko disinkronkan = 13; verifikasi: API produksi 13/13 produk lengkap, 0 gambar rusak
- **Verifikasi produksi**: semua route baru → 200; crawl 41 URL → 40 OK + 1 SSL retry (semua 200); link internal 41/41 dari 17 halaman → 200; e2e API `13/13 PASS` (CRUD kategori + slug auto + nonaktif tersembunyi, audit-log terekam, status/toggle favorit on-off, delete uji)

#### Menu role-based, tabel pengguna super-admin, backup/delete, tema default terang ✅ COMPLETED (commit `3e05630`, deploy `laris-manis-khokoi0y0`)
- **Tabel "Daftar Pengguna" kosong di produksi** (angka `(16)` tampil tapi baris 0): IIFE `{(() => {...})()}` di `<tbody>` super-admin tidak menghasilkan anak → direfactor ke ternary biasa; tanggal pakai `formatDate` (aman untuk `createdAt {_seconds}`), guard `displayName`/`email`/`role` kosong, `?limit=100`; deep-link tab `?tab=users|categories|settings` via `useSearchParams` + `<Suspense>` (tanpa setState di effect)
- **Menu fitur per-role di Header**: nav kini `Beranda|Katalog|Toko|Kategori` + `Dashboard` sesuai role (`/dashboard/penjual|admin|super-admin`); dropdown profil & menu mobile super_admin: `Kelola Pengguna`, `Kelola Kategori` (deep-link tab), `Log Aktivitas`; pembeli tetap tanpa item dashboard; pencarian mobile yang tadinya "akan segera hadir" kini fungsional → `/katalog?q=`
- **API baru**: `DELETE /api/admin/users/[uid]` (super_admin; tolak hapus diri sendiri/super_admin lain; hapus Auth + dokumen user/toko/favorit; audit `delete_user`) dan `GET /api/admin/backup` (export JSON 7 koleksi + `Content-Disposition: attachment`)
- **Bugfix API**: filter Firestore `'in'` dgn array kosong → `/api/admin/products/pending` **500** (dashboard admin selalu "Server sedang mengalami gangguan") dan `GET /api/products?city=` — kini di-skip saat kosong, chunk ≤30
- **Bersih-bersih console**: `SessionProvider` next-auth dilepas (tak ada route `/api/auth/session` → `CLIENT_FETCH_ERROR` tiap halaman; dependency di-uninstall); path SVG Instagram di Footer rusak (`Expected number`) → diganti primitif SVG valid; tombol settings super-admin yang tak berfungsi (`Konfigurasi`/`Edit`/`Backup`/`Reset Database`) → Backup JSON nyata, sisanya disabled "Segera Hadir" + catatan operasional (Zona Bahaya menipu dihapus)
- **Tema default terang**: `getThemePref()` default `light`, `system` hanya bila dipilih eksplisit (disimpan literal, tak lagi `removeItem`), script inline `layout.tsx` & listener `ThemeToggle` disinkronkan; toggle terang/gelap tetap untuk pilihan pengguna
- **Data uji**: toko penjual uji punya `storeId` tanpa dokumen (`/api/stores/me` 404 → dashboard "belum memiliki toko") → dokumen `DaQ04nY2iGDwSCvmAScb` dibuat; total user dikembalikan 16 (sisa `uji-del` dibersihkan, role admin sementara dikembalikan ke `pembeli`)
- **Verifikasi**: lint semua file tersentuh CLEAN; `tsc` 66 error (baseline 77, tanpa error baru); build OK; produksi — e2e API **13/13 PASS**, crawl **42/42 OK**, playwright **super-admin rows=16 + menu per-role PASS**, stage role **14/14 PASS** (penjual/admin/pembeli, nol console error, nol 404), tema terang walau sistem gelap, pencarian mobile → katalog, register→delete→login-gagal + backup JSON + 403 pembeli OK

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
**Phase**: 8 - Audit Menyeluruh Produksi — Kategori 1-5 + sidebar Android + basmi-404/fitur-per-role/gambar + menu role/tabel super-admin/backup/tema-terang **SELESAI SEMUA**, tayang di production
**Branch**: fix/audit-menyeluruh
**Last Commit**: `3e05630` — menu role-based, tabel pengguna super-admin, API hapus user + backup JSON, bugfix 'in' filter, lepas next-auth, tema default terang
**Production**: https://laris-manis-id.vercel.app (deploy `laris-manis-khokoi0y0`)
**Belum / butuh tindakan di luar repo**: kode google-site-verification (Google Search Console); domain produksi masuk Firebase *Authorized domains* + penyedia email untuk kirim tautan verifikasi/reset (tanpa ini reset-sandi produksi tidak terkirim); wiring service worker (`sw.js` disajikan tapi belum pernah didaftarkan); rate limiting & unit test (Phase 6, di luar lingkup audit)

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
- `src/app/api/admin/users/[uid]/route.ts` - Delete user (super_admin)
- `src/app/api/admin/backup/route.ts` - Backup JSON semua koleksi (super_admin)

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