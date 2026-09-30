'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const FALLBACK = '/products/ph-umum.png';

/**
 * Gambar produk dengan fallback: URL rusak/gagal dimuat otomatis diganti
 * placeholder lokal, sehingga tidak pernah ada ikon gambar pecah.
 */
export function ProductImage({
  src,
  alt,
  className,
  fallback = FALLBACK,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const [current, setCurrent] = useState(src || fallback);

  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      className={cn(className)}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
