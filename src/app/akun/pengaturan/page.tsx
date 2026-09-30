'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PaintBrushIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  authFetch,
  readJson,
  ApiError,
  errorMessage,
  getSession,
  clearSession,
} from '@/lib/client-auth';
import { getThemePref, setThemePref, type ThemePref } from '@/lib/theme';

const THEME_OPTIONS: { value: ThemePref; label: string }[] = [
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
  { value: 'system', label: 'Sistem' },
];

export default function PengaturanPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemePref>('system');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push(
        '/auth/login?callbackUrl=/akun/pengaturan&error=' +
          encodeURIComponent('Silakan masuk untuk membuka pengaturan.')
      );
      return;
    }
    setEmail(session.email || null);
    setTheme(getThemePref());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseTheme = (pref: ThemePref) => {
    setThemePref(pref);
    setTheme(pref);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Gagal mengganti kata sandi');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Kata sandi berhasil diganti.');
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/akun/pengaturan');
        return;
      }
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Tampilan, keamanan akun, dan sesi Anda.
            </p>
          </div>

          {message && (
            <div
              className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
              role="status"
            >
              {message}
            </div>
          )}
          {error && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Tampilan */}
          <Card className="p-6 mb-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <PaintBrushIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Tampilan
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Pilih mode terang, gelap, atau ikuti setelan perangkat.
            </p>
            <div className="mt-4 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseTheme(option.value)}
                  aria-pressed={theme === option.value}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    theme === option.value
                      ? 'bg-white text-brand-700 shadow dark:bg-gray-950 dark:text-brand-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Kata sandi */}
          <Card className="p-6 mb-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <KeyIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Ganti Kata Sandi
            </h2>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-5">
              <Input
                label="Kata sandi saat ini"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="Kata sandi baru"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                maxLength={64}
                helperText="Minimal 8 karakter."
              />
              <Input
                label="Ulangi kata sandi baru"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" loading={saving}>
                Simpan Kata Sandi
              </Button>
            </form>
          </Card>

          {/* Sesi & akun */}
          <Card className="p-6 mb-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Sesi &amp; Akun
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Masuk sebagai <strong>{email || '—'}</strong> di perangkat ini.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleLogout}>
                Keluar dari perangkat ini
              </Button>
              <Link href="/akun/profil">
                <Button variant="ghost">Ke Profil</Button>
              </Link>
            </div>
          </Card>

          {/* Referensi cepat */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <ShieldCheckIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Privasi &amp; Ketentuan
            </h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link href="/privasi" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
                <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />
                Kebijakan Privasi
              </Link>
              <Link href="/syarat" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
                <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />
                Syarat &amp; Ketentuan
              </Link>
              <Link href="/bantuan" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
                Pusat Bantuan
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
