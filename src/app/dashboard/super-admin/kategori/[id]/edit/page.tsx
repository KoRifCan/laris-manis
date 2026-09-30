'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  authFetch,
  readJson,
  ApiError,
  errorMessage,
  getSession,
} from '@/lib/client-auth';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
}

export default function KategoriEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [original, setOriginal] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    sortOrder: '0',
    isActive: true,
  });

  useEffect(() => {
    if (!getSession()) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/super-admin/kategori/${id}/edit`)}`);
      return;
    }
    if (!id) return;
    (async () => {
      try {
        const res = await authFetch(`/api/categories/${id}`);
        const data = await readJson<Category>(res);
        if (res.status === 404 || !data?.success) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setError(data?.error || 'Gagal memuat kategori');
          return;
        }
        const cat = data.data!;
        setOriginal(cat);
        setForm({
          name: cat.name ?? '',
          description: cat.description ?? '',
          imageUrl: cat.imageUrl ?? '',
          sortOrder: String(cat.sortOrder ?? 0),
          isActive: cat.isActive !== false,
        });
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'session') {
          router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/super-admin/kategori/${id}/edit`)}`);
          return;
        }
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
      };
      body.description = form.description.trim();
      const imageUrl = form.imageUrl.trim();
      if (imageUrl) body.imageUrl = imageUrl;

      const res = await authFetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setSaved(false);
        setError(data?.error || 'Gagal menyimpan perubahan');
        return;
      }
      setSaved(true);
    } catch (err) {
      setSaved(false);
      if (err instanceof ApiError && err.kind === 'session') {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/super-admin/kategori/${id}/edit`)}`);
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
          <p className="text-gray-600 dark:text-gray-400">Memuat kategori...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <Card className="w-full max-w-md p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kategori tidak ditemukan</h1>
            <Link href="/dashboard/super-admin" className="block mt-6">
              <Button className="w-full">Kembali ke Dashboard</Button>
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
            href="/dashboard/super-admin"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Dashboard Super Admin
          </Link>

          <div className="mb-6 flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Kategori</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Slug: <code className="font-mono">{original?.slug}</code>
              </p>
            </div>
            <Badge variant={form.isActive ? 'success' : 'secondary'}>
              {form.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>

          {error && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}
          {saved && !error && (
            <div
              className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
              role="status"
            >
              Kategori berhasil disimpan.
            </div>
          )}

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nama kategori *"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={50}
                helperText="Mengubah nama akan menurunkan slug baru secara otomatis."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              <Input
                label="URL gambar kategori (opsional)"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://contoh.com/kategori.jpg"
              />

              <Input
                label="Urutan tampil (sortOrder)"
                name="sortOrder"
                type="number"
                min={0}
                step={1}
                value={form.sortOrder}
                onChange={handleChange}
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategori aktif (tampil di katalog)
                </span>
              </label>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" size="lg" loading={saving}>
                  Simpan Perubahan
                </Button>
                <Link href="/dashboard/super-admin" className="flex-1">
                  <Button type="button" variant="outline" size="lg" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
