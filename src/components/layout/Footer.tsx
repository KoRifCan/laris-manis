import Link from 'next/link';
import { ShoppingBagIcon, TruckIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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

  const features = [
    { icon: TruckIcon, title: 'Gratis Ongkir', desc: 'Untuk pembelian minimal' },
    { icon: ShieldCheckIcon, title: 'Garansi Produk', desc: 'Produk asli & berkualitas' },
    { icon: ChatBubbleLeftRightIcon, title: 'Chat Langsung', desc: 'Hubungi penjual via WA' },
    { icon: ShoppingBagIcon, title: 'Ribuan Produk', desc: 'Dari UMKM seluruh Indonesia' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2" aria-label="Laris Manis - Beranda">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                <ShoppingBagIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Laris Manis</span>
            </Link>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-xs">
              Platform etalase produk UMKM terpercaya. Temukan ribuan produk berkualitas dari pengrajin dan pengusaha kecil seluruh Indonesia.
            </p>
<div className="flex gap-6">
              <a href="https://facebook.com/larismanis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com/larismanis" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                  <feature.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Laris Manis. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}