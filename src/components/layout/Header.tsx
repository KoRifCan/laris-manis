'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  HeartIcon, 
  UserCircleIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSyncExternalStore, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken,
  clearSession,
  getSessionSnapshot,
  subscribeSession,
} from '@/lib/client-auth';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    () => null
  );

  const handleLogout = async () => {
    const token = getToken();
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // tetap keluar lokal meski audit log gagal
    }
    clearSession();
    setMobileMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: HomeIcon },
    { href: '/katalog', label: 'Katalog', icon: MagnifyingGlassIcon },
    { href: '/toko', label: 'Toko', icon: ShoppingBagIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2" aria-label="Laris Manis - Beranda">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <ShoppingBagIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block" style={{ fontFamily: 'var(--font-display)' }}>
                Laris Manis
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:gap-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <link.icon className="h-5 w-5" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button (Mobile) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Buka pencarian"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Favorites */}
            <Link href="/favorit" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800">
              <HeartIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Favorit</span>
            </Link>

            {/* Auth/Profile */}
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              {session ? (
                <>
                  <span
                    className="flex items-center gap-1.5 px-2 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[12rem] truncate"
                    title={session.email || undefined}
                  >
                    <UserCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{session.displayName || session.email || 'Akun Saya'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:border-gray-500 transition-colors"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/daftar"
                    className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Buka menu"
              aria-expanded={mobileMenuOpen}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Link href="/" className="flex items-center gap-2" aria-label="Laris Manis - Beranda">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                  <ShoppingBagIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>Laris Manis</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Tutup menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <link.icon className="h-6 w-6" />
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <Link
                href="/favorit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              >
                <HeartIcon className="h-6 w-6" />
                Favorit
              </Link>
              <div className="pt-4 space-y-2">
                {session ? (
                  <>
                    <p className="px-3 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {session.displayName || session.email || 'Akun Saya'}
                    </p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/auth/daftar"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-brand-700"
                    >
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSearchOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Tutup pencarian"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Fitur pencarian akan segera hadir
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}