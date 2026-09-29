import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EtalaseCollage } from '@/components/home/EtalaseCollage';
import {
  FireIcon,
  ScissorsIcon,
  PaintBrushIcon,
  SparklesIcon,
  HomeModernIcon,
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { name: 'Makanan & Minuman', slug: 'makanan-minuman', icon: FireIcon, tint: 'bg-kunyit-200/70 text-kunyit-600 group-hover:bg-kunyit-300/70 dark:bg-kunyit-600/20 dark:text-kunyit-300' },
  { name: 'Fashion & Aksesoris', slug: 'fashion-aksesoris', icon: ScissorsIcon, tint: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-400' },
  { name: 'Kerajinan Tangan', slug: 'kerajinan-tangan', icon: PaintBrushIcon, tint: 'bg-pandan-50 text-pandan-600 group-hover:bg-pandan-100 dark:bg-pandan-700/30 dark:text-pandan-400' },
  { name: 'Kesehatan & Kecantikan', slug: 'kesehatan-kecantikan', icon: SparklesIcon, tint: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-400' },
  { name: 'Rumah Tangga', slug: 'rumah-tangga', icon: HomeModernIcon, tint: 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300' },
  { name: 'Elektronik & Gadget', slug: 'elektronik-gadget', icon: DevicePhoneMobileIcon, tint: 'bg-kunyit-200/70 text-kunyit-600 group-hover:bg-kunyit-300/70 dark:bg-kunyit-600/20 dark:text-kunyit-300' },
];

const steps = [
  {
    n: '1',
    title: 'Cari & pilih',
    desc: 'Telusuri katalog atau cari langsung. Semua dagangan ditampilkan apa adanya — foto, harga, dan stok dari penjualnya.',
  },
  {
    n: '2',
    title: 'Chat penjualnya',
    desc: 'Klik tombol WhatsApp, tanya stok, warna, atau minta dicarikan yang paling bagus. Tawar-menawar boleh.',
  },
  {
    n: '3',
    title: 'Sepakati & terima',
    desc: 'Bayar sesuai kesepakatan dengan penjual, lalu barang dikirim dari tokonya langsung ke rumah Anda.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero — etalase, bukan angka besar */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
            <defs>
              <pattern id="anyaman" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="24" stroke="#E4A82E" strokeWidth="7" />
                <line x1="12" y1="0" x2="12" y2="24" stroke="#FBF8F3" strokeWidth="3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#anyaman)" />
          </svg>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-24">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-kunyit-300">
                Etalase UMKM Indonesia
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                Yang{' '}
                <span className="relative inline-block">
                  laris manis
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="14"
                    viewBox="0 0 220 14"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 9.5C48 4 112 2.5 216 6.5"
                      stroke="#E4A82E"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                , beli langsung dari yang bikin.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                Dari dodol, batik, sampai anyaman bambu — dijual langsung oleh pemiliknya,
                bukan perantara. Bisa diajak chat sebelum beli, seperti belanja di warung tetangga.
              </p>

              <form action="/katalog" method="get" className="mt-8 flex max-w-xl gap-2">
                <label htmlFor="hero-search" className="sr-only">
                  Cari produk
                </label>
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  placeholder="Cari dodol, batik, kopi…"
                  className="min-w-0 flex-1 rounded-xl border-0 bg-white px-4 py-3.5 text-base text-gray-900 shadow-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-kunyit-400"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-kunyit-400 px-5 py-3.5 text-base font-semibold text-gray-900 shadow-lg transition-colors hover:bg-kunyit-300 focus:outline-none focus:ring-2 focus:ring-kunyit-300 focus:ring-offset-2 focus:ring-offset-brand-800"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                  Cari
                </button>
              </form>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/katalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-800 shadow-lg transition-colors hover:bg-gray-100"
                >
                  Lihat katalog
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/auth/daftar-penjual"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Buka etalase gratis
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2.5" role="list">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3.5 py-1.5 text-sm text-white/90">
                  <CheckBadgeIcon className="h-4 w-4 text-kunyit-300" aria-hidden="true" />
                  Diverifikasi admin
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3.5 py-1.5 text-sm text-white/90">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-kunyit-300" aria-hidden="true" />
                  Chat via WhatsApp
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3.5 py-1.5 text-sm text-white/90">
                  <TruckIcon className="h-4 w-4 text-kunyit-300" aria-hidden="true" />
                  Dikirim dari tokonya
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5">
              <EtalaseCollage />
            </div>
          </div>
        </section>

        {/* Kategori */}
        <section className="bg-white py-14 dark:bg-gray-950 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lagi cari apa?</h2>
                <p className="mt-1.5 text-gray-600 dark:text-gray-400">
                  Enam etalase utama, isinya dagangan UMKM sungguhan
                </p>
              </div>
              <Link
                href="/katalog"
                className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Lihat di katalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/katalog?category=${category.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${category.tint}`}
                  >
                    <category.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Yang bikin beda — bento asimetris */}
        <section className="bg-gray-100 py-14 dark:bg-gray-900 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Yang bikin beda</h2>
              <p className="mt-1.5 text-gray-600 dark:text-gray-400">
                Bukan katalog biasa — di sini setiap dagangan punya penjual yang bisa diajak bicara.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
              {/* Besar: chat langsung */}
              <div className="rounded-3xl bg-gray-900 p-6 text-white dark:bg-gray-950 sm:p-8 lg:row-span-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kunyit-400 text-gray-900">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Chat langsung ke penjualnya</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Bukan tiket support, bukan chatbot. Pesan Anda terbaca oleh orang yang membuat
                  atau menjual barangnya — lewat WhatsApp seperti biasa.
                </p>
                <div className="mt-5 space-y-2.5">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-2.5 text-sm text-white/90">
                    Kak, kopi robusta-nya masih ada?
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-kunyit-400 px-4 py-2.5 text-sm font-medium text-gray-900">
                    Masih, stok 30. Siap kirim hari ini.
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Dibalas via WhatsApp
                  </div>
                </div>
              </div>

              {/* Sedang: verifikasi */}
              <div className="rounded-3xl bg-white p-6 dark:bg-gray-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pandan-50 text-pandan-600 dark:bg-pandan-700/30 dark:text-pandan-400">
                  <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Lewat pemeriksaan admin
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Setiap produk dan toko ditinjau sebelum tayang. Yang bodong tidak masuk etalase.
                </p>
              </div>

              {/* Sedang: langsung ke penjual */}
              <div className="rounded-3xl bg-white p-6 dark:bg-gray-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Tanpa perantara
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Uang dan kesepakatan langsung dengan penjual. Laris Manis hanya menyediakan
                  etalasenya.
                </p>
              </div>

              {/* Lebar tipis: ongkir */}
              <div className="flex items-center gap-4 rounded-3xl bg-brand-50 p-6 dark:bg-brand-950 lg:col-span-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 dark:bg-gray-900 dark:text-brand-400">
                  <TruckIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    Gratis ongkir di toko yang ikut program
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                    Cari label gratis ongkir di halaman produk sebelum checkout ke WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tiga langkah */}
        <section className="bg-white py-14 dark:bg-gray-950 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tiga langkah, sampai depan pintu
              </h2>
              <p className="mt-1.5 text-gray-600 dark:text-gray-400">
                Alurnya sengaja dibuat sesingkat belanja di pasar.
              </p>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3 md:gap-10">
              <div
                className="absolute left-[10%] right-[10%] top-8 hidden border-t-2 border-dashed border-gray-300 dark:border-gray-700 md:block"
                aria-hidden="true"
              />
              {steps.map((step) => (
                <div key={step.n} className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white shadow-lg">
                    <span style={{ fontFamily: 'var(--font-display)' }}>{step.n}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA penjual — satu-satunya band emas */}
        <section className="bg-kunyit-400">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Punya dagangan? Pasang etalasenya.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-800 sm:text-lg">
                Daftar gratis, tunggu verifikasi admin, lalu produk Anda bisa dilihat dan dipesan
                orang dari seluruh Indonesia — chat-nya tetap lewat WhatsApp seperti biasa.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/daftar-penjual"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-gray-800"
                >
                  Buka etalase — gratis
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/toko"
                  className="text-base font-semibold text-gray-900 underline decoration-gray-900/40 underline-offset-4 hover:decoration-gray-900"
                >
                  Lihat toko yang sudah join
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
