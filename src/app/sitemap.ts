import type { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

const BASE_URL = 'https://laris-manis-id.vercel.app';

const STATIC_ROUTES: { path: string; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/katalog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/kategori', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/karir', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/tentang', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/kontak', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/panduan', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/bantuan', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/kebijakan', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/privasi', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/syarat', changeFrequency: 'yearly', priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const [productsSnap, storesSnap, categoriesSnap] = await Promise.all([
      adminDb.collection('products').where('status', '==', 'aktif').limit(1000).get(),
      adminDb.collection('stores').where('isVerified', '==', true).limit(500).get(),
      adminDb.collection('categories').where('isActive', '==', true).limit(100).get(),
    ]);

    productsSnap.docs.forEach((doc) => {
      const data = doc.data();
      entries.push({
        url: `${BASE_URL}/produk/${doc.id}`,
        lastModified: data.updatedAt instanceof Date ? data.updatedAt : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    storesSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.slug) return;
      entries.push({
        url: `${BASE_URL}/toko/${data.slug}`,
        lastModified: data.updatedAt instanceof Date ? data.updatedAt : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });

    categoriesSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.slug) return;
      entries.push({
        url: `${BASE_URL}/katalog?category=${doc.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });
  } catch (error) {
    // Firestore tidak tersedia saat build lokal — sitemap statis tetap valid
    console.error('Sitemap dynamic entries skipped:', error);
  }

  return entries;
}
