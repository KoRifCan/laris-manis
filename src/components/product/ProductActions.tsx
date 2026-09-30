'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { authFetch, readJson, ApiError, getSession } from '@/lib/client-auth';

export function ProductActions({
  productId,
  productName,
  productDescription,
}: {
  productId: string;
  productName: string;
  productDescription?: string;
}) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareLabel, setShareLabel] = useState('Bagikan produk');

  useEffect(() => {
    if (!getSession()) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`/api/favorites?productId=${encodeURIComponent(productId)}`);
        const data = await readJson<{ isFavorite: boolean }>(res);
        if (!cancelled && res.ok && data?.success && data.data) {
          setIsFavorite(Boolean(data.data.isFavorite));
        }
      } catch {
        /* status favorit bersifat opsional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const toggleFavorite = async () => {
    if (!getSession()) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/produk/${productId}`)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await authFetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await readJson<{ isFavorite: boolean }>(res);
      if (res.ok && data?.success && data.data) {
        setIsFavorite(data.data.isFavorite);
      }
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/produk/${productId}`)}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, text: productDescription, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareLabel('Tautan disalin!');
      setTimeout(() => setShareLabel('Bagikan produk'), 2000);
    } catch {
      /* pengguna membatalkan share */
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="p-3"
        aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        aria-pressed={isFavorite}
        onClick={toggleFavorite}
        disabled={busy}
      >
        {isFavorite ? (
          <HeartSolidIcon className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant="outline"
        className="p-3"
        aria-label={shareLabel}
        onClick={share}
      >
        <ShareIcon className="h-5 w-5" />
      </Button>
      <span className="text-xs text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
        {shareLabel !== 'Bagikan produk' ? shareLabel : ''}
      </span>
    </div>
  );
}
