'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { authFetch, readJson, ApiError, errorMessage } from '@/lib/client-auth';

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (comment.trim().length < 3) {
      setNotice({ kind: 'err', text: 'Tuliskan ulasan minimal 3 karakter.' });
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        setNotice({ kind: 'err', text: data?.error || 'Gagal mengirim ulasan' });
        return;
      }
      setNotice({ kind: 'ok', text: 'Ulasan berhasil dikirim. Terima kasih!' });
      setComment('');
      setRating(5);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/produk/${productId}#reviews`)}`);
        return;
      }
      setNotice({ kind: 'err', text: errorMessage(err) || 'Gagal mengirim ulasan' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tulis Ulasan</h3>

      <div className="flex items-center gap-1 mb-3" role="radiogroup" aria-label="Rating bintang">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Beri rating ${n} bintang`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <StarIcon
              className={`h-6 w-6 transition-colors ${
                n <= (hoverRating || rating) ? 'fill-current text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Bagaimana produk ini? Tulis pengalaman Anda..."
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
      />

      {notice && (
        <div
          role="alert"
          className={`mt-3 p-3 rounded-lg text-sm border ${
            notice.kind === 'ok'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notice.text}
        </div>
      )}

      <Button type="submit" size="sm" loading={busy} className="mt-3">
        Kirim Ulasan
      </Button>
    </form>
  );
}
