'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/utils';
import { getSession, setSession, readJson } from '@/lib/client-auth';
import { Modal } from '@/components/ui/Modal';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import {
  startGoogleSignIn,
  completeGoogleLinkWithPassword,
} from '@/lib/google-auth';
import type { OAuthCredential } from 'firebase/auth';
import { 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tiba dari halaman lain tanpa pesan (?callbackUrl= tanpa ?error=) →
  // tampilkan konteks agar pengguna tahu mengapa diminta masuk
  const defaultNotice =
    errorParam || (callbackUrl !== '/' ? 'Silakan masuk terlebih dahulu untuk melanjutkan.' : '');
  const [error, setError] = useState(defaultNotice);
  const [success, setSuccess] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  // Email Google sama dgn akun password → minta password utk menautkan (satu akun)
  const [googlePending, setGooglePending] = useState<{
    email: string;
    credential: OAuthCredential | null;
  } | null>(null);
  const [googlePassword, setGooglePassword] = useState('');
  const [googleLinkLoading, setGoogleLinkLoading] = useState(false);

  // Sudah login? tidak perlu menampilkan form lagi.
  useEffect(() => {
    if (getSession()) {
      router.replace(callbackUrl);
    }
  }, [router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError('Tidak ada koneksi internet. Periksa jaringan Anda lalu coba lagi.');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await readJson<{ idToken: string }>(res);

      if (!res.ok) {
        if (res.status >= 500) {
          setError(data?.error || 'Server sedang mengalami gangguan. Silakan coba lagi beberapa saat lagi.');
        } else {
          setError(data?.error || 'Login gagal. Periksa email dan password Anda.');
        }
        return;
      }

      if (!data?.success || !data.data?.idToken) {
        setError('Respons server tidak valid. Silakan coba lagi nanti.');
        return;
      }

      setSession(data.data.idToken, {
        displayName: data.data.displayName ?? null,
        email: data.data.email ?? null,
        role: data.data.role ?? null,
      });
      setSuccess('Login berhasil! Mengalihkan...');
      setTimeout(() => router.push(callbackUrl), 1500);
    } catch {
      setError(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'Tidak ada koneksi internet. Periksa jaringan Anda lalu coba lagi.'
          : 'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const finishGoogleLogin = async (idToken: string) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await readJson<{
        idToken: string;
        displayName?: string;
        email?: string;
        role?: string;
      }>(res);
      if (!res.ok || !data?.success || !data.data?.idToken) {
        setError(data?.error || 'Gagal masuk dengan Google. Silakan coba lagi.');
        return;
      }
      setSession(data.data.idToken, {
        displayName: data.data.displayName ?? null,
        email: data.data.email ?? null,
        role: data.data.role ?? null,
      });
      setSuccess('Login berhasil! Mengalihkan...');
      setTimeout(() => router.push(callbackUrl), 1200);
    } catch {
      setError('Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await startGoogleSignIn();
      if (result.status === 'success' && result.idToken) {
        await finishGoogleLogin(result.idToken);
      } else if (result.status === 'needs-password' && result.email) {
        setGooglePending({ email: result.email, credential: result.credential ?? null });
      } else if (result.status === 'error') {
        setError(result.message || 'Gagal masuk dengan Google.');
      }
      // 'cancelled' → biarkan senyap
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googlePending) return;
    setGoogleLinkLoading(true);
    setError('');
    try {
      const result = await completeGoogleLinkWithPassword(
        googlePending.email,
        googlePassword,
        googlePending.credential
      );
      if (result.status === 'success' && result.idToken) {
        setGooglePending(null);
        setGooglePassword('');
        await finishGoogleLogin(result.idToken);
      } else if (result.status === 'error') {
        setError(result.message || 'Gagal menautkan akun Google.');
      }
    } finally {
      setGoogleLinkLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-brand-100 dark:bg-brand-900/30 mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Masuk ke Akun Anda</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Masuk untuk mengakses fitur lengkap Laris Manis</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                autoComplete="email"
                leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
                  rightContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ingat saya</span>
                </label>
                <Link href="/auth/lupa-password" className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                  Lupa password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Masuk
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-500 dark:text-gray-400">atau</span>
              <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-4 w-full"
              loading={googleLoading}
              onClick={handleGoogle}
            >
              <GoogleIcon className="h-5 w-5 mr-2" />
              Masuk dengan Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Belum punya akun?{' '}
                <Link href="/auth/daftar" className="text-brand-600 hover:text-brand-700 font-medium dark:text-brand-400 dark:hover:text-brand-300">
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </Card>

          <Modal
            isOpen={!!googlePending}
            onClose={() => {
              setGooglePending(null);
              setGooglePassword('');
            }}
            title="Kaitkan akun Google"
            description={
              googlePending
                ? `Email ${googlePending.email} sudah terdaftar. Masukkan password akun ini untuk mengaitkan Google — email yang sama berarti satu akun yang sama.`
                : ''
            }
            size="sm"
          >
            <form onSubmit={handleGoogleLinkSubmit} className="space-y-4">
              <Input
                label="Password"
                type="password"
                value={googlePassword}
                onChange={(e) => setGooglePassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                autoFocus
              />
              <Button type="submit" className="w-full" loading={googleLinkLoading}>
                Kaitkan &amp; Masuk
              </Button>
            </form>
          </Modal>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><Header /><main className="flex-1 flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div></main><Footer /></div>}>
      <LoginForm />
    </Suspense>
  );
}