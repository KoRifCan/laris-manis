'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProductImageUpload } from '@/components/product/ProductImageUpload';
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
}

export default function ProdukBaruPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Staf toko: wajib menentukan toko tujuan (storeId) — penjual pakai tokonya sendiri.
  const [stafStores, setStafStores] = useState<{ id: string; name: string }[]>([]);
  const [targetStoreId, setTargetStoreId] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    stock: '1',
    images: '',
    status: 'draft' as 'draft' | 'menunggu_review',
  });

  useEffect(() => {
    if (!getSession()) {
      router.push('/auth/login?callbackUrl=/produk/baru');
      return;
    }
    (async () => {
      try {
        const [catRes, meRes] = await Promise.all([
          fetch('/api/categories'),
          authFetch('/api/users/me'),
        ]);
        const data = await readJson<Category[]>(catRes);
        if (data?.success) setCategories(data.data ?? []);
        const me = await readJson<{
          role?: string;
          assignedStores?: { id: string; name: string }[];
        }>(meRes);
        if (meRes.ok && me?.success && me.data?.role === 'staf_toko') {
          const stores = (me.data.assignedStores || []).map((s) => ({ id: s.id, name: s.name }));
          setStafStores(stores);
          if (stores.length > 0) setTargetStoreId(stores[0].id);
        }
      } catch {
        // kategori gagal dimuat — pilihan akan kosong, user bisa ulang
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const imageList = form.images
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setSaving(true);
    try {
      const res = await authFetch('/api/products/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          categoryId: form.categoryId,
          price: parseInt(form.price, 10),
          stock: parseInt(form.stock, 10),
          images: imageList.length > 0 ? imageList : [],
          status: form.status,
          ...(targetStoreId ? { storeId: targetStoreId } : {}),
        }),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Gagal menyimpan produk');
        return;
      }
      router.push('/dashboard/penjual');
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/produk/baru');
        return;
      }
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tambah Produk</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Produk baru bisa langsung diajukan review agar tayang di katalog.
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

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nama produk *"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                placeholder="Contoh: Keripik Singkong Balado 200g"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi produk *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  minLength={10}
                  maxLength={5000}
                  placeholder="Jelaskan isi, berat, kondisi, dan keunggulan produk"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori *
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">
                    {loading ? 'Memuat kategori...' : 'Pilih kategori'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Harga (Rp) *"
                  name="price"
                  type="number"
                  min={1}
                  step={1}
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="25000"
                />
                <Input
                  label="Stok *"
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Foto produk (URL, satu per baris, maksimal 5)
                </label>
                <ProductImageUpload
                  onUploaded={(url) =>
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.trim() ? `${prev.images.trim()}\n${url}` : url,
                    }))
                  }
                  disabled={saving}
                />
                <textarea
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  rows={4}
                  placeholder={'https://contoh.com/foto1.jpg\nhttps://contoh.com/foto2.jpg'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none font-mono text-sm"
                />
                {imageList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imageList.map((url, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${url}-${index}`}
                        src={url}
                        alt={`Pratinjau ${index + 1}`}
                        className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status awal
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="draft">Draft — simpan dulu, ajukan nanti</option>
                  <option value="menunggu_review">Langsung ajukan review admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <PhotoIcon className="h-5 w-5" aria-hidden="true" />
                Kosongkan foto untuk memakai gambar sementara. Foto tayang setelah produk disetujui admin.
              </div>

              {stafStores.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Toko Tujuan (staf toko)
                  </label>
                  <select
                    value={targetStoreId}
                    onChange={(e) => setTargetStoreId(e.target.value)}
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {stafStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {stafStores.length === 0 && loading === false && targetStoreId === '' && getSession()?.role === 'staf_toko' && (
                <div role="alert" className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                  Akun staf toko belum ditugaskan ke toko mana pun. Hubungi admin untuk penugasan.
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={saving}>
                Simpan Produk
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
