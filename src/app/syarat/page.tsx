import Link from 'next/link';
import { StaticPage } from '@/components/StaticPage';

const sections = [
  {
    title: 'Penerimaan syarat',
    body: [
      'Dengan membuka atau memakai Laris Manis, Anda dianggap menyetujui syarat dan ketentuan ini.',
      'Bila Anda tidak setuju, mohon tidak memakai layanan ini.',
    ],
  },
  {
    title: 'Akun pengguna',
    body: [
      'Anda boleh memakai katalog tanpa akun. Akun dibutuhkan untuk favorit, profil, dan berjualan.',
      'Anda bertanggung jawab menjaga kerahasiaan kata sandi dan atas aktivitas yang terjadi di akun Anda.',
      'Satu orang boleh memiliki akun pembeli sekaligus membuka toko setelah tokonya disetujui admin.',
    ],
  },
  {
    title: 'Kewajiban pembeli',
    body: [
      'Memakai bahasa yang wajar saat menghubungi penjual.',
      'Menyelesaikan pembayaran bila sudah bersepakat dengan penjual.',
      'Tidak menyebarkan informasi penjual yang diperoleh dari halaman produk di luar keperluan transaksi.',
    ],
  },
  {
    title: 'Kewajiban penjual',
    body: [
      'Menampilkan produk yang benar-benar dijual, dengan foto, harga, dan stok yang akurat.',
      'Merespons calon pembeli dengan sewajarnya dan mengirim pesanan sesuai kesepakatan.',
      'Mematuhi Kebijakan Penjual, termasuk larangan barang dan sanksinya.',
    ],
  },
  {
    title: 'Transaksi antar pengguna',
    body: [
      'Laris Manis adalah etalase: katalog produk dan kontak penjual.',
      'Perjanjian jual beli, pembayaran, dan pengiriman terjadi langsung antara pembeli dan penjual.',
      'Kami tidak menjadi pihak dalam transaksi dan tidak menahan dana siapa pun.',
    ],
  },
  {
    title: 'Larangan',
    body: [
      'Menjual barang terlarang, ilegal, atau menyesatkan.',
      'Memalsukan identitas toko, harga, atau stok.',
      'Melakukan penipuan, spam, atau tindakan yang merugikan pengguna lain.',
      'Mengambil konten Laris Manis untuk ditampilkan ulang tanpa izin.',
    ],
  },
  {
    title: 'Pembatasan tanggung jawab',
    body: [
      'Konten toko dan produk sepenuhnya tanggung jawab pemiliknya.',
      'Kami berusaha menjaga katalog tetap akurat, namun tidak menjamin ketersediaan produk selamanya.',
      'Kerusakan tidak langsung akibat penggunaan layanan tidak menjadi tanggung jawab kami sejauh diizinkan hukum.',
    ],
  },
  {
    title: 'Perubahan syarat',
    body: [
      'Syarat ini dapat diperbarui sewaktu-waktu dengan tanggal pembaruan dicantumkan di halaman ini.',
      'Pemakaian lanjut setelah perubahan berarti Anda menerima versi terbaru.',
    ],
  },
];

export default function SyaratPage() {
  return (
    <StaticPage
      title="Syarat & Ketentuan"
      subtitle="Aturan main memakai Laris Manis, untuk pembeli maupun penjual."
    >
      <div className="max-w-3xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Terakhir diperbarui: 30 September 2026
        </p>
        <div className="mt-6 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{section.title}</h2>
              <ul className="mt-3 space-y-2">
                {section.body.map((item) => (
                  <li
                    key={item}
                    className="relative pl-5 text-sm leading-relaxed text-gray-600 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-brand-500 dark:text-gray-400 dark:before:bg-brand-400"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Penjual wajib membaca{' '}
            <Link
              href="/kebijakan/penjual"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Kebijakan Penjual
            </Link>{' '}
            sebagai bagian dari syarat ini.
          </p>
        </div>
      </div>
    </StaticPage>
  );
}
