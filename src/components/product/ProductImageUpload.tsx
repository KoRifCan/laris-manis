'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { authFetch, readJson, ApiError, errorMessage } from '@/lib/client-auth';

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

interface ProductImageUploadProps {
  onUploaded: (url: string) => void;
  disabled?: boolean;
}

export function ProductImageUpload({ onUploaded, disabled }: ProductImageUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!ALLOWED.includes(file.type)) {
      setError('Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Ukuran file maksimal 2MB');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await authFetch('/api/upload', { method: 'POST', body: fd });
      const data = await readJson<{ url?: string }>(res);
      const url = data?.data?.url;
      if (!res.ok || !data?.success || !url) {
        setError(data?.error || 'Gagal mengupload foto');
        return;
      }
      onUploaded(url);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/produk/baru');
        return;
      }
      setError(errorMessage(err) || 'Gagal mengupload foto');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Upload foto produk"
        disabled={disabled || busy}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-50 disabled:opacity-50 text-sm font-medium dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-950"
      >
        <PhotoIcon className="h-5 w-5" aria-hidden="true" />
        {busy ? 'Mengupload...' : 'Upload Foto dari Perangkat'}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
