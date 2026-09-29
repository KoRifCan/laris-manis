'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FilterSectionProps {
  filters: {
    q: string;
    categoryId: string;
    minPrice: string;
    maxPrice: string;
    city: string;
    province: string;
    sortBy: string;
  };
  categories: { id: string; name: string }[];
  showFilters: boolean;
  onFilterChange: (key: string, value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
}

export function FilterSection({
  filters,
  categories,
  showFilters,
  onFilterChange,
  onSearch,
  onClearFilters,
  hasActiveFilters,
  onToggleFilters,
}: FilterSectionProps) {
  return (
    <>
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
              onClick={onToggleFilters}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filter {hasActiveFilters && <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs">{Object.values(filters).filter(v => v).length}</span>}
            </Button>
          </div>

          <form onSubmit={onSearch} className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <div className="flex gap-2 max-w-2xl">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  value={filters.q}
                  onChange={(e) => onFilterChange('q', e.target.value)}
                  placeholder="Cari nama produk, kategori, atau toko..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {hasActiveFilters && (
                <Button type="button" variant="ghost" onClick={onClearFilters} className="whitespace-nowrap">
                  <XMarkIcon className="h-5 w-5 mr-1" />
                  Hapus Filter
                </Button>
              )}
            </div>
          </form>

          {showFilters && (
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => onFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Min</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange('minPrice', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Max</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                    placeholder="1000000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kota</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => onFilterChange('city', e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutkan</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="termurah">Termurah</option>
                    <option value="termahal">Termahal</option>
                    <option value="terlaris">Terlaris</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}