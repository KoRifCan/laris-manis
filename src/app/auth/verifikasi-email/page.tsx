'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');
    const apiKey = params.get('apiKey');
    const continueUrl = params.get('continueUrl');

    if (mode === 'verifyEmail' && oobCode && apiKey) {
      verifyEmail(oobCode, apiKey, continueUrl);
    } else if (mode === 'resetPassword' && oobCode && apiKey) {
      setStatus('success');
      setMessage('Link reset password valid. Anda dapat mengatur password baru.');
    } else {
      setStatus('error');
      setMessage('Link verifikasi tidak valid atau sudah kadaluarsa.');
    }
  }, []);

  const verifyEmail = async (oobCode: string, apiKey: string, continueUrl: string | null) => {
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oobCode,
        }),
      });

      const data = await res.json();

      if (data.idToken) {
        setStatus('success');
        setMessage('Email berhasil diverifikasi!');
      } else {
        setStatus('error');
        setMessage(data.error?.message || 'Verifikasi gagal. Link mungkin sudah kadaluarsa.');
      }
    } catch {
      setStatus('error');
      setMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full flex items-center justify-center"
              className={status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : status === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-indigo-100 dark:bg-indigo-900/30'}
            >
              {status === 'loading' && (
                <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {status === 'success' && <CheckCircleIcon className="h-8 w-8 text-green-600" />}
              {status === 'error' && <ExclamationCircleIcon className="h-8 w-8 text-red-600" />}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {status === 'loading' ? 'Memverifikasi...' : status === 'success' ? 'Verifikasi Berhasil' : 'Verifikasi Gagal'}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>

            <div className="space-y-3">
              {status === 'success' && (
                <Link href="/auth/login">
                  <Button className="w-full" size="lg">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Masuk Sekarang
                  </Button>
                </Link>
              )}

              {status === 'error' && (
                <Link href="/auth/daftar">
                  <Button variant="outline" className="w-full" size="lg">
                    Daftar Ulang
                  </Button>
                </Link>
              )}

              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}