import Link from 'next/link';
import {
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const values = [
  {
    icon: BuildingStorefrontIcon,
    title: 'Etalase, bukan gudang',
    desc: 'Laris Manis menampilkan toko-toko UMKM. Stok, harga, dan pengiriman ditentukan penjualnya langsung — tidak ada markup tengah.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Transaksi lewat percakapan',
    desc: 'Calon pembeli melihat dagangan di sini, lalu menghubungi penjual lewat WhatsApp. Tawar-menawar dan kesepakatan terjadi di antara dua pihak.',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Toko ditinjau manusia',
    desc: 'Setiap toko baru ditinjau admin sebelum tayang, supaya katalog tetap berisi pedagang yang benar-benar berjualan.',
  },
  {
    icon: ScaleIcon,
    title: 'Jujur apa adanya',
    desc: 'Tidak ada bintang palsu, angka kunjungan karangan, atau ulasan karangan. Kalau kosong, ya kosong.',
  },
];

export default function TentangPage() {
  return (
    <StaticPage
      title="Tentang Laris Manis"
      subtitle="Etalase digital untuk pedagang kecil Indonesia — supaya dagangannya terlihat, dan pembelinya tidak perlu bertanya-tanya."
    >
      <div className="max-w-3xl">
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          Laris Manis lahir dari keluhan yang sama berulang kali: pedagang punya produk bagus,
          pembeli mencari tiap hari, tapi keduanya tidak pernah bertemu. Grup media sosial penuh
          tapi buyar, marketplace besar makan porsi penjual kecil, dan iklan mahal bukan pilihan
          warung.
        </p>
        <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-400">
          Jadi kami membangun tempat sederhana: satu katalog bersama tempat UMKM memajang
          dagangannya. Pembeli datang, melihat apa yang dijual, membandingkan, lalu menghubungi
          penjualnya langsung. Tidak ada sistem bayar rumit di tengah — yang ada hanyalah etalase
          rapi dan percakapan yang jujur.
        </p>

        <h2 className="mt-10 text-xl font-bold text-gray-900 dark:text-white">
          Nilai yang kami pegang
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <value.icon
                className="h-6 w-6 text-brand-600 dark:text-brand-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{value.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {value.desc}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-bold text-gray-900 dark:text-white">
          Untuk siapa platform ini?
        </h2>
        <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
          Untuk penjual: ibu-ibu usaha katering, pengrajin, toko kelontong, reseller, dan siapa
          pun yang butuh etalase tanpa biaya langganan. Untuk pembeli: siapa pun yang ingin
          membeli dari pedagang sekitar, dengan harga yang masih bisa diajak bicara.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/katalog"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Jelajahi katalog
          </Link>
          <Link
            href="/auth/daftar-penjual"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-950"
          >
            Buka toko sendiri
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
