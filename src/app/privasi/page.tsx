import { StaticPage } from '@/components/StaticPage';

const sections = [
  {
    title: 'Data yang kami kumpulkan',
    items: [
      'Data akun saat Anda mendaftar: nama, alamat email, dan kata sandi (disimpan dalam bentuk terenkripsi oleh sistem autentikasi Firebase Authentication).',
      'Profil tambahan bila Anda melengkapi: nomor HP, alamat, dan foto profil.',
      'Data toko & produk bila Anda berjualan: nama toko, deskripsi, lokasi, nomor kontak WA, serta foto dan harga produk.',
      'Data favorit: daftar produk yang Anda simpan, untuk menampilkan kembali favorit Anda.',
      'Data teknis dasar seperti halaman yang diakses dan waktu kunjungan, sebatas untuk menjaga keamanan layanan.',
    ],
  },
  {
    title: 'Bagaimana data dipakai',
    items: [
      'Menampilkan katalog, toko, dan produk kepada pengunjung.',
      'Menjaga sesi login Anda tetap aktif (token disimpan di peramban Anda).',
      'Menghubungkan Anda dengan penjual saat Anda menghubungi mereka.',
      'Mencegah penyalahgunaan, seperti pendaftaran toko yang melanggar ketentuan.',
    ],
  },
  {
    title: 'Penyimpanan layanan',
    items: [
      'Data disimpan di Google Firebase (basis data Firestore dan autentikasi).',
      'Aplikasi dijalankan di Vercel, yang merekam log teknis terbatas untuk keperluan operasional.',
      'Foto produk disimpan di penyimpanan Firebase Storage bila Anda mengunggahnya.',
    ],
  },
  {
    title: 'Cookie & penyimpanan lokal',
    items: [
      'Kami memakai penyimpanan lokal (localStorage) peramban untuk menyimpan sesi login dan preferensi antarmuka.',
      'Kami tidak memakai cookie iklan pihak ketiga dan tidak menjual data Anda kepada siapa pun.',
    ],
  },
  {
    title: 'Berbagi data',
    items: [
      'Nama toko dan produk Anda tayang publik — memang itu gunanya etalase.',
      'Data pribadi Anda (email, nomor HP) tidak ditampilkan ke publik.',
      'Kami tidak menjual, menyewakan, atau menukarkan data Anda kepada pihak ketiga.',
    ],
  },
  {
    title: 'Hak Anda',
    items: [
      'Anda dapat memperbarui nama, nomor HP, alamat, dan foto profil melalui halaman Profil.',
      'Anda dapat meminta penghapusan akun dan datanya dengan menghubungi kami lewat halaman Kontak.',
      'Anda dapat berhenti memakai layanan kapan pun dengan mengeluarkan akun.',
    ],
  },
  {
    title: 'Perubahan kebijakan',
    items: [
      'Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan selalu dicantumkan di halaman ini.',
      'Perubahan besar akan diumumkan lewat pengumuman di situs.',
    ],
  },
];

export default function PrivasiPage() {
  return (
    <StaticPage
      title="Kebijakan Privasi"
      subtitle="Apa yang kami simpan, mengapa disimpan, dan bagaimana melindunginya."
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
                {section.items.map((item) => (
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
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Ada pertanyaan soal data Anda? Hubungi kami lewat halaman Kontak.
        </p>
      </div>
    </StaticPage>
  );
}
