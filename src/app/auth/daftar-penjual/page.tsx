'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ShieldCheckIcon, StorefrontIcon, ArrowRightOnRectangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function DaftarPenjualPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    storeCity: '',
    storeProvince: '',
    storePhone: '',
    storeWhatsapp: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/apply-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Pengajuan gagal');
        if (data.details) {
          setError(data.details.join(', '));
        }
        return;
      }

      setStep('success');
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <Card className="p-8 text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pengajuan Dikirim!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Pengajuan menjadi penjual Anda telah dikirim. Tim kami akan meninjau dalam 1-2 hari kerja.
                Anda akan menerima notifikasi email setelah diverifikasi.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full" size="lg">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Kembali ke Beranda
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full" size="lg">
                    Masuk ke Akun
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Info Card */}
          <Card className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Jadi Penjual di Laris Manis</h2>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2"><StorefrontIcon className="h-5 w-5 text-indigo-600" /> Kelola toko online sendiri gratis</li>
                  <li className="flex items-center gap-2"><StorefrontIcon className="h-5 w-5 text-indigo-600" /> Upload produk tanpa batas (max 5 foto/produk)</li>
                  <li className="flex items-center gap-2"><StorefrontIcon className="h-5 w-5 text-indigo-600" /> Chat langsung dengan pembeli via WhatsApp</li>
                  <li className="flex items-center gap-2"><StorefrontIcon className="h-5 w-5 text-indigo-600" /> Statistik penjualan & pelacakan stok</li>
                  <li className="flex items-center gap-2"><StorefrontIcon className="h-5 w-5 text-indigo-600" /> Verifikasi admin untuk kepercayaan pembeli</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Form Card */}
          <Card className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Isi Data Toko Anda</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Data ini akan ditinjau tim kami sebelum toko diaktifkan</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Nama Toko *"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="Contoh: Toko Batik Andalan"
                  required
                  maxLength={100}
                />

                <Input
                  label="Nomor Telepon Toko *"
                  name="storePhone"
                  type="tel"
                  value={formData.storePhone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  required
                  maxLength={20}
                />
              </div>

              <Input
                label="Nomor WhatsApp *"
                name="storeWhatsapp"
                type="tel"
                value={formData.storeWhatsapp}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx (untuk tombol chat pembeli)"
                required
                maxLength={20}
                helperText="Nomor ini akan ditampilkan di halaman produk untuk chat langsung"
              />

              <Input
                label="Alamat Lengkap *"
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                placeholder="Jl. Raya No. 123, RT/RW"
                required
                maxLength={200}
              />

              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Kota *"
                  name="storeCity"
                  value={formData.storeCity}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta"
                  required
                  maxLength={50}
                />

                <Input
                  label="Provinsi *"
                  name="storeProvince"
                  value={formData.storeProvince}
                  onChange={handleChange}
                  placeholder="Contoh: DKI Jakarta"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Toko *</label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ceritakan tentang toko Anda, produk unggulan, visi misi, dll (min 10 karakter, max 1000)"
                  required
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Kirim Pengajuan
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Dengan mengirim pengajuan, Anda menyetujui{' '}
              <Link href="/kebijakan/penjual" className="text-indigo-600 hover:text-indigo-700">Kebijakan Penjual</Link>{' '}
              dan{' '}
              <Link href="/syarat" className="text-indigo-600 hover:text-indigo-700">Syarat & Ketentuan</Link>
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}