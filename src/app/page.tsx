import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ShoppingBagIcon, 
  MagnifyingGlassIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ShoppingBagIcon as StorefrontIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: TruckIcon,
    title: 'Gratis Ongkir',
    description: 'Gratis ongkir untuk pembelian minimal di toko yang berpartisipasi',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Produk Terverifikasi',
    description: 'Semua produk diverifikasi admin sebelum dipublikasikan ke katalog',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Chat Langsung ke Penjual',
    description: 'Hubungi penjual langsung via WhatsApp untuk tanya harga dan stok',
  },
  {
    icon: SparklesIcon,
    title: 'Ribuan Produk UMKM',
    description: 'Koleksi produk dari pengrajin dan pengusaha kecil seluruh Indonesia',
  },
];

const categories = [
  { name: 'Makanan & Minuman', slug: 'makanan-minuman', icon: '🍜', count: 1240 },
  { name: 'Fashion & Aksesoris', slug: 'fashion-aksesoris', icon: '👗', count: 2150 },
  { name: 'Kerajinan Tangan', slug: 'kerajinan-tangan', icon: '🎨', count: 890 },
  { name: 'Kesehatan & Kecantikan', slug: 'kesehatan-kecantikan', icon: '💄', count: 670 },
  { name: 'Rumah Tangga', slug: 'rumah-tangga', icon: '🏠', count: 1020 },
  { name: 'Elektronik & Gadget', slug: 'elektronik-gadget', icon: '📱', count: 450 },
];

const stats = [
  { label: 'Produk Aktif', value: '15.000+', icon: ShoppingBagIcon },
  { label: 'Toko Terverifikasi', value: '2.500+', icon: StorefrontIcon },
  { label: 'Penjual UMKM', value: '3.200+', icon: UsersIcon },
  { label: 'Kategori Produk', value: '50+', icon: SparklesIcon },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <Badge variant="success" className="mb-6" size="md">
                🇮🇩 Produk Lokal Indonesia • 100% UMKM Asli
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Temukan Produk UMKM
                <br />
                <span className="text-yellow-300">Berkualitas & Terjangkau</span>
              </h1>
              <p className="text-lg sm:text-xl text-brand-100 mb-8 max-w-2xl">
                Platform etalase produk UMKM terpercaya. Belanja langsung dari pengrajin dan 
                pengusaha kecil seluruh Indonesia. Semua produk diverifikasi, chat langsung ke penjual via WhatsApp.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/katalog">
                  <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50 px-8 py-3">
                    Jelajahi Katalog
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/daftar-penjual">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-brand-800 px-8 py-3">
                    Jadi Penjual
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="h-8 w-8 text-yellow-300" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold">{stat.value}</p>
                  <p className="text-brand-200 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Kategori Populer</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Temukan produk berdasarkan kategori favorit Anda</p>
              </div>
              <Link 
                href="/kategori" 
                className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/katalog?category=${category.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:shadow-lg transition-shadow"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="relative p-4 flex flex-col justify-end h-full">
                    <span className="text-4xl">{category.icon}</span>
                    <h3 className="mt-2 font-semibold text-white">{category.name}</h3>
                    <p className="text-xs text-brand-100">{category.count.toLocaleString('id-ID')} produk</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mengapa Memilih Laris Manis?</h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Platform yang dirancang untuk memudahkan UMKM menjual dan pembeli mencari produk lokal berkualitas
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/30 mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-600 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Mulai Jualan Online Anda Hari Ini</h2>
            <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan UMKM yang sudah memperluas jangkauan pasar mereka melalui Laris Manis. 
              Daftar gratis, kelola toko mudah, dan mulai menjual ke seluruh Indonesia.
            </p>
            <Link href="/auth/daftar-penjual">
              <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50 px-10 py-4 text-lg">
                Daftar Sebagai Penjual
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cara Belanja di Laris Manis</h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Mudah, cepat, dan langsung ke penjual</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 mx-auto mb-4">
                  <MagnifyingGlassIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">1. Cari Produk</h3>
                <p className="text-gray-600 dark:text-gray-400">Telusuri katalog atau gunakan pencarian dan filter untuk menemukan produk yang diinginkan</p>
              </div>
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">2. Hubungi Penjual</h3>
                <p className="text-gray-600 dark:text-gray-400">Klik tombol WhatsApp untuk chat langsung ke penjual, tanya stok, harga, dan detail produk</p>
              </div>
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 mx-auto mb-4">
                  <TruckIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">3. Pesan & Terima</h3>
                <p className="text-gray-600 dark:text-gray-400">Sepakati detail dengan penjual, lakukan pembayaran, dan terima barang di rumah</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}