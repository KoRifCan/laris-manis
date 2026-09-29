import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore, FieldValue } from 'firebase-admin/firestore';

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(adminConfig),
    projectId: adminConfig.projectId,
  });
} else {
  adminApp = getApps()[0];
}

adminAuth = getAuth(adminApp);
adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb, FieldValue };