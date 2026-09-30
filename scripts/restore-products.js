#!/usr/bin/env node
/**
 * Restore produk yang dokumennya ter-overwrite oleh PATCH REST tanpa updateMask.
 * Mengisi ulang 13 dokumen ID lama dengan data seed (nama/deskripsi/harga/kategori)
 * + metadata toko/seller/kategori dari Firestore.
 */
require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (getApps().length === 0) {
  initializeApp({ credential: cert(adminConfig), projectId: adminConfig.projectId });
}
const adminDb = getFirestore();

// Data seed yang sama dengan scripts/seed-products.js
const sampleProducts = [
  { name: 'Dodol Garut Asli', description: 'Dodol khas Garut dibuat dari ketan hitam dan gula merah asli. Tekstur kenyal, manis legit, tanpa pengawet. Cocok untuk oleh-oleh atau camilan sehari-hari.', price: 45000, stock: 50, categorySlug: 'makanan-minuman', images: ['/products/ph-makanan.png'] },
  { name: 'Kopi Robusta Temanggung', description: 'Kopi robusta premium dari ketinggian 1200 mdpl. Aroma kuat, rasa bittersweet dengan aftertaste cokelat. Dikemas dalam kantong standar 250gr.', price: 85000, stock: 30, categorySlug: 'makanan-minuman', images: ['/products/ph-makanan.png'] },
  { name: 'Keripik Singkong Balado', description: 'Keripik singkong khas Minang dengan bumbu balado pedas manis. Renyah tahan lama, tanpa MSG, cocok untuk camilan keluarga.', price: 35000, stock: 100, categorySlug: 'makanan-minuman', images: ['/products/ph-makanan.png'] },
  { name: 'Tas Anyaman Bambu', description: 'Tas anyaman bambu buatan tangan pengrajin Cirebon. Desain modern, kuat, dan ramah lingkungan. Cocok untuk belanja ke pasar atau tas sehari-hari.', price: 120000, stock: 25, categorySlug: 'fashion-aksesoris', images: ['/products/ph-fashion.png'] },
  { name: 'Batik Tulis Pekalongan', description: 'Kain batik tulis motif buketan khas Pekalongan. Dibuat dengan canting tangan, pewarna alami, buta warna. 1 kain = 2.5 meter.', price: 850000, stock: 10, categorySlug: 'fashion-aksesoris', images: ['/products/ph-fashion.png'] },
  { name: 'Kalung Manik-Manik', description: 'Aksesoris kalung dari manik-manik keramik buatan tangan. Desain unik, warna-warni, panjang 45cm. Cocok untuk fashion sehari-hari.', price: 75000, stock: 40, categorySlug: 'fashion-aksesoris', images: ['/products/ph-fashion.png'] },
  { name: 'Patung Ukir Kayu Jati', description: 'Patung ukiran tangan kayu jati premium motif wayang. Tinggi 30cm, finishing natural oil. Cocok untuk hiasan ruang tamu atau hadiah.', price: 450000, stock: 5, categorySlug: 'kerajinan-tangan', images: ['/products/ph-kriya.png'] },
  { name: 'Anyaman Tikar Pandan', description: 'Tikar anyaman pandan alami dari Madura. Ukuran 2x3 meter, tebal, nyaman dipakai, awet. Motif geometris tradisional.', price: 180000, stock: 15, categorySlug: 'kerajinan-tangan', images: ['/products/ph-kriya.png'] },
  { name: 'Minyak Kayu Putih Asli', description: 'Minyak kayu putih 100% murni dari Maluku. Untuk pijat, aromaterapi, dan pereda nyeri otot. Botol 60ml dengan tutup dropper.', price: 55000, stock: 60, categorySlug: 'kesehatan-kecantikan', images: ['/products/ph-umum.png'] },
  { name: 'Sabun Herbal Kunyit', description: 'Sabun alami kunyit dan madu untuk kulit berjerawat dan kusam. Tanpa SLS, paraben, pewangi sintetis. Berat 100gr.', price: 35000, stock: 80, categorySlug: 'kesehatan-kecantikan', images: ['/products/ph-umum.png'] },
  { name: 'Wajan Anti Lengket Keramik', description: 'Wajan keramik anti lengket diameter 26cm. Bebas PFOA, panas merata, mudah dibersihkan. Cocok untuk memasak sehat.', price: 220000, stock: 20, categorySlug: 'rumah-tangga', images: ['/products/ph-umum.png'] },
  { name: 'Tempat Tumpuk Bambu', description: 'Rak penyimpanan bertingkat dari bambu anyaman. 3 tingkat, kuat menopang 15kg per tingkat. Ringan, estetik, ramah lingkungan.', price: 150000, stock: 18, categorySlug: 'rumah-tangga', images: ['/products/ph-umum.png'] },
  { name: 'Powerbank Kayu 10000mAh', description: 'Powerbank bodi kayu jati 10000mAh. Output 2.1A, support fast charging. Indikator LED, kabel built-in. Unik & fungsional.', price: 280000, stock: 12, categorySlug: 'elektronik-gadget', images: ['/products/ph-elektronik.png'] },
];

async function main() {
  // 1. Dokumen produk yang tersisa field images saja
  const snap = await adminDb.collection('products').get();
  const broken = snap.docs.filter((d) => {
    const data = d.data();
    return !data.name && data.images;
  });
  const ids = broken.map((d) => d.id);
  console.log('produk rusak:', ids.length, ids);

  if (ids.length !== sampleProducts.length) {
    console.warn('PERINGATAN: jumlah dokumen rusak tidak sama dengan seed. Lanjut memetakan berdasarkan urutan.');
  }

  // 2. Referensi
  const catSnap = await adminDb.collection('categories').get();
  const categoryMap = {};
  catSnap.docs.forEach((d) => { categoryMap[d.data().slug] = { id: d.id, name: d.data().name }; });

  const storeSnap = await adminDb.collection('stores').where('isVerified', '==', true).limit(1).get();
  if (storeSnap.empty) throw new Error('tidak ada toko terverifikasi');
  const store = storeSnap.docs[0];
  const sellerSnap = await adminDb.collection('users').where('storeId', '==', store.id).limit(1).get();
  if (sellerSnap.empty) throw new Error('tidak ada seller untuk toko');
  const seller = sellerSnap.docs[0];
  console.log('store:', store.id, store.data().name, '| seller:', seller.id);

  // 3. Isi ulang dokumen ID lama
  const batch = adminDb.batch();
  ids.forEach((id, i) => {
    const prod = sampleProducts[i];
    const cat = categoryMap[prod.categorySlug];
    if (!cat) throw new Error('kategori hilang: ' + prod.categorySlug);
    const ref = adminDb.collection('products').doc(id);
    batch.set(ref, {
      ...prod,
      id,
      storeId: store.id,
      sellerId: seller.id,
      categoryId: cat.id,
      categoryName: cat.name,
      images: prod.images,
      status: 'aktif',
      viewCount: Math.floor(Math.random() * 500),
      favoriteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    }, { merge: false });
    console.log('  restore', id, '->', prod.name);
  });
  await batch.commit();

  // 4. Sinkronkan productCount toko
  const allProducts = await adminDb.collection('products').where('storeId', '==', store.id).get();
  await store.ref.update({ productCount: allProducts.size });
  console.log('store productCount =', allProducts.size);
  console.log('DONE restore');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
