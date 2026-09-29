'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatRupiah } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  categoryName?: string;
}

type CollageState =
  | { status: 'loading' }
  | { status: 'fallback' }
  | { status: 'ready'; items: Product[] };

const TILTS = ['-3deg', '2.5deg', '-1.5deg'];
const DELAYS = ['0ms', '80ms', '160ms'];

function FallbackEtalase() {
  return (
    <div className="rounded-3xl border border-dashed border-white/30 bg-white/5 p-6 sm:p-8">
      <svg viewBox="0 0 260 150" className="w-full" role="img" aria-label="Ilustrasi etalase">
        <rect x="20" y="40" width="220" height="95" rx="8" fill="#161210" stroke="#E4A82E" strokeWidth="2" />
        <path d="M14 40h232l-12-22H26z" fill="#E4A82E" />
        <path d="M40 18h26l-6 22H34zM92 18h26l-4 22H86zM144 18h26l-2 22h-28zM196 18h26l2 22h-30z" fill="#9E1B32" />
        <rect x="36" y="98" width="188" height="6" rx="3" fill="#4E4740" />
        <rect x="50" y="72" width="34" height="26" rx="4" fill="#FBF8F3" opacity="0.85" />
        <rect x="110" y="66" width="40" height="32" rx="4" fill="#FBF8F3" opacity="0.65" />
        <rect x="172" y="76" width="30" height="22" rx="4" fill="#FBF8F3" opacity="0.5" />
        <path d="M60 72l6-10 6 10M124 66l6-12 6 12" stroke="#9E1B32" strokeWidth="2" fill="none" />
      </svg>
      <p className="mt-4 text-center text-sm text-white/70">
        Etalase sedang dilengkapi dagangan baru.
      </p>
      <div className="mt-3 flex justify-center">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-gray-100"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          Lihat katalog
        </Link>
      </div>
    </div>
  );
}

function ProductPlate({ product, index }: { product: Product; index: number }) {
  const [imageBroken, setImageBroken] = useState(false);
  const image = product.images?.[0];

  return (
    <article
      className="shelf-settle w-[70%] shrink-0 snap-start sm:w-[46%] lg:w-auto lg:flex-1"
      style={{ ['--tilt' as string]: TILTS[index], animationDelay: DELAYS[index] }}
    >
      <Link
        href={`/produk/${product.id}`}
        className="block rounded-2xl bg-white p-3 shadow-2xl transition-shadow hover:shadow-2xl dark:bg-gray-900"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <ShoppingBagIcon className="h-8 w-8" />
          </div>
          {image && !imageBroken && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageBroken(true)}
              className="relative h-full w-full object-cover"
            />
          )}
          <span className="absolute bottom-2 left-2 rounded-md bg-kunyit-400 px-2 py-1 text-xs font-bold text-gray-900 shadow-md">
            {formatRupiah(product.price)}
          </span>
        </div>
        <p className="mt-3 line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-100">
          {product.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
          {product.categoryName}
        </p>
      </Link>
    </article>
  );
}

export function EtalaseCollage() {
  const [state, setState] = useState<CollageState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products?limit=3&sortBy=terbaru')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const items: Product[] = data?.success ? data.data.items : [];
        setState(items.length >= 2 ? { status: 'ready', items } : { status: 'fallback' });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'fallback' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const skeleton = (
    <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:overflow-visible lg:pb-0">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-[70%] shrink-0 animate-pulse rounded-2xl bg-white/15 p-3 sm:w-[46%] lg:w-auto lg:flex-1"
        >
          <div className="aspect-[4/3] rounded-xl bg-white/20" />
          <div className="mt-3 h-3 w-3/4 rounded bg-white/20" />
          <div className="mt-2 h-3 w-1/2 rounded bg-white/15" />
        </div>
      ))}
    </div>
  );

  const content =
    state.status === 'loading' ? (
      skeleton
    ) : state.status === 'fallback' ? (
      <FallbackEtalase />
    ) : (
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:overflow-visible lg:pb-0">
        {state.items.map((product, i) => (
          <ProductPlate key={product.id} product={product} index={i} />
        ))}
      </div>
    );

  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-xl lg:max-w-none">
      <div className="pointer-events-none absolute -inset-6 hidden rounded-[2rem] border border-white/10 lg:block" />
      {content}
      <p className="mt-4 text-center text-xs text-white/60 lg:text-left">
        Dagangan terbaru dari katalog — nyata, bukan angka dekoratif.
      </p>
    </div>
  );
}
