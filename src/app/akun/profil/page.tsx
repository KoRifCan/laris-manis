'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserCircleIcon,
  PhotoIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  authFetch,
  readJson,
  ApiError,
  errorMessage,
  getSession,
  updateSessionUser,
} from '@/lib/client-auth';
import {
  getMyAccount,
  invalidateAccount,
  type MyAccount,
} from '@/lib/account';
import { setMode, getModeSnapshot } from '@/lib/mode';

// Kecilkan foto ke 160x160 JPEG supaya muat disimpan di dokumen profil.
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas tidak tersedia'));
        return;
      }
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak bisa dibaca'));
    };
    img.src = url;
  });
}

export default function ProfilPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [account, setAccount] = useState<MyAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [mode, setModeState] = useState<'belanja' | 'toko'>('belanja');

  const load = async () => {
    if (!getSession()) {
      router.push(
        '/auth/login?callbackUrl=/akun/profil&error=' +
          encodeURIComponent('Silakan masuk untuk membuka profil Anda.')
      );
      return;
    }
    try {
      const data = await getMyAccount(true);
      if (data) {
        setAccount(data);
        setDisplayName(data.displayName || '');
        setPhoneNumber(data.phoneNumber || '');
        setAddress(data.address || '');
        setPhotoURL(data.photoURL || null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setModeState(getModeSnapshot());
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB.');
      return;
    }
    try {
      setPhotoURL(await fileToDataUrl(file));
    } catch {
      setError('Gambar gagal diproses.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await authFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          phoneNumber,
          address,
          photoURL: photoURL ?? '',
        }),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Gagal menyimpan profil');
        return;
      }
      updateSessionUser({ displayName });
      invalidateAccount();
      setAccount(await getMyAccount(true));
      setMessage('Profil berhasil disimpan.');
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/akun/profil');
        return;
      }
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const switchMode = (next: 'belanja' | 'toko') => {
    setMode(next);
    setModeState(next);
    router.push(next === 'toko' ? '/dashboard/penjual' : '/');
  };

  const store = account?.store ?? null;
  const isApproved = Boolean(store?.isVerified);
  const isPending =
    store?.reviewStatus === 'pending' || account?.sellerApplicationStatus === 'pending';
  const isRejected =
    store?.reviewStatus === 'rejected' || account?.sellerApplicationStatus === 'rejected';

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Kelola data diri, foto, dan status toko Anda.
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

          {/* Data diri */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar src={photoURL} name={displayName || account?.email} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {displayName || account?.email}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {account?.email}
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                  Ubah foto
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhoto(e.target.files?.[0])}
                />
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <Input
                label="Nama lengkap"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
              <Input
                label="Nomor HP"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08xxxxxxxxxx"
                maxLength={20}
              />
              <Input
                label="Alamat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. ..., Kota"
                maxLength={300}
                helperText="Ditampilkan untuk keperluan pengiriman saat bertransaksi dengan penjual."
              />
              <Button type="submit" loading={saving}>
                Simpan Perubahan
              </Button>
            </form>
          </Card>

          {/* Status toko & mode ganda */}
          <Card className="p-6 mb-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <ShoppingBagIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Toko Saya
            </h2>

            {!store && (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-5 text-center dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Anda belum memiliki toko. Buka toko sendiri gratis — pengajuan ditinjau admin.
                </p>
                <Link href="/auth/daftar-penjual" className="mt-4 inline-block">
                  <Button>
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Buka Toko Sendiri
                  </Button>
                </Link>
              </div>
            )}

            {store && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {store.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {store.city ? `${store.city} · ` : ''}Slug: {store.slug}
                    </p>
                  </div>
                  {isApproved && (
                    <Badge variant="success" className="flex shrink-0 items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" aria-hidden="true" />
                      Terverifikasi
                    </Badge>
                  )}
                  {isPending && (
                    <Badge variant="warning" className="flex shrink-0 items-center gap-1">
                      <ClockIcon className="h-3 w-3" aria-hidden="true" />
                      Menunggu Verifikasi
                    </Badge>
                  )}
                  {isRejected && !isPending && !isApproved && (
                    <Badge variant="danger" className="flex shrink-0 items-center gap-1">
                      <ExclamationTriangleIcon className="h-3 w-3" aria-hidden="true" />
                      Ditolak
                    </Badge>
                  )}
                </div>

                {isPending && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pengajuan toko sedang ditinjau admin. Setelah disetujui, Anda bisa
                    menerbitkan produk dan berganti ke Mode Kelola Toko.
                  </p>
                )}

                {isRejected && !isPending && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {account?.sellerApplicationRejectionReason
                      ? `Alasan: ${account.sellerApplicationRejectionReason}`
                      : 'Pengajuan ditolak. Anda bisa memperbaiki data lalu mengajukan ulang.'}
                    <div className="mt-3">
                      <Link href="/auth/daftar-penjual" className="font-semibold underline">
                        Ajukan ulang
                      </Link>
                    </div>
                  </div>
                )}

                {isApproved && (
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950">
                    <p className="text-sm font-medium text-brand-800 dark:text-brand-200">
                      Mode aktif saat ini:{' '}
                      <strong>{mode === 'toko' ? 'Kelola Toko' : 'Belanja'}</strong>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {mode === 'belanja' ? (
                        <Button size="sm" onClick={() => switchMode('toko')}>
                          Pindah ke Mode Kelola Toko
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => switchMode('belanja')}>
                          Kembali ke Mode Belanja
                        </Button>
                      )}
                      <Link href="/dashboard/penjual">
                        <Button variant="outline" size="sm">
                          Buka Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {isRejected && (
                  <Link href="/auth/daftar-penjual" className="inline-block">
                    <Button size="sm">Ajukan Toko Lagi</Button>
                  </Link>
                )}
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            <Link
              href="/akun/pengaturan"
              className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Ke Pengaturan →
            </Link>
            <UserCircleIcon className="h-5 w-5 text-gray-300 dark:text-gray-700" aria-hidden="true" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
