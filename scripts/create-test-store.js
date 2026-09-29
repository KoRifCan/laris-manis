#!/usr/bin/env node
/**
 * Create a test store for the super admin and verify it
 * Then seed products
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
  console.error('❌ Missing Firebase Admin credentials');
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

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

async function createTestStore() {
  try {
    console.log('🔍 Finding super admin user...');
    const superAdmin = await adminAuth.getUserByEmail('admin@larismanis.com');
    console.log(`  ✅ Found super admin: ${superAdmin.uid}`);
    
    // Check if user already has a store
    const userDoc = await adminDb.collection('users').doc(superAdmin.uid).get();
    const userData = userDoc.data();
    
    if (userData?.storeId) {
      console.log(`  ℹ️  User already has store: ${userData.storeId}`);
      return userData.storeId;
    }
    
    // Create store
    console.log('🏪 Creating test store...');
    const storeRef = adminDb.collection('stores').doc();
    const storeData = {
      id: storeRef.id,
      ownerId: superAdmin.uid,
      name: 'Laris Manis Official',
      slug: 'laris-manis-official',
      description: 'Toko resmi Laris Manis untuk testing dan showcase produk UMKM Indonesia.',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      phone: '021-12345678',
      whatsapp: '6281234567890',
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await storeRef.set(storeData);
    await adminDb.collection('users').doc(superAdmin.uid).update({
      storeId: storeRef.id,
      role: 'penjual', // Also make them a seller
      updatedAt: new Date(),
    });
    
    await adminAuth.setCustomUserClaims(superAdmin.uid, { role: 'penjual' });
    
    console.log(`  ✅ Created store: ${storeRef.id}`);
    return storeRef.id;
  } catch (error) {
    console.error('❌ Failed to create test store:', error.message);
    throw error;
  }
}

async function verifyStore(storeId) {
  try {
    console.log('✅ Verifying store...');
    await adminDb.collection('stores').doc(storeId).update({
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: 'system',
      updatedAt: new Date(),
    });
    console.log(`  ✅ Store verified: ${storeId}`);
  } catch (error) {
    console.error('❌ Failed to verify store:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const storeId = await createTestStore();
    await verifyStore(storeId);
    console.log('\n✅ Test store created and verified!');
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

main();