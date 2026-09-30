import {
  FireIcon,
  ScissorsIcon,
  PaintBrushIcon,
  SparklesIcon,
  HomeModernIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

// Tile kategori dipakai bersama oleh homepage dan halaman /kategori
// supaya ikon, slug, dan warna tidak duplikasi.
export const categoryTiles = [
  {
    name: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    icon: FireIcon,
    tint: 'bg-kunyit-200/70 text-kunyit-600 group-hover:bg-kunyit-300/70 dark:bg-kunyit-600/20 dark:text-kunyit-300',
  },
  {
    name: 'Fashion & Aksesoris',
    slug: 'fashion-aksesoris',
    icon: ScissorsIcon,
    tint: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-400',
  },
  {
    name: 'Kerajinan Tangan',
    slug: 'kerajinan-tangan',
    icon: PaintBrushIcon,
    tint: 'bg-pandan-50 text-pandan-600 group-hover:bg-pandan-100 dark:bg-pandan-700/30 dark:text-pandan-400',
  },
  {
    name: 'Kesehatan & Kecantikan',
    slug: 'kesehatan-kecantikan',
    icon: SparklesIcon,
    tint: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-400',
  },
  {
    name: 'Rumah Tangga',
    slug: 'rumah-tangga',
    icon: HomeModernIcon,
    tint: 'bg-gray-100 text-gray-700 group-hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300',
  },
  {
    name: 'Elektronik & Gadget',
    slug: 'elektronik-gadget',
    icon: DevicePhoneMobileIcon,
    tint: 'bg-kunyit-200/70 text-kunyit-600 group-hover:bg-kunyit-300/70 dark:bg-kunyit-600/20 dark:text-kunyit-300',
  },
];
