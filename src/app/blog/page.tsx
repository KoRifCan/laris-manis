import Link from 'next/link';
import { PencilSquareIcon, BookOpenIcon, FireIcon } from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const links = [
  {
    icon: BookOpenIcon,
    title: 'Panduan Penjual',
    desc: 'Langkah lengkap membuka toko dan menerbitkan produk.',
    href: '/panduan/penjual',
    label: 'Baca panduan',
  },
  {
    icon: FireIcon,
    title: 'Cara Berbelanja',
    desc: 'Dari cari produk sampai barang tiba di rumah.',
    href: '/bantuan/belanja',
    label: 'Baca panduan',
  },
  {
    icon: PencilSquareIcon,
    title: 'Kebijakan Penjual',
    desc: 'Aturan katalog, kewajiban, dan sanksi.',
    href: '/kebijakan/penjual',
    label: 'Baca kebijakan',
  },
];

export default function BlogPage() {
  return (
    <StaticPage
      title="Blog"
      subtitle="Catatan seputar jualan kecil, katalog, dan kabar Laris Manis."
    >
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Artikel sedang disiapkan
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Belum ada tulisan yang terbit. Daripada menampilkan artikel kosong atau hasil
            karangan, kami pilih menunda dulu. Sementara itu, panduan berikut bisa langsung
            dibaca.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-brand-700"
            >
              <item.icon
                className="h-6 w-6 text-brand-600 dark:text-brand-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-400">
                {item.label} →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/katalog"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Lihat katalog
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
