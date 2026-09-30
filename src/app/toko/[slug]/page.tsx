import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatRupiah, formatDate } from '@/lib/utils';
import { 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { ProductImage } from '@/components/ProductImage';
import { serverOrigin } from '@/lib/server-origin';

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  bannerUrl?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryName: string;
  categoryId: string;
  storeId: string;
  viewCount: number;
  favoriteCount: number;
  status: string;
  createdAt: string;
}

async function getStore(slug: string): Promise<{ store: Store; products: Product[] } | null> {
  try {
    const res = await fetch(`${await serverOrigin()}/api/stores?slug=${slug}`, { 
      next: { revalidate: 60 },
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.success || !data.data.store) return null;
    
    return {
      store: data.data.store,
      products: data.data.products || [],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStore(slug);
  
  if (!data) {
    return { title: 'Toko Tidak Ditemukan' };
  }
  
  const { store } = data;
  
  return {
    title: store.name,
    description: store.description || `Toko ${store.name} di Laris Manis - ${store.productCount} produk`,
    openGraph: {
      title: store.name,
      description: store.description || `Toko ${store.name} di Laris Manis`,
      images: store.logoUrl ? [store.logoUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: store.description || `Toko ${store.name} di Laris Manis`,
      images: store.logoUrl ? [store.logoUrl] : [],
    },
  };
}

function generateWhatsAppLink(whatsapp: string, storeName: string): string {
  const cleanNumber = whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Halo, saya tertarik dengan produk di toko "${storeName}" di Laris Manis. Apakah masih tersedia?`
  );
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

export default async function StoreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStore(slug);
  
  if (!data) notFound();
  
  const { store, products } = data;
  const whatsappLink = generateWhatsAppLink(store.whatsapp, store.name);
  
  const activeProducts = products.filter(p => p.status === 'aktif');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" aria-label="Breadcrumb">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-2 text-sm">
              <li><Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Beranda</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href="/toko" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Toko</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 dark:text-white truncate max-w-[200px]" aria-current="page">{store.name}</li>
            </ol>
          </div>
        </nav>

        {/* Store Header */}
        <section className="bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar src={store.logoUrl} name={store.name} size="xl" />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
                    {store.isVerified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <ShieldCheckIcon className="h-3 w-3" />
                        Terverifikasi
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
                      {store.rating.toFixed(1)} ({store.reviewCount} ulasan)
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBagIcon className="h-4 w-4" />
                      {store.productCount} produk
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Hubungi via WhatsApp
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <HeartIcon className="h-5 w-5" />
                  Simpan Toko
                </Button>
              </div>
            </div>
          </div>

          {/* Store Info Tabs */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex gap-8" aria-label="Store tabs">
                <button className="py-4 text-sm font-medium text-brand-600 dark:text-brand-400 border-b-2 border-brand-600">
                  Produk ({activeProducts.length})
                </button>
                <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Tentang Toko
                </button>
                <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Ulasan ({store.reviewCount})
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Produk Dari Toko Ini</h2>
              {activeProducts.length === 0 && products.length > 0 && (
                <Badge variant="secondary">Menunggu review admin: {products.length - activeProducts.length} produk</Badge>
              )}
            </div>

            {activeProducts.length === 0 ? (
              <div className="text-center py-16">
                <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Belum ada produk aktif</h3>
                <p className="text-gray-600 dark:text-gray-400">Toko ini belum memiliki produk yang diterbitkan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeProducts.map((product) => {
                  return (
                    <Link key={product.id} href={`/produk/${product.id}`} className="group">
                      <Card className="h-full group-hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-3">
                          <ProductImage
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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