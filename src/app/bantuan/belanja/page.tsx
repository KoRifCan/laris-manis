import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const steps = [
  {
    n: '1',
    title: 'Cari produknya',
    desc: 'Gunakan pencarian di katalog, atau pilih kategori seperti Makanan & Minuman. Buka halaman produk untuk melihat foto, harga, stok, dan nama toko penjualnya.',
  },
  {
    n: '2',
    title: 'Periksa tokonya',
    desc: 'Klik nama toko untuk melihat profil dan seluruh dagangannya. Pastikan tokonya cocok dengan yang Anda cari sebelum lanjut.',
  },
  {
    n: '3',
    title: 'Chat penjualnya',
    desc: 'Klik tombol WhatsApp di halaman produk. Tanyakan stok, warna, ukuran, ongkir, atau minta ditawar — semua boleh di sini.',
  },
  {
    n: '4',
    title: 'Sepakati pembayarannya',
    desc: 'Metode pembayaran disepakati langsung dengan penjual: transfer, COD, atau cara lain yang disanggupi keduanya. Bayar hanya setelah detailnya jelas.',
  },
  {
    n: '5',
    title: 'Terima barangnya',
    desc: 'Barang dikirim dari toko penjualnya. Setelah diterima, periksa sesuai pesanan. Ada masalah? Hubungi penjualnya dulu untuk penyelesaian.',
  },
];

const tips = [
  'Simpan percakapan WhatsApp sebagai bukti kesepakatan harga dan pengiriman.',
  'Transfer hanya ke rekening yang disebutkan penjual di percakapan.',
  'Harga yang tertera adalah harga awal — ongkos kirim biasanya dihitung terpisah.',
  'Pesanan bermasalah? Coba selesaikan dengan penjual dulu, lalu laporkan ke kami lewat halaman Kontak.',
];

export default function BantuanBelanjaPage() {
  return (
    <StaticPage
      title="Cara Berbelanja"
      subtitle="Lima langkah dari cari produk sampai barang sampai di rumah."
    >
      <div className="max-w-3xl">
        <Link
          href="/bantuan"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Pusat Bantuan
        </Link>

        <ol className="space-y-4">
          {steps.map((step) => (
            <li
              key={step.n}
              className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {step.n}
              </span>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-kunyit-200 bg-kunyit-50 p-5 dark:border-kunyit-800 dark:bg-kunyit-950">
          <h2 className="font-semibold text-kunyit-900 dark:text-kunyit-200">
            Tips belanja aman
          </h2>
          <ul className="mt-3 space-y-2">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-sm leading-relaxed text-kunyit-900/90 dark:text-kunyit-100/90"
              >
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="font-semibold text-gray-900 dark:text-white">Punya pertanyaan lain?</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Lihat pusat bantuan untuk akun, penjualan, dan kebijakan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/bantuan"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Ke Pusat Bantuan
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
            >
              Mulai belanja
            </Link>
          </div>
        </div>
      </div>
    </StaticPage>
  );
}
