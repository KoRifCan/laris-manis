import Link from 'next/link';
import {
  BookOpenIcon,
  KeyIcon,
  BuildingStorefrontIcon,
  ScaleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const topics = [
  {
    icon: BookOpenIcon,
    title: 'Cara berbelanja',
    desc: 'Dari cari produk sampai barang sampai di rumah.',
    href: '/bantuan/belanja',
    label: 'Baca panduan',
  },
  {
    icon: KeyIcon,
    title: 'Akun & login',
    desc: 'Lupa kata sandi, verifikasi email, atau tidak bisa masuk.',
    href: '/auth/lupa-password',
    label: 'Atasi sekarang',
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Panduan penjual',
    desc: 'Cara buka toko, menerbitkan produk, dan menerima pesanan.',
    href: '/panduan/penjual',
    label: 'Baca panduan',
  },
  {
    icon: ScaleIcon,
    title: 'Kebijakan penjual',
    desc: 'Kewajiban, larangan, dan sanksi untuk penjual.',
    href: '/kebijakan/penjual',
    label: 'Baca kebijakan',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Privasi',
    desc: 'Data apa yang kami simpan dan bagaimana kami melindunginya.',
    href: '/privasi',
    label: 'Baca kebijakan',
  },
  {
    icon: DocumentTextIcon,
    title: 'Syarat & ketentuan',
    desc: 'Aturan main penggunaan Laris Manis.',
    href: '/syarat',
    label: 'Baca syarat',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Hubungi kami',
    desc: 'Pertanyaan yang belum terjawab di sini?',
    href: '/kontak',
    label: 'Lihat kontak',
  },
];

const faqs = [
  {
    q: 'Kenapa transaksinya lewat WhatsApp, bukan bayar di aplikasi?',
    a: 'Laris Manis adalah etalase, bukan pasar. Pembayaran dan pengiriman diatur langsung antara pembeli dan penjual, sehingga penjual bebas menentukan metode (transfer, COD, dll.) yang paling nyaman bagi pelanggannya.',
  },
  {
    q: 'Apakah saya harus daftar dulu untuk belanja?',
    a: 'Tidak. Anda bisa membuka katalog, mencari, dan melihat toko tanpa akun. Akun dibutuhkan kalau ingin menyimpan produk favorit dan mengelola profil.',
  },
  {
    q: 'Bagaimana cara jadi penjual?',
    a: 'Daftar akun pembeli dulu, lalu ajukan toko lewat halaman Jadi Penjual. Setelah ditinjau admin dan disetujui, toko Anda tayang dan Anda bisa menerbitkan produk dari dashboard penjual.',
  },
  {
    q: 'Ada yang menjual barang bermasalah, apa yang harus dilakukan?',
    a: 'Hubungi penjualnya terlebih dahulu lewat WhatsApp untuk penyelesaian. Bila tidak terselesaikan, laporkan ke kami lewat halaman Kontak disertai nama toko dan produknya — pelaporan ditindaklanjuti dan bisa berujung penangguhan toko.',
  },
];

export default function BantuanPage() {
  return (
    <StaticPage
      title="Pusat Bantuan"
      subtitle="Panduan singkat untuk belanja, akun, dan berjualan di Laris Manis."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-brand-700"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <topic.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-semibold text-gray-900 dark:text-white">{topic.title}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{topic.desc}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-400">
              {topic.label} →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pertanyaan umum</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </StaticPage>
  );
}
