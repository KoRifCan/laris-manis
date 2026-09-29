import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
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
  verification: {
    google: 'google-site-verification-code-here',
  },
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}