'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { authFetch, readJson, ApiError, errorMessage } from '@/lib/client-auth';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryName: string;
  status: string;
  viewCount: number;
  favoriteCount: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<'produk' | 'statistik' | 'profil'>('produk');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'menunggu_review' | 'ditolak' | 'draft' | 'nonaktif'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // authFetch menyertakan Bearer token; 401 → lempar ApiError 'session'
      const [productsRes, storeRes] = await Promise.all([
        authFetch('/api/products/me'),
        authFetch('/api/stores/me'),
      ]);

      const productsData = await readJson<{ items: Product[] }>(productsRes);
      const storeData = await readJson<Store>(storeRes);

      if (productsData?.success) {
        setProducts(productsData.data?.items ?? []);
      }
      // 404 dari /api/stores/me = belum punya toko → tampilkan empty state
      setStore(storeRes.ok && storeData?.success && storeData.data ? storeData.data : null);
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/dashboard/penjual');
        return;
      }
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const getStatusCounts = () => {
    return {
      all: products.length,
      aktif: products.filter(p => p.status === 'aktif').length,
      menunggu_review: products.filter(p => p.status === 'menunggu_review').length,
      ditolak: products.filter(p => p.status === 'ditolak').length,
      draft: products.filter(p => p.status === 'draft').length,
      nonaktif: products.filter(p => p.status === 'nonaktif').length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        const data = await readJson(res);
        alert(data?.error || 'Gagal menghapus produk');
      }
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/dashboard/penjual');
        return;
      }
      alert(errorMessage(err));
    }
  };

  const handleSubmitReview = async (id: string) => {
    try {
      const res = await authFetch(`/api/products/${id}/submit-review`, { method: 'POST' });

      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'menunggu_review' } : p));
      } else {
        const data = await readJson(res);
        alert(data?.error || 'Gagal submit review');
      }
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/dashboard/penjual');
        return;
      }
      alert(errorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  // Belum punya toko → ajukan dulu
  if (!store) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
          <Card className="w-full max-w-md p-8 text-center">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-brand-600" aria-hidden="true" />
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              {loadError ? 'Gagal memuat dashboard' : 'Anda belum memiliki toko'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {loadError
                ? loadError
                : 'Ajukan toko Anda terlebih dahulu. Setelah disetujui admin, Anda bisa menerbitkan produk dan mengelola toko dari sini.'}
            </p>
            <div className="mt-6 space-y-3">
              {!loadError && (
                <Link href="/auth/daftar-penjual" className="block">
                  <Button className="w-full">Ajukan Jadi Penjual</Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setLoadError('');
                  setLoading(true);
                  fetchData();
                }}
              >
                Coba Lagi
              </Button>
            </div>
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Penjual</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Kelola toko dan produk Anda
                </p>
              </div>
              {store?.isVerified ? (
                <Link href="/produk/baru">
                  <Button className="flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Tambah Produk
                  </Button>
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
                  title="Tunggu verifikasi admin"
                >
                  <PlusIcon className="h-5 w-5" />
                  Tambah Produk
                </span>
              )}
            </div>

            {store && !store.isVerified && (
              <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <strong>Toko sedang menunggu verifikasi admin.</strong> Penambahan produk dan
                penayangan di katalog dibuka setelah pengajuan disetujui.
              </div>
            )}
            {loadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {loadError}
              </div>
            )}

            {/* Store Status */}
            {store && (
              <Card className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30">
                      <ShoppingBagIcon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Slug: {store.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {store.isVerified ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        Menunggu Verifikasi
                      </Badge>
                    )}
                    <Link href={`/toko/${store.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                        Lihat Toko
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex gap-8" aria-label="Dashboard tabs">
              <button
                onClick={() => setActiveTab('produk')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'produk' 
                    ? 'text-brand-600 dark:text-brand-400 border-brand-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Produk ({statusCounts.all})
              </button>
              <button
                onClick={() => setActiveTab('statistik')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'statistik' 
                    ? 'text-brand-600 dark:text-brand-400 border-brand-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Statistik
              </button>
              <button
                onClick={() => setActiveTab('profil')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profil' 
                    ? 'text-brand-600 dark:text-brand-400 border-brand-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Profil Toko
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'produk' && (
            <div>
              {/* Status Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'all', label: 'Semua', count: statusCounts.all },
                  { key: 'aktif', label: 'Aktif', count: statusCounts.aktif },
                  { key: 'menunggu_review', label: 'Review', count: statusCounts.menunggu_review },
                  { key: 'ditolak', label: 'Ditolak', count: statusCounts.ditolak },
                  { key: 'draft', label: 'Draft', count: statusCounts.draft },
                  { key: 'nonaktif', label: 'Nonaktif', count: statusCounts.nonaktif },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key as any)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === key
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <Card className="text-center py-12">
                  <ShoppingBagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {statusFilter === 'all' ? 'Belum ada produk' : `Tidak ada produk dengan status ${statusFilter}`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {statusFilter === 'all' 
                      ? 'Mulai tambahkan produk pertama Anda' 
                      : 'Coba ubah filter status'}
                  </p>
                  {statusFilter === 'all' && (
                    <Link href="/produk/baru">
                      <Button className="mt-2">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Tambah Produk Pertama
                      </Button>
                    </Link>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => {
                    const image = product.images[0] || 'https://via.placeholder.com/400';
                    return (
                      <Card key={product.id} className="relative">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-3">
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <StatusBadge status={product.status} className="absolute top-2 right-2" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                            {product.categoryName}
                          </p>
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatRupiah(product.price)}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-4 w-4" />
                              {product.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartIcon className="h-4 w-4" />
                              {product.favoriteCount}
                            </span>
                          </div>
                          {product.rejectionReason && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Alasan tolak: {product.rejectionReason}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/produk/${product.id}/edit`}>
                            <Button variant="outline" className="flex-1 flex items-center justify-center gap-1" size="sm">
                              <PencilIcon className="h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          {product.status === 'ditolak' && (
                            <Button
                              onClick={() => handleSubmitReview(product.id)}
                              variant="primary"
                              className="flex-1 flex items-center justify-center gap-1"
                              size="sm"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4" />
                              Review
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDelete(product.id)}
                            variant="danger"
                            className="flex-1 flex items-center justify-center gap-1"
                            size="sm"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistik' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 mx-auto mb-4">
                  <ShoppingBagIcon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statusCounts.aktif}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Produk Aktif</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30 mx-auto mb-4">
                  <ClockIcon className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statusCounts.menunggu_review}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Menunggu Review</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                  <XCircleIcon className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statusCounts.ditolak}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Ditolak</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                  <ChartBarIcon className="h-7 w-7 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{statusCounts.all}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Total Produk</p>
              </Card>
            </div>
          )}

          {activeTab === 'profil' && store && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profil Toko</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Toko</label>
                  <p className="text-gray-900 dark:text-white">{store.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                  <p className="text-gray-900 dark:text-white">{store.slug}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Verifikasi</label>
                  <div className="flex items-center gap-3">
                    {store.isVerified ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        Terverifikasi
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="warning" className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          Menunggu Verifikasi Admin
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Tim kami akan meninjau toko Anda dalam 1-2 hari kerja
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Link href={`/toko/${store.slug}`} target="_blank">
                  <Button variant="outline">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Lihat Toko Publik
                  </Button>
                </Link>
                <Link href="/dashboard/penjual/edit">
                  <Button>
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Edit Profil Toko
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}