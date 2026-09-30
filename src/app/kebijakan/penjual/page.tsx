import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const obligations = [
  {
    title: 'Produk harus sesuai gambar',
    body: 'Foto, deskripsi, dan kondisi barang harus sama dengan yang dikirim. Produk bekas wajib diberi label bekas.',
  },
  {
    title: 'Harga & stok jujur',
    body: 'Harga yang tertera adalah harga dasar; ongkir disepakati terpisah di percakapan. Stok dan ketersediaan diperbarui bila berubah.',
  },
  {
    title: 'Respons yang wajar',
    body: 'Balas pesan WhatsApp calon pembeli dalam waktu sewajarnya. Pesanan yang sudah disepakati dikirim sesuai janji.',
  },
  {
    title: 'Produk asli & legal',
    body: 'Barang yang dijual milik sendiri atau resmi dijual, tidak melanggar hak merek, dan bukan hasil peniruan.',
  },
];

const prohibitions = [
  'Narkotika, obat terlarang, atau zat berbahaya lain.',
  'Senjata, bahan peledak, dan barang melanggar hukum.',
  'Barang hasil curian, tiruan, atau merek palsu.',
  'Jasa perjudian, pinjaman bodong, atau investasi bodong.',
  'Dokumen negara palsu atau data pribadi orang lain.',
];

const sanctions = [
  {
    level: 'Teguran',
    desc: 'Pelanggaran ringan (foto menyesatkan, stok tidak diperbarui) diberi teguran tertulis dan waktu perbaikan.',
  },
  {
    level: 'Penangguhan',
    desc: 'Pelanggaran berulang atau menengah membuat toko disembunyikan sementara dari katalog sampai diperbaiki.',
  },
  {
    level: 'Penonaktifan',
    desc: 'Pelanggaran berat (penipuan, barang terlarang) berujung penonaktifan toko dan akun penjualnya.',
  },
];

export default function KebijakanPenjualPage() {
  return (
    <StaticPage
      title="Kebijakan Penjual"
      subtitle="Kewajiban, larangan, dan sanksi untuk menjaga katalog tetap bisa dipercaya."
    >
      <div className="max-w-3xl">
        <Link
          href="/bantuan"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Pusat Bantuan
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Terakhir diperbarui: 30 September 2026
        </p>

        <section className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kewajiban penjual</h2>
          <div className="mt-4 space-y-4">
            {obligations.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Barang yang dilarang</h2>
          <ul className="mt-3 space-y-2">
            {prohibitions.map((item) => (
              <li
                key={item}
                className="relative pl-5 text-sm leading-relaxed text-gray-600 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-kunyit-500 dark:text-gray-400"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sanksi</h2>
          <div className="mt-4 space-y-3">
            {sanctions.map((item) => (
              <div
                key={item.level}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
              >
                <span className="h-fit rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {item.level}
                </span>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/panduan/penjual"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Baca panduan penjual
          </Link>
          <Link
            href="/kontak"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-950"
          >
            Laporkan toko
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
