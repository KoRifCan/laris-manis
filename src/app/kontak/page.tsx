import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const channels = [
  {
    icon: QuestionMarkCircleIcon,
    title: 'Pertanyaan umum',
    desc: 'Kemungkinan besar jawabannya sudah ada di Pusat Bantuan — belanja, akun, dan penjualan.',
    href: '/bantuan',
    label: 'Buka Pusat Bantuan',
  },
  {
    icon: BuildingStorefrontIcon,
    title: 'Soal pesanan Anda',
    desc: 'Untuk pesanan dan pembayaran, hubungi penjualnya langsung lewat tombol WhatsApp di halaman produk atau toko.',
    href: '/katalog',
    label: 'Cari tokonya',
  },
  {
    icon: BookOpenIcon,
    title: 'Untuk penjual',
    desc: 'Panduan toko, kebijakan, dan masalah teknis dashboard penjual ada di panduan penjual.',
    href: '/panduan/penjual',
    label: 'Buka panduan',
  },
];

const socials = [
  { name: 'Facebook', href: 'https://www.facebook.com/larismanis' },
  { name: 'Instagram', href: 'https://www.instagram.com/larismanis' },
  { name: 'X (Twitter)', href: 'https://twitter.com/larismanis' },
  { name: 'YouTube', href: 'https://www.youtube.com/@larismanis' },
];

export default function KontakPage() {
  return (
    <StaticPage
      title="Kontak"
      subtitle="Cara paling cepat untuk menemukan jawaban atau menyampaikan laporan."
    >
      <div className="max-w-3xl">
        <div className="grid grid-cols-1 gap-4">
          {channels.map((channel) => (
            <Link
              key={channel.href}
              href={channel.href}
              className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-brand-700"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <channel.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900 dark:text-white">
                  {channel.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {channel.desc}
                </span>
                <span className="mt-2 inline-block text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-400">
                  {channel.label} →
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            Media sosial resmi
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Kabar, pengumuman, dan tanggapan cepat bisa lewat kanal berikut.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-600 dark:hover:text-brand-300"
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-kunyit-200 bg-kunyit-50 p-5 dark:border-kunyit-800 dark:bg-kunyit-950">
          <p className="text-sm leading-relaxed text-kunyit-900/90 dark:text-kunyit-100/90">
            <strong className="font-semibold">Melaporkan toko atau produk?</strong> Sampaikan
            lewat pesan di media sosial resmi di atas, sertakan nama toko, nama produk, dan
            tangkapan layarnya. Laporan kami tinjau sebelum ditindaklanjuti.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}
