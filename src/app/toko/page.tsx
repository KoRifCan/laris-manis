'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatRupiah } from '@/lib/utils';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  HomeIcon,
  StarIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  province: string;
  logoUrl?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
}

const initialFilters = {
  q: '',
  city: '',
  sortBy: 'rating',
  verified: '',
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    city: '',
    sortBy: 'rating',
    verified: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, hasMore: false });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/stores?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setStores(data.data.items);
        setPagination(prev => ({ ...prev, total: data.data.total, hasMore: data.data.hasMore }));
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  }

  function clearFilters() {
    setFilters({ q: '', city: '', sortBy: 'rating', verified: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  }

  const hasActiveFilters = ['q', 'city', 'verified'].some(key => filters[key] !== '');

  const activeFilterCount = ['q', 'city', 'verified'].filter(key => filters[key]).length;
  const filterBadge = hasActiveFilters ? (
    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs">
      {activeFilterCount}
    </span>
  ) : null;

  const clearFiltersButton = hasActiveFilters ? (
    <Button type="button" variant="ghost" onClick={clearFilters} className="whitespace-nowrap">
      <XMarkIcon className="h-5 w-5 mr-1" />
      Hapus Filter
    </Button>
  ) : null;

  const storesContent = loading ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </Card>
      ))}
    </div>
  ) : stores.length === 0 ? (
    <div className="text-center py-16">
      <HomeIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tidak ada toko ditemukan</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Coba ubah filter atau kata kunci pencarian Anda</p>
      <Button variant="outline" onClick={clearFilters}>Hapus Semua Filter</Button>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stores.map((store) => (
          <Link key={store.id} href={`/toko/${store.slug}`} className="group">
            <Card className="h-full group-hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-3">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <HomeIcon className="h-12 w-12" />
                  </div>
                )}
                {store.isVerified && (
                  <Badge variant="success" className="absolute top-2 right-2 flex items-center gap-1">
                    <ShieldCheckIcon className="h-3 w-3" />
                    Terverifikasi
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {store.description}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{store.city}, {store.province}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
                    {store.rating.toFixed(1)} ({store.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ShoppingBagIcon className="h-4 w-4" />
                  <span>{store.productCount} produk</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={loading}
          >
            Muat Lebih Banyak
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Page Header & Filters */}
        <section className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Semua Toko</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Temukan toko-toko UMKM terverifikasi dari seluruh Indonesia
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-5 w-5" />
                Filter {filterBadge}
              </Button>
            </div>

            <form onSubmit={handleSearch} className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
              <div className="flex gap-2 max-w-2xl">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    placeholder="Cari nama toko, kota, atau deskripsi..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {clearFiltersButton}
              </div>
            </form>
          </div>
        </section>

        {showFilters && (
          <section className="animate-slide-down">
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kota</label>
                    <input
                      type="text"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      placeholder="Contoh: Jakarta, Bandung, Surabaya"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutkan</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="rating">Rating Tertinggi</option>
                      <option value="terbaru">Terbaru</option>
                      <option value="produk">Produk Terbanyak</option>
                      <option value="nama">Nama A-Z</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verifikasi</label>
                    <select
                      value={filters.verified || ''}
                      onChange={(e) => handleFilterChange('verified', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Semua</option>
                      <option value="true">Terverifikasi saja</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* Stores Grid */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pagination.total} toko ditemukan
              </p>
            </div>

            {storesContent}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}