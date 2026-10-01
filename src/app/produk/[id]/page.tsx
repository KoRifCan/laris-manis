import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProductActions } from '@/components/product/ProductActions';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ReviewForm } from '@/components/product/ReviewForm';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatRupiah, formatDate, truncate } from '@/lib/utils';
import { serverOrigin } from '@/lib/server-origin';
import { 
  ChatBubbleLeftRightIcon, 
  HeartIcon, 
  TruckIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryName: string;
  categoryId: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogoUrl?: string;
  storeDescription: string;
  storeCity: string;
  storeProvince: string;
  storePhone: string;
  storeWhatsapp: string;
  storeIsVerified: boolean;
  storeRating: number;
  storeReviewCount: number;
  viewCount: number;
  favoriteCount: number;
  status: string;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  buyerName: string;
  createdAt: string;
  images?: string[];
}

async function getProduct(id: string): Promise<{ product: Product; reviews: Review[] } | null> {
  try {
    const origin = await serverOrigin();
    const [productRes, reviewsRes] = await Promise.all([
      fetch(`${origin}/api/products/${id}`, { next: { revalidate: 60 } }),
      fetch(`${origin}/api/reviews?productId=${id}&limit=5`, { next: { revalidate: 60 } }),
    ]);

    if (!productRes.ok) return null;
    
    const productData = await productRes.json();
    const reviewsData = await reviewsRes.json();
    
    if (!productData.success || productData.data.product.status !== 'aktif') return null;
    
    return {
      product: productData.data.product,
      reviews: reviewsData.success ? reviewsData.data.items : [],
    };
  } catch {
    return null;
  }
}

function generateWhatsAppLink(whatsapp: string, productName: string): string {
  const cleanNumber = whatsapp.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Halo, saya tertarik dengan produk "${productName}" di Laris Manis. Apakah masih tersedia?`
  );
  return `https://wa.me/${cleanNumber}?text=${message}`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getProduct(id);
  
  if (!data) {
    return { title: 'Produk Tidak Ditemukan' };
  }
  
  const { product } = data;
  
  return {
    title: product.name,
    description: truncate(product.description, 160),
    openGraph: {
      title: product.name,
      description: truncate(product.description, 160),
      images: product.images[0] ? [product.images[0]] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: truncate(product.description, 160),
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProduct(id);
  
  if (!data) notFound();
  
  const { product, reviews } = data;
  const whatsappLink = generateWhatsAppLink(product.storeWhatsapp, product.name);
  
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
              <li><Link href="/katalog" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Katalog</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href={`/katalog?category=${product.categoryId}`} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">{product.categoryName}</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 dark:text-white truncate max-w-[200px]" aria-current="page">{product.name}</li>
            </ol>
          </div>
        </nav>

        {/* Product Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Product Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative">
                <ProductGallery images={product.images} name={product.name} />
                <StatusBadge status={product.status} className="absolute top-3 right-3 z-10" />
                {product.storeIsVerified && (
                  <Badge variant="success" className="absolute top-3 left-3 z-10 flex items-center gap-1">
                    <ShieldCheckIcon className="h-3 w-3" />
                    Terverifikasi
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <Card className="p-6">
                  <div className="flex items-start gap-2 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                      <ShoppingBagIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">{product.categoryName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dijual oleh {product.storeName}</p>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">{formatRupiah(product.price)}</span>
                    {product.favoriteCount > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        {product.favoriteCount} disukai
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{product.storeCity}, {product.storeProvince}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Dibuat {formatDate(product.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        Pesan via WhatsApp
                      </Button>
                    </a>
                    <ProductActions
                      productId={product.id}
                      productName={product.name}
                      productDescription={product.description}
                    />
                  </div>
                </Card>

                {/* Store Info */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar src={product.storeLogoUrl} name={product.storeName} size="lg" />
                    <div>
                      <Link href={`/toko/${product.storeSlug}`} className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400">
                        {product.storeName}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {product.storeIsVerified && <Badge variant="success" className="flex items-center gap-1"><ShieldCheckIcon className="h-3 w-3" /> Terverifikasi</Badge>}
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
                          {product.storeRating.toFixed(1)} ({product.storeReviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{product.storeDescription}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{product.storeCity}, {product.storeProvince}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span>{product.storePhone}</span>
                    </div>
                    <Link href={`/toko/${product.storeSlug}`} className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                      Lihat Profil Toko
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Details */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Deskripsi Produk</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{product.description}</p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ulasan ({reviews.length})</h2>
                  {reviews.length > 3 && (
                    <Link href={`/produk/${product.id}#reviews`} className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                      Lihat Semua
                      <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                  )}
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar name={review.buyerName} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{review.buyerName}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-current text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                />
                              ))}
                              <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Belum ada ulasan. Jadilah yang pertama mengulas produk ini.
                  </p>
                )}
                <div className="mt-6">
                  <ReviewForm productId={product.id} />
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Informasi Produk</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Kategori</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{product.categoryName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Dilihat</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{product.viewCount} kali</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Disukai</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{product.favoriteCount} kali</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Status</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      <StatusBadge status={product.status} />
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-6 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
                    <TruckIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Pengiriman</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-green-500" /> Produk asli & berkualitas</li>
                  <li className="flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-green-500" /> Dikirim dari {product.storeCity}</li>
                  <li className="flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 text-green-500" /> Bisa COD area tertentu</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}