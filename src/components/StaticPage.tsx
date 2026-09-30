import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// Kerangka halaman statis: header hero + konten + footer.
// Pakai token warna global supaya otomatis ikut tema terang/gelap.
export function StaticPage({ title, subtitle, children }: StaticPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">
                Beranda
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-gray-700 dark:text-gray-300">{title}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </section>
        <section className="bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
