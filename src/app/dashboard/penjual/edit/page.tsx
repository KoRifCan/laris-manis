'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
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
} from '@/lib/client-auth';

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  bannerUrl?: string;
  isVerified?: boolean;
}

export default function TokoEditPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [noStore, setNoStore] = useState(false);
  const [store, setStore] = useState<Store | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    province: '',
    phone: '',
    whatsapp: '',
    logoUrl: '',
    bannerUrl: '',
  });

  useEffect(() => {
    if (!getSession()) {
      router.push('/auth/login?callbackUrl=/dashboard/penjual/edit');
      return;
    }
    (async () => {
      try {
        const res = await authFetch('/api/stores/me');
        const data = await readJson<Store>(res);
        if (res.status === 404 || !data?.success) {
          setNoStore(true);
          return;
        }
        if (!res.ok || !data?.success) {
          setError(data?.error || 'Gagal memuat data toko');
          return;
        }
        const s = data.data!;
        setStore(s);
        setForm({
          name: s.name ?? '',
          description: s.description ?? '',
          address: s.address ?? '',
          city: s.city ?? '',
          province: s.province ?? '',
          phone: s.phone ?? '',
          whatsapp: s.whatsapp ?? '',
          logoUrl: s.logoUrl ?? '',
          bannerUrl: s.bannerUrl ?? '',
        });
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'session') {
          router.push('/auth/login?callbackUrl=/dashboard/penjual/edit');
          return;
        }
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        address: form.address,
        city: form.city,
        province: form.province,
        phone: form.phone,
        whatsapp: form.whatsapp,
      };
      const logoUrl = form.logoUrl.trim();
      const bannerUrl = form.bannerUrl.trim();
      if (logoUrl) body.logoUrl = logoUrl;
      if (bannerUrl) body.bannerUrl = bannerUrl;

      const res = await authFetch('/api/stores/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Gagal menyimpan perubahan');
        return;
      }
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/dashboard/penjual/edit');
        return;
      }
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">Memuat data toko...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (noStore) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <Card className="w-full max-w-md p-8 text-center">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Anda belum memiliki toko
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ajukan pembuatan toko dulu lewat halaman Jadi Penjual, lalu kembali untuk
              mengelola profilnya.
            </p>
            <Link href="/auth/daftar-penjual" className="block mt-6">
              <Button className="w-full">Ajukan Toko</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/penjual"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Dashboard Penjual
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profil Toko</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {store?.isVerified
                ? 'Toko Anda sudah terverifikasi admin.'
                : 'Perubahan profil toko disimpan langsung.'}
            </p>
          </div>

          {error && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}
          {saved && (
            <div
              className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
              role="status"
            >
              Profil toko berhasil disimpan.
            </div>
          )}

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nama toko *"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi toko *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  minLength={10}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alamat *
                </label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  minLength={5}
                  maxLength={200}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Kota *"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                />
                <Input
                  label="Provinsi *"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Nomor telepon *"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={20}
                />
                <Input
                  label="Nomor WhatsApp *"
                  name="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={20}
                />
              </div>

              <Input
                label="URL logo toko (opsional)"
                name="logoUrl"
                type="url"
                value={form.logoUrl}
                onChange={handleChange}
                placeholder="https://contoh.com/logo.jpg"
                helperText="Kosongkan untuk memakai avatar default."
              />

              <Input
                label="URL banner toko (opsional)"
                name="bannerUrl"
                type="url"
                value={form.bannerUrl}
                onChange={handleChange}
                placeholder="https://contoh.com/banner.jpg"
              />

              <Button type="submit" className="w-full" size="lg" loading={saving}>
                Simpan Perubahan
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
