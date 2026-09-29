#!/usr/bin/env node
/**
 * Seed Script untuk membuat data contoh produk dan kategori
 * Jalankan: node scripts/seed-products.js
 * 
 * Butuh environment variables:
 * - FIREBASE_ADMIN_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
  console.error('❌ Missing Firebase Admin credentials in environment variables');
  process.exit(1);
}

let adminApp;
if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(adminConfig),
    projectId: adminConfig.projectId,
  });
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);

const sampleCategories = [
  { name: 'Makanan & Minuman', slug: 'makanan-minuman', description: 'Makanan khas, snacks, minuman tradisional', sortOrder: 1 },
  { name: 'Fashion & Aksesoris', slug: 'fashion-aksesoris', description: 'Batik, tenun, tas, aksesoris tangan', sortOrder: 2 },
  { name: 'Kerajinan Tangan', slug: 'kerajinan-tangan', description: 'Kerajinan kayu, bambu, anyaman, ukir', sortOrder: 3 },
  { name: 'Kesehatan & Kecantikan', slug: 'kesehatan-kecantikan', description: 'Produk herbal, skincare alami, jamu', sortOrder: 4 },
  { name: 'Rumah Tangga', slug: 'rumah-tangga', description: 'Perlengkapan dapur, dekorasi, furnitur', sortOrder: 5 },
  { name: 'Elektronik & Gadget', slug: 'elektronik-gadget', description: 'Aksesoris HP, charger, gadget UMKM', sortOrder: 6 },
];

const sampleProducts = [
  // Makanan & Minuman
  { name: 'Dodol Garut Asli', description: 'Dodol khas Garut dibuat dari ketan hitam dan gula merah asli. Tekstur kenyal, manis legit, tanpa pengawet. Cocok untuk oleh-oleh atau camilan sehari-hari.', price: 45000, stock: 50, categorySlug: 'makanan-minuman', images: ['https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Dodol+Garut'] },
  { name: 'Kopi Robusta Temanggung', description: 'Kopi robusta premium dari ketinggian 1200 mdpl. Aroma kuat, rasa bittersweet dengan aftertaste cokelat. Dikemas dalam kantong standar 250gr.', price: 85000, stock: 30, categorySlug: 'makanan-minuman', images: ['https://via.placeholder.com/400x400/6F4E37/FFFFFF?text=Kopi+Robusta'] },
  { name: 'Keripik Singkong Balado', description: 'Keripik singkong khas Minang dengan bumbu balado pedas manis. Renyah tahan lama, tanpa MSG, cocok untuk camilan keluarga.', price: 35000, stock: 100, categorySlug: 'makanan-minuman', images: ['https://via.placeholder.com/400x400/FF6B35/FFFFFF?text=Keripik+Balado'] },
  
  // Fashion & Aksesoris
  { name: 'Tas Anyaman Bambu', description: 'Tas anyaman bambu buatan tangan pengrajin Cirebon. Desain modern, kuat, dan ramah lingkungan. Cocok untuk belanja ke pasar atau tas sehari-hari.', price: 120000, stock: 25, categorySlug: 'fashion-aksesoris', images: ['https://via.placeholder.com/400x400/8FBC8F/FFFFFF?text=Tas+Bambu'] },
  { name: 'Batik Tulis Pekalongan', description: 'Kain batik tulis motif buketan khas Pekalongan. Dibuat dengan canting tangan, pewarna alami, buta warna. 1 kain = 2.5 meter.', price: 850000, stock: 10, categorySlug: 'fashion-aksesoris', images: ['https://via.placeholder.com/400x400/DC143C/FFFFFF?text=Batik+Tulis'] },
  { name: 'Kalung Manik-Manik', description: 'Aksesoris kalung dari manik-manik keramik buatan tangan. Desain unik, warna-warni, panjang 45cm. Cocok untuk fashion sehari-hari.', price: 75000, stock: 40, categorySlug: 'fashion-aksesoris', images: ['https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Kalung+Manik'] },
  
  // Kerajinan Tangan
  { name: 'Patung Ukir Kayu Jati', description: 'Patung ukiran tangan kayu jati premium motif wayang. Tinggi 30cm, finishing natural oil. Cocok untuk hiasan ruang tamu atau hadiah.', price: 450000, stock: 5, categorySlug: 'kerajinan-tangan', images: ['https://via.placeholder.com/400x400/DEB887/FFFFFF?text=Patung+Ukir'] },
  { name: 'Anyaman Tikar Pandan', description: 'Tikar anyaman pandan alami dari Madura. Ukuran 2x3 meter, tebal, nyaman dipakai, awet. Motif geometris tradisional.', price: 180000, stock: 15, categorySlug: 'kerajinan-tangan', images: ['https://via.placeholder.com/400x400/8FBC8F/FFFFFF?text=Tikar+Pandan'] },
  
  // Kesehatan & Kecantikan
  { name: 'Minyak Kayu Putih Asli', description: 'Minyak kayu putih 100% murni dari Maluku. Untuk pijat, aromaterapi, dan pereda nyeri otot. Botol 60ml dengan tutup dropper.', price: 55000, stock: 60, categorySlug: 'kesehatan-kecantikan', images: ['https://via.placeholder.com/400x400/20B2AA/FFFFFF?text=Minyak+Kayu+Putih'] },
  { name: 'Sabun Herbal Kunyit', description: 'Sabun alami kunyit dan madu untuk kulit berjerawat dan kusam. Tanpa SLS, paraben, pewangi sintetis. Berat 100gr.', price: 35000, stock: 80, categorySlug: 'kesehatan-kecantikan', images: ['https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Sabun+Kunyit'] },
  
  // Rumah Tangga
  { name: 'Wajan Anti Lengket Keramik', description: 'Wajan keramik anti lengket diameter 26cm. Bebas PFOA, panas merata, mudah dibersihkan. Cocok untuk memasak sehat.', price: 220000, stock: 20, categorySlug: 'rumah-tangga', images: ['https://via.placeholder.com/400x400/D2691E/FFFFFF?text=Wajan+Keramik'] },
  { name: 'Tempat Tumpuk Bambu', description: 'Rak penyimpanan bertingkat dari bambu anyaman. 3 tingkat, kuat menopang 15kg per tingkat. Ringan, estetik, ramah lingkungan.', price: 150000, stock: 18, categorySlug: 'rumah-tangga', images: ['https://via.placeholder.com/400x400/DEB887/FFFFFF?text=Rak+Bambu'] },
  
  // Elektronik & Gadget
  { name: 'Powerbank Kayu 10000mAh', description: 'Powerbank bodi kayu jati 10000mAh. Output 2.1A, support fast charging. Indikator LED, kabel built-in. Unik & fungsional.', price: 280000, stock: 12, categorySlug: 'elektronik-gadget', images: ['https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Powerbank+Kayu'] },
];

async function seedCategories() {
  console.log('📦 Seeding categories...');
  
  for (const cat of sampleCategories) {
    try {
      const existing = await adminDb.collection('categories').where('slug', '==', cat.slug).limit(1).get();
      if (!existing.empty) {
        console.log(`  ⏭️  Category "${cat.name}" already exists`);
        continue;
      }
      
      const catRef = adminDb.collection('categories').doc();
      await catRef.set({
        ...cat,
        id: catRef.id,
        imageUrl: null,
        parentId: null,
        productCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✅ Created category: ${cat.name} (${catRef.id})`);
    } catch (error) {
      console.error(`  ❌ Failed to create category ${cat.name}:`, error.message);
    }
  }
}

async function seedProducts() {
  console.log('📦 Seeding products...');
  
  // Get all categories to map slug to id
  const categoriesSnap = await adminDb.collection('categories').get();
  const categoryMap = {};
  categoriesSnap.docs.forEach(doc => {
    categoryMap[doc.data().slug] = doc.id;
  });
  
  // Get a store to assign products to (need at least one verified store)
  const storesSnap = await adminDb.collection('stores').where('isVerified', '==', true).limit(1).get();
  if (storesSnap.empty) {
    console.log('  ⚠️  No verified store found. Skipping product seeding.');
    return;
  }
  
  const store = storesSnap.docs[0];
  const storeData = store.data();
  
  // Get a seller user
  const sellerSnap = await adminDb.collection('users').where('storeId', '==', store.id).limit(1).get();
  if (sellerSnap.empty) {
    console.log('  ⚠️  No seller found for store. Skipping product seeding.');
    return;
  }
  const seller = sellerSnap.docs[0];
  
  for (const prod of sampleProducts) {
    try {
      const categoryId = categoryMap[prod.categorySlug];
      if (!categoryId) {
        console.log(`  ⚠️  Category ${prod.categorySlug} not found for product ${prod.name}`);
        continue;
      }
      
      const categoryDoc = await adminDb.collection('categories').doc(categoryId).get();
      const categoryName = categoryDoc.data()?.name || prod.categorySlug;
      
      const productRef = adminDb.collection('products').doc();
      const productData = {
        ...prod,
        id: productRef.id,
        storeId: store.id,
        sellerId: seller.id,
        categoryId,
        categoryName,
        images: prod.images,
        status: 'aktif',
        viewCount: Math.floor(Math.random() * 500),
        favoriteCount: Math.floor(Math.random() * 50),
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      };
      
      await productRef.set(productData);
      
      // Increment store product count
      await adminDb.collection('stores').doc(store.id).update({
        productCount: FieldValue.increment(1),
      });
      
      console.log(`  ✅ Created product: ${prod.name} (${productRef.id})`);
    } catch (error) {
      console.error(`  ❌ Failed to create product ${prod.name}:`, error.message);
    }
  }
}

async function main() {
  try {
    await seedCategories();
    await seedProducts();
    console.log('\n✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

main();