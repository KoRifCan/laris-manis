import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';
import { categoryTiles } from '@/lib/category-tiles';

export default function KategoriPage() {
  return (
    <StaticPage
      title="Kategori"
      subtitle="Telusuri dagangan UMKM berdasarkan kategori. Setiap kategori langsung membuka katalog yang sudah difilter."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryTiles.map((category) => (
          <Link
            key={category.slug}
            href={`/katalog?category=${category.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-brand-700"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${category.tint}`}
            >
              <category.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-gray-900 dark:text-white">
                {category.name}
              </span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Lihat produk di katalog
              </span>
            </span>
            <ArrowRightIcon
              className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Belum tahu mau cari apa?</h2>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Buka katalog lengkap, atau mulai dari beranda untuk melihat yang sedang hangat.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/katalog"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Buka katalog
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            Ke beranda
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
