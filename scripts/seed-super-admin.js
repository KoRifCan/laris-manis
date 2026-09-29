#!/usr/bin/env node
/**
 * Seed Script untuk membuat Super Admin pertama
 * Jalankan sekali saja: node scripts/seed-super-admin.js
 * 
 * Butuh environment variables:
 * - FIREBASE_ADMIN_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY
 * - SUPER_ADMIN_EMAIL
 * - SUPER_ADMIN_PASSWORD
 * - SUPER_ADMIN_NAME
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
  console.error('❌ Missing Firebase Admin credentials in environment variables');
  process.exit(1);
}

const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

if (!superAdminEmail || !superAdminPassword) {
  console.error('❌ Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD');
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

async function seedSuperAdmin() {
  try {
    console.log('🔍 Checking if super admin already exists...');
    
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(superAdminEmail);
      console.log(`✅ User already exists: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('👤 Creating new super admin user...');
        userRecord = await adminAuth.createUser({
          email: superAdminEmail,
          password: superAdminPassword,
          displayName: superAdminName,
          emailVerified: true,
        });
        console.log(`✅ Created user: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Set custom claims
    console.log('🔐 Setting custom claims (role: super_admin)...');
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'super_admin' });

    // Create user document in Firestore
    console.log('📝 Creating user document in Firestore...');
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: superAdminEmail,
      displayName: superAdminName,
      role: 'super_admin',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    console.log('✅ Super Admin seeded successfully!');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Role: super_admin`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  Delete this script or remove credentials from env after use!');

  } catch (error) {
    console.error('❌ Error seeding super admin:', error.message);
    process.exit(1);
  }
}

seedSuperAdmin();