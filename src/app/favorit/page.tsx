'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { ApiError, authFetch, errorMessage, readJson } from '@/lib/client-auth';
import { 
  HeartIcon, 
  TrashIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FavoriteProduct {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  price: number;
  createdAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionExpired = () => {
    router.push(
      '/auth/login?callbackUrl=/favorit&error=' +
        encodeURIComponent('Sesi berakhir atau Anda belum login. Silakan masuk kembali.')
    );
  };

  const fetchFavorites = async () => {
    try {
      const res = await authFetch('/api/favorites');
      const data = await readJson<{ items: FavoriteProduct[] }>(res);
      if (!data) {
        setError('Server memberi respons yang tidak dikenali. Silakan coba lagi nanti.');
        return;
      }
      if (data.success) {
        setFavorites(data.data?.items ?? []);
      } else {
        setError(data.error || 'Gagal memuat favorit');
      }
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        sessionExpired();
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (productId: string) => {
    try {
      const res = await authFetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await readJson<{ isFavorite: boolean }>(res);
      if (data?.success && !data.data?.isFavorite) {
        setFavorites(prev => prev.filter(f => f.productId !== productId));
      } else {
        setError(data?.error || 'Gagal menghapus favorit');
      }
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        sessionExpired();
        return;
      }
      setError(errorMessage(err));
    }
  };

  const generateWhatsAppLink = (whatsapp: string, productName: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Halo, saya tertarik dengan produk "${productName}" di Laris Manis. Apakah masih tersedia?`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produk Favorit</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {favorites.length} produk yang Anda simpan
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Favorites Grid */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
                {error}
              </div>
            )}

            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <HeartIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Belum ada produk favorit</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Mulai jelajahi katalog dan simpan produk yang Anda suka</p>
                <Link href="/katalog">
                  <Button size="lg">
                    <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                    Jelajahi Katalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((fav) => {
                  const image = fav.productImage || 'https://via.placeholder.com/400';
                  const whatsappLink = `https://wa.me/${fav.storeName.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo, saya tertarik dengan produk "${fav.productName}" di Laris Manis. Apakah masih tersedia?`)}`;
                  
                  return (
                    <Link key={fav.productId} href={`/produk/${fav.productId}`} className="group">
                      <Card className="h-full group-hover:shadow-lg transition-shadow cursor-pointer relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFavorite(fav.productId);
                          }}
                          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
                          aria-label="Hapus dari favorit"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                        
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-3">
                          <img
                            src={image}
                            alt={fav.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {fav.productName}
                          </h3>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatRupiah(fav.price)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <ShoppingBagIcon className="h-4 w-4" />
                            <span className="truncate">{fav.storeName}</span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" className="flex-1 flex items-center justify-center gap-1 text-sm py-2" size="sm">
                                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                Chat
                              </Button>
                            </Link>
                            <Link href={`/toko/${fav.storeSlug}`}>
                              <Button variant="ghost" className="flex-1 flex items-center justify-center gap-1 text-sm py-2" size="sm">
                                <HomeIcon className="h-4 w-4" />
                                Toko
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
