import Link from 'next/link';
import { BriefcaseIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const who = [
  {
    icon: SparklesIcon,
    title: 'Pengembang',
    desc: 'React, Next.js, Firebase — bantu kami merapikan fitur baru untuk penjual kecil.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Pendamping UMKM',
    desc: 'Bantu toko-toko sekitar mendaftar, memotret produk, dan mengisi katalog.',
  },
];

export default function KarirPage() {
  return (
    <StaticPage
      title="Karir"
      subtitle="Bergabung membangun etalase untuk pedagang kecil."
    >
      <div className="max-w-3xl">
        <div className="rounded-2xl border border-kunyit-200 bg-kunyit-50 p-6 dark:border-kunyit-800 dark:bg-kunyit-950">
          <h2 className="font-semibold text-kunyit-900 dark:text-kunyit-200">
            Belum ada lowongan terbuka saat ini
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-kunyit-900/90 dark:text-kunyit-100/90">
            Kami menyebarkan lowongan lewat halaman ini begitu tersedia — tidak ada posisi palsu
            di sini. Ingin tahu lebih dulu? Pantau media sosial kami atau kirim pesan lewat
            halaman Kontak.
          </p>
        </div>

        <h2 className="mt-8 text-lg font-bold text-gray-900 dark:text-white">
          Orang yang kami cari (saat buka)
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {who.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <item.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/kontak"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
            Hubungi kami
          </Link>
          <Link
            href="/tentang"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-950"
          >
            Kenali Laris Manis
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
