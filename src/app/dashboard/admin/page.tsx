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
  UsersIcon,
  ShoppingBagIcon,
  StorefrontIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface PendingStore {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  ownerId: string;
  createdAt: string;
}

interface PendingProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  categoryName: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [pendingStores, setPendingStores] = useState<PendingStore[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'umkm' | 'produk'>('umkm');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [storesRes, productsRes] = await Promise.all([
        fetch('/api/admin/stores/pending', { credentials: 'include' }),
        fetch('/api/admin/products/pending', { credentials: 'include' }),
      ]);

      if (storesRes.status === 401 || productsRes.status === 401) {
        router.push('/auth/login?callbackUrl=/dashboard/admin');
        return;
      }

      const storesData = await storesRes.json();
      const productsData = await productsRes.json();

      if (storesData.success) {
        setPendingStores(storesData.data.items);
      }
      if (productsData.success) {
        setPendingProducts(productsData.data.items);
      }
    } catch {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStore = async (storeId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Yakin ingin menolak UMKM ini? Masukkan alasan di prompt berikut.')) return;
    
    const reason = action === 'reject' ? prompt('Alasan penolakan:') : undefined;
    if (action === 'reject' && !reason) return;

    try {
      const res = await fetch(`/api/admin/stores/${storeId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
        credentials: 'include',
      });
      
      if (res.ok) {
        setPendingStores(prev => prev.filter(s => s.id !== storeId));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal memverifikasi');
      }
    } catch {
      console.error('Failed to verify store');
    }
  };

  const handleReviewProduct = async (productId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Yakin ingin menolak produk ini? Masukkan alasan di prompt berikut.')) return;
    
    const reason = action === 'reject' ? prompt('Alasan penolakan:') : undefined;
    if (action === 'reject' && !reason) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
        credentials: 'include',
      });
      
      if (res.ok) {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal review produk');
      }
    } catch {
      console.error('Failed to review product');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Verifikasi UMKM dan review produk
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <StorefrontIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingStores.length}</p>
                  <p className="text-gray-600 dark:text-gray-400">UMKM Menunggu Verifikasi</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                  <ShoppingBagIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingProducts.length}</p>
                  <p className="text-gray-600 dark:text-gray-400">Produk Menunggu Review</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex gap-8" aria-label="Admin tabs">
              <button
                onClick={() => setActiveTab('umkm')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'umkm' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Verifikasi UMKM ({pendingStores.length})
              </button>
              <button
                onClick={() => setActiveTab('produk')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'produk' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Review Produk ({pendingProducts.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'umkm' && (
            <div>
              {pendingStores.length === 0 ? (
                <Card className="text-center py-12">
                  <StorefrontIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tidak ada UMKM menunggu verifikasi</h3>
                  <p className="text-gray-600 dark:text-gray-400">Semua pengajuan toko telah diproses</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingStores.map((store) => (
                    <Card key={store.id} className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{store.name}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{store.city}, {store.province}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{store.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              Dibuat: {new Date(store.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleVerifyStore(store.id, 'reject')}
                            variant="danger"
                            size="sm"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Tolak
                          </Button>
                          <Button 
                            onClick={() => handleVerifyStore(store.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Setujui
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'produk' && (
            <div>
              {pendingProducts.length === 0 ? (
                <Card className="text-center py-12">
                  <ShoppingBagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tidak ada produk menunggu review</h3>
                  <p className="text-gray-600 dark:text-gray-400">Semua produk telah diproses</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingProducts.map((product) => {
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
                          <StatusBadge status="menunggu_review" className="absolute top-2 right-2" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                            {product.categoryName}
                          </p>
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatRupiah(product.price)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Toko: {product.storeName}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleReviewProduct(product.id, 'reject')}
                            variant="danger"
                            className="flex-1 flex items-center justify-center gap-1"
                            size="sm"
                          >
                            <XCircleIcon className="h-4 w-4" />
                            Tolak
                          </Button>
                          <Button 
                            onClick={() => handleReviewProduct(product.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 flex-1 flex items-center justify-center gap-1"
                            size="sm"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Setujui
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}