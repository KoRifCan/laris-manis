import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://laris-manis-id.vercel.app'),
  title: {
    default: 'Laris Manis - Etalase Produk UMKM Indonesia',
    template: '%s | Laris Manis',
  },
  description: 'Platform etalase produk UMKM terpercaya. Temukan ribuan produk berkualitas dari pengrajin dan pengusaha kecil seluruh Indonesia. Belanja langsung dari penjual via WhatsApp.',
  keywords: ['UMKM', 'produk lokal', 'etalase', 'marketplace', 'penjual Indonesia', 'belanja online'],
  authors: [{ name: 'Laris Manis' }],
  creator: 'Laris Manis',
  publisher: 'Laris Manis',
  robots: 'index, follow',
  // verification.google dihapus — isi dengan kode asli dari Google Search
  // Console bila tersedia (placeholder tidak mempercepat verifikasi)
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://laris-manis-id.vercel.app',
    siteName: 'Laris Manis',
    title: 'Laris Manis - Etalase Produk UMKM Indonesia',
    description: 'Platform etalase produk UMKM terpercaya. Temukan ribuan produk berkualitas dari pengrajin dan pengusaha kecil seluruh Indonesia.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Laris Manis - Etalase Produk UMKM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laris Manis - Etalase Produk UMKM',
    description: 'Platform etalase produk UMKM terpercaya. Temukan ribuan produk berkualitas dari pengrajin dan pengusaha kecil seluruh Indonesia.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Terapkan tema tersimpan SEBELUM paint supaya tidak ada kedip terang->gelap.
const themeInit = `(function(){try{var s=localStorage.getItem('laris_manis_theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s!=='light'&&m);if(d)document.documentElement.classList.add('dark');var t=document.getElementById('lm-theme-color');if(t)t.setAttribute('content',d?'#141310':'#ffffff');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" id="lm-theme-color" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col bg-canvas dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}