import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produk: [
      { label: 'Semua Produk', href: '/katalog' },
      { label: 'Kategori', href: '/kategori' },
      { label: 'Toko Terverifikasi', href: '/toko?verified=true' },
      { label: 'Produk Terbaru', href: '/katalog?sort=terbaru' },
    ],
    bantuan: [
      { label: 'Pusat Bantuan', href: '/bantuan' },
      { label: 'Cara Berbelanja', href: '/bantuan/belanja' },
      { label: 'Kebijakan Privasi', href: '/privasi' },
      { label: 'Syarat & Ketentuan', href: '/syarat' },
    ],
    penjual: [
      { label: 'Jadi Penjual', href: '/auth/daftar-penjual' },
      { label: 'Panduan Penjual', href: '/panduan/penjual' },
      { label: 'Dashboard Penjual', href: '/dashboard/penjual' },
      { label: 'Kebijakan Penjual', href: '/kebijakan/penjual' },
    ],
    tentang: [
      { label: 'Tentang Kami', href: '/tentang' },
      { label: 'Karir', href: '/karir' },
      { label: 'Blog', href: '/blog' },
      { label: 'Kontak', href: '/kontak' },
    ],
  };


  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2" aria-label="Laris Manis - Beranda">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                <ShoppingBagIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>Laris Manis</span>
            </Link>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-xs">
              Platform etalase produk UMKM terpercaya. Temukan ribuan produk berkualitas dari pengrajin dan pengusaha kecil seluruh Indonesia.
            </p>
<div className="flex gap-6">
              <a href="https://facebook.com/larismanis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com/larismanis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Instagram">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://twitter.com/larismanis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="https://youtube.com/@larismanis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="YouTube">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Produk</h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.produk.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bantuan</h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.bantuan.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Untuk Penjual</h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.penjual.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tentang Kami</h3>
                <ul className="mt-4 space-y-3" role="list">
                  {footerLinks.tentang.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>


        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Laris Manis · Dibuat untuk UMKM Indonesia. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}