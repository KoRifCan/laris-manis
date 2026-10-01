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
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useSyncExternalStore, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken,
  clearSession,
  getSessionSnapshot,
  subscribeSession,
} from '@/lib/client-auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getModeSnapshot, subscribeMode, setMode } from '@/lib/mode';
import { getMyAccount, type MyAccount } from '@/lib/account';

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
  const mode = useSyncExternalStore(subscribeMode, getModeSnapshot, () => 'belanja' as const);
  const [profileOpen, setProfileOpen] = useState(false);
  const [account, setAccount] = useState<MyAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Muat data akun (status toko) untuk menentukan item menu mode ganda
  useEffect(() => {
    let alive = true;
    if (session) {
      getMyAccount().then((data) => {
        if (alive) setAccount(data);
      });
    } else {
      // reset di microtask agar tidak memicu render berantai dari effect
      queueMicrotask(() => {
        if (alive) setAccount(null);
      });
    }
    return () => {
      alive = false;
    };
  }, [session]);

  // Tutup dropdown profil saat klik di luar / tekan Escape
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  const handleModeSwitch = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    if (mode === 'belanja') {
      setMode('toko');
      router.push('/dashboard/penjual');
    } else {
      setMode('belanja');
      router.push('/');
    }
  };

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

  // Dashboard sesuai role pengguna (null bila tidak punya dashboard)
  const role = session?.role || null;
  const dashboardHref =
    role === 'super_admin'
      ? '/dashboard/super-admin'
      : role === 'admin'
        ? '/dashboard/admin'
        : role === 'penjual' || role === 'staf_toko'
          ? '/dashboard/penjual'
          : null;

  const navLinks = [
    { href: '/', label: 'Beranda', icon: HomeIcon },
    { href: '/katalog', label: 'Katalog', icon: MagnifyingGlassIcon },
    { href: '/toko', label: 'Toko', icon: ShoppingBagIcon },
    { href: '/kategori', label: 'Kategori', icon: TagIcon },
    ...(dashboardHref
      ? [{ href: dashboardHref, label: 'Dashboard', icon: Squares2X2Icon }]
      : []),
  ];

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    router.push(q ? `/katalog?q=${encodeURIComponent(q)}` : '/katalog');
  };

  const overlayOpen = mobileMenuOpen || searchOpen;

  // Selama panel terbuka: kunci scroll halaman di belakang & tutup dengan Escape
  useEffect(() => {
    if (!overlayOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [overlayOpen]);

  return (
    <>
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

            {/* Ganti tema terang/gelap */}
            <ThemeToggle />

            {/* Auth/Profile */}
            <div className="hidden sm:flex sm:items-center sm:gap-3" ref={profileRef}>
              {session ? (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((open) => !open)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      aria-haspopup="menu"
                      aria-expanded={profileOpen}
                      title={session.email || undefined}
                    >
                      <UserCircleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="max-w-[10rem] truncate">
                        {session.displayName || session.email || 'Akun Saya'}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </button>

                    {profileOpen && (
                      <div
                        className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-gray-200 bg-white p-1.5 shadow-2xl dark:border-gray-800 dark:bg-gray-950"
                        role="menu"
                      >
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.email}
                        </div>
                        <Link
                          href="/akun/profil"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          role="menuitem"
                        >
                          <UserIcon className="h-4 w-4" aria-hidden="true" />
                          Profil
                        </Link>
                        <Link
                          href="/akun/pengaturan"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          role="menuitem"
                        >
                          <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
                          Pengaturan
                        </Link>
                        {dashboardHref && (
                          <Link
                            href={dashboardHref}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                            role="menuitem"
                          >
                            <Squares2X2Icon className="h-4 w-4" aria-hidden="true" />
                            Dashboard
                          </Link>
                        )}
                        {role === 'super_admin' && (
                          <>
                            <Link
                              href="/dashboard/super-admin?tab=users"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                              role="menuitem"
                            >
                              <UsersIcon className="h-4 w-4" aria-hidden="true" />
                              Kelola Pengguna
                            </Link>
                            <Link
                              href="/dashboard/super-admin?tab=categories"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                              role="menuitem"
                            >
                              <TagIcon className="h-4 w-4" aria-hidden="true" />
                              Kelola Kategori
                            </Link>
                            <Link
                              href="/dashboard/super-admin/logs"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                              role="menuitem"
                            >
                              <ClipboardDocumentListIcon className="h-4 w-4" aria-hidden="true" />
                              Log Aktivitas
                            </Link>
                          </>
                        )}
                        {account?.store?.isVerified && (
                          <button
                            type="button"
                            onClick={handleModeSwitch}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            role="menuitem"
                          >
                            <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
                            {mode === 'belanja' ? 'Mode Kelola Toko' : 'Mode Belanja'}
                          </button>
                        )}
                        <hr className="my-1.5 border-gray-200 dark:border-gray-800" />
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          role="menuitem"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" aria-hidden="true" />
                          Keluar
                        </button>
                      </div>
                    )}
                  </div>
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
    </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="absolute inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl animate-slide-in-right pt-[env(safe-area-inset-top)]"
            aria-label="Sidebar navigasi"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
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
            <nav className="p-4 space-y-2 overflow-y-auto overscroll-contain flex-1 pb-[max(1rem,env(safe-area-inset-bottom))]" aria-label="Mobile navigation">
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
                    <Link
                      href="/akun/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      <UserIcon className="h-6 w-6" aria-hidden="true" />
                      Profil
                    </Link>
                    <Link
                      href="/akun/pengaturan"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
                      Pengaturan
                    </Link>
                    {dashboardHref && (
                      <Link
                        href={dashboardHref}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                      >
                        <Squares2X2Icon className="h-6 w-6" aria-hidden="true" />
                        Dashboard
                      </Link>
                    )}
                    {role === 'super_admin' && (
                      <>
                        <Link
                          href="/dashboard/super-admin?tab=users"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                        >
                          <UsersIcon className="h-6 w-6" aria-hidden="true" />
                          Kelola Pengguna
                        </Link>
                        <Link
                          href="/dashboard/super-admin?tab=categories"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                        >
                          <TagIcon className="h-6 w-6" aria-hidden="true" />
                          Kelola Kategori
                        </Link>
                        <Link
                          href="/dashboard/super-admin/logs"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                        >
                          <ClipboardDocumentListIcon className="h-6 w-6" aria-hidden="true" />
                          Log Aktivitas
                        </Link>
                      </>
                    )}
                    {account?.store?.isVerified && (
                      <button
                        type="button"
                        onClick={handleModeSwitch}
                        className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
                      >
                        <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
                        {mode === 'belanja' ? 'Mode Kelola Toko' : 'Mode Belanja'}
                      </button>
                    )}
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
          </aside>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Pencarian">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl animate-slide-in-right pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Tutup pencarian"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
              </form>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto overscroll-contain flex-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Ketik kata kunci lalu tekan Enter untuk mencari di katalog
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}