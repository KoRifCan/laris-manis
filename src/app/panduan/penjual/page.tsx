import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StaticPage } from '@/components/StaticPage';

const steps = [
  {
    n: '1',
    title: 'Daftar akun',
    desc: 'Buat akun pembeli lewat halaman Daftar. Semua penjual memulai dari sini — tidak ada form khusus untuk mendaftar.',
  },
  {
    n: '2',
    title: 'Ajukan toko',
    desc: 'Setelah masuk, buka halaman Jadi Penjual (di menu Profil atau di beranda). Isi nama toko, kategori, dan nomor WhatsApp bisnis Anda.',
  },
  {
    n: '3',
    title: 'Tunggu tinjauan admin',
    desc: 'Admin memeriksa keaslian toko dalam 1×24 jam kerja. Toko yang disetujui langsung tayang di katalog dan bisa dicari pembeli.',
  },
  {
    n: '4',
    title: 'Terbitkan produk',
    desc: 'Masuk ke mode Kelola Toko, lalu tambahkan produk: foto yang jelas, harga jujur, stok, dan deskripsi yang menjelaskan kondisi barang.',
  },
  {
    n: '5',
    title: 'Terima pesanan',
    desc: 'Calon pembeli menghubungi Anda lewat tombol WhatsApp di halaman produk. Setujui pesanan, kirim barang, selesai.',
  },
];

const tips = [
  'Foto produk dengan cahaya alami, latar bersih, satu produk satu foto utama.',
  'Harga ditulis lengkap — sertakan keterangan ongkir di deskripsi agar tidak ada pembeli kecewa.',
  'Balas pesan WA secepatnya; pembeli yang menunggu lama biasanya pindah ke toko lain.',
  'Perbarui stok dan arsipkan produk yang sudah habis supaya katalog tetap rapi.',
];

export default function PanduanPenjualPage() {
  return (
    <StaticPage
      title="Panduan Penjual"
      subtitle="Dari daftar toko sampai pesanan pertama — langkah demi langkah."
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

        <div className="mt-8 rounded-2xl border border-pandan-200 bg-pandan-50 p-5 dark:border-pandan-800 dark:bg-pandan-950">
          <h2 className="font-semibold text-pandan-900 dark:text-pandan-200">
            Tips toko laris
          </h2>
          <ul className="mt-3 space-y-2">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-sm leading-relaxed text-pandan-900/90 dark:text-pandan-100/90"
              >
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/daftar-penjual"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Ajukan toko sekarang
          </Link>
          <Link
            href="/kebijakan/penjual"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-950"
          >
            Baca kebijakan penjual
          </Link>
        </div>
      </div>
    </StaticPage>
  );
}
