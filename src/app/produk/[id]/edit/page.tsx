'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { ProductImage } from '@/components/ProductImage';
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

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  stock: number;
  images: string[];
  status: string;
  rejectionReason?: string;
}

type StatusOption = 'draft' | 'menunggu_review' | 'aktif' | 'nonaktif' | 'ditolak';

export default function ProdukEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [original, setOriginal] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    stock: '1',
    images: '',
    status: 'draft' as StatusOption,
  });

  useEffect(() => {
    if (!getSession()) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/produk/${id}/edit`)}`);
      return;
    }
    if (!id) return;
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          authFetch(`/api/products/${id}`),
          fetch('/api/categories'),
        ]);
        const prodData = await readJson<{ product: Product }>(prodRes);
        if (!prodRes.ok || !prodData?.success) {
          setNotFound(true);
          return;
        }
        const p = prodData.data!.product;
        setOriginal(p);
        setForm({
          name: p.name,
          description: p.description,
          categoryId: p.categoryId,
          price: String(p.price),
          stock: String(p.stock),
          images: (p.images || []).join('\n'),
          status: (p.status as StatusOption) || 'draft',
        });

        const catData = await readJson<Category[]>(catRes);
        if (catData?.success) setCategories(catData.data ?? []);
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'session') {
          router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/produk/${id}/edit`)}`);
          return;
        }
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    if (!original) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price: parseInt(form.price, 10),
        stock: parseInt(form.stock, 10),
      };
      // foto diisi → kirim; kosongkan → biarkan foto lama
      if (imageList.length > 0) body.images = imageList;
      // kirim status hanya bila berubah (penulis non-admin tak boleh set 'aktif')
      if (form.status !== original.status) body.status = form.status;

      const res = await authFetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Gagal menyimpan perubahan');
        return;
      }
      router.push('/dashboard/penjual');
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/produk/${id}/edit`)}`);
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
          <p className="text-gray-600 dark:text-gray-400">Memuat produk...</p>
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Produk tidak ditemukan</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Produk ini tidak ada atau Anda tidak memiliki akses kepadanya.
            </p>
            <Link href="/dashboard/penjual" className="block mt-6">
              <Button className="w-full">Kembali ke Dashboard</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const statusOptions: StatusOption[] = ['draft', 'menunggu_review', 'aktif', 'nonaktif', 'ditolak'];
  const visibleStatuses = statusOptions.filter(
    (s) => s === form.status || s === 'draft' || s === 'menunggu_review' || s === 'nonaktif'
  );

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

          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Produk</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{original?.name}</p>
            </div>
            {original && <StatusBadge status={original.status} />}
          </div>

          {original?.status === 'ditolak' && original.rejectionReason && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              <strong>Alasan penolakan admin:</strong> {original.rejectionReason}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Pilih kategori</option>
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
                />
                <textarea
                  name="images"
                  value={form.images}
                  onChange={handleChange}
                  rows={4}
                  placeholder={'https://contoh.com/foto1.jpg\nhttps://contoh.com/foto2.jpg'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {(imageList.length > 0 ? imageList : original?.images || []).map((url, index) => (
                    <ProductImage
                      key={`${url}-${index}`}
                      src={url}
                      alt={`Foto ${index + 1}`}
                      className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Kosongkan untuk mempertahankan foto saat ini.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {visibleStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s === 'draft' && 'Draft — belum diajukan'}
                      {s === 'menunggu_review' && 'Menunggu review admin'}
                      {s === 'aktif' && 'Aktif — tayang di katalog'}
                      {s === 'nonaktif' && 'Nonaktif — sembunyikan dari katalog'}
                      {s === 'ditolak' && 'Ditolak admin'}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Perubahan status ke &quot;Aktif&quot; tetap memerlukan persetujuan admin.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <PhotoIcon className="h-4 w-4" aria-hidden="true" />
                Foto tayang setelah produk disetujui admin.
              </div>

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
