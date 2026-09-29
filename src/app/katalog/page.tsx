'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FilterSection } from './FilterSection';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryName: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  viewCount: number;
  favoriteCount: number;
  status: string;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  isVerified: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const initialFilters = {
  q: '',
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  city: '',
  province: '',
  sortBy: 'terbaru',
};

export default function KatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Record<string, Store>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, hasMore: false });
  const [showFilters, setShowFilters] = useState(false);
  const [paramsReady, setParamsReady] = useState(false);
  const [urlCategorySlug, setUrlCategorySlug] = useState<string | null>(null);

  // Baca ?q= dan ?category= dari URL (mis. dari hero & tile kategori)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const slug = params.get('category');
    if (q || slug) {
      setFilters((prev) => ({ ...prev, ...(q ? { q } : {}) }));
    }
    if (slug) setUrlCategorySlug(slug);
    setParamsReady(true);
  }, []);

  // Terjemahkan slug kategori -> categoryId setelah daftar kategori termuat
  useEffect(() => {
    if (!urlCategorySlug || categories.length === 0) return;
    const found = categories.find((c) => c.slug === urlCategorySlug);
    if (found) {
      setFilters((prev) => (prev.categoryId === found.id ? prev : { ...prev, categoryId: found.id }));
    }
  }, [urlCategorySlug, categories]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.items);
        setPagination(prev => ({ ...prev, total: data.data.total, hasMore: data.data.hasMore }));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (paramsReady) fetchProducts();
  }, [fetchProducts, paramsReady]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;
  const filterBadge = hasActiveFilters ? (
    <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-0.5 rounded-full text-xs">
      {activeFilterCount}
    </span>
  ) : null;

  const clearFiltersButton = hasActiveFilters ? (
    <Button type="button" variant="ghost" onClick={clearFilters} className="whitespace-nowrap">
      <XMarkIcon className="h-5 w-5 mr-1" />
      Hapus Filter
    </Button>
  ) : null;

  const formatLocation = (store?: Store) => {
    if (!store) return '';
    return `${store.city}, ${store.province}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Page Header & Filters */}
        <section className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Katalog Produk</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Temukan ribuan produk UMKM berkualitas dari seluruh Indonesia
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
                    placeholder="Cari nama produk, kategori, atau toko..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                {clearFiltersButton}
              </div>
            </form>
          </div>
        </section>

        {showFilters && (
          <FilterSection
            filters={filters}
            categories={categories}
            showFilters={showFilters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
        )}

        {/* Products Grid */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pagination.total} produk ditemukan
              </p>
            </div>

            {(() => {
              if (loading) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </Card>
                    ))}
                  </div>
                );
              }
              if (products.length === 0) {
                return (
                  <div className="text-center py-16">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tidak ada produk ditemukan</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Coba ubah filter atau kata kunci pencarian Anda</p>
                    <Button variant="outline" onClick={clearFilters}>Hapus Semua Filter</Button>
                  </div>
                );
              }
              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                      const store = stores[product.storeId];
                      const image = product.images[0] || 'https://via.placeholder.com/400';
                      
                      return (
                        <Link key={product.id} href={`/produk/${product.id}`} className="group">
                          <Card className="h-full group-hover:shadow-lg transition-shadow cursor-pointer">
                            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-3">
                              <img
                                src={image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <StatusBadge status={product.status} className="absolute top-2 right-2" />
                              {product.favoriteCount > 0 && (
                                <Badge variant="secondary" className="absolute bottom-2 right-2 flex items-center gap-1">
                                  <HeartIcon className="h-3 w-3" />
                                  {product.favoriteCount}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                                {product.categoryName}
                              </p>
                              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatRupiah(product.price)}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <ShoppingBagIcon className="h-4 w-4" />
                                <span className="truncate">{product.storeName}</span>
                                {store?.isVerified && (
                                  <span className="text-green-500">✓</span>
                                )}
                              </div>
                              {store && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                  <span>{formatLocation(store)}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination */}
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
            })()}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}