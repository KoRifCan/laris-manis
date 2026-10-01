'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { authFetch, readJson, ApiError, errorMessage } from '@/lib/client-auth';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  storeId?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  productCount: number;
}

export default function SuperAdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
          </main>
          <Footer />
        </div>
      }
    >
      <SuperAdminDashboardContent />
    </Suspense>
  );
}

function SuperAdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createNotice, setCreateNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [createForm, setCreateForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'admin',
    storeId: '',
  });
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  // Tab aktif dibaca dari URL sehingga tautan ?tab=... selalu konsisten
  const tabParam = searchParams.get('tab');
  const activeTab: 'users' | 'categories' | 'settings' =
    tabParam === 'categories' || tabParam === 'settings' ? tabParam : 'users';

  const switchTab = (tab: 'users' | 'categories' | 'settings') => {
    router.replace(
      tab === 'users' ? '/dashboard/super-admin' : `/dashboard/super-admin?tab=${tab}`
    );
  };

  const fetchData = async () => {
    const [usersRes, categoriesRes] = await Promise.all([
      authFetch('/api/admin/users?limit=100'),
      authFetch('/api/categories'),
    ]);
    const usersData = await readJson<{ items: User[] }>(usersRes);
    const categoriesData = await readJson<Category[]>(categoriesRes);
    return { usersData, categoriesData };
  };

  useEffect(() => {
    let active = true;
    fetchData()
      .then(({ usersData, categoriesData }) => {
        if (!active) return;
        if (usersData?.success) {
          setUsers(usersData.data?.items ?? []);
        }
        if (categoriesData?.success) {
          setCategories(categoriesData.data ?? []);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.kind === 'session') {
          router.push('/auth/login?callbackUrl=/dashboard/super-admin');
          return;
        }
        console.error('Failed to fetch super admin data:', errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users.filter(u => {
    const email = (u.email || '').toLowerCase();
    const name = (u.displayName || '').toLowerCase();
    const matchesSearch = email.includes(searchQuery.toLowerCase()) ||
      name.includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleChangeRole = async (uid: string, newRole: string) => {
    if (!confirm(`Yakin ingin mengubah role menjadi ${newRole}?`)) return;

    try {
      const res = await authFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role: newRole }),
      });
      
      if (res.ok) {
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengubah role');
      }
    } catch {
      console.error('Failed to change role');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Yakin ingin menghapus user ini? Tindakan ini tidak bisa dibatalkan.')) return;

    try {
      const res = await authFetch(`/api/admin/users/${encodeURIComponent(uid)}`, {
        method: 'DELETE',
      });
      const data = await readJson<{ success: boolean; error?: string }>(res);
      if (res.ok && data?.success) {
        setUsers(prev => prev.filter(u => u.uid !== uid));
      } else {
        alert(data?.error || 'Gagal menghapus user');
      }
    } catch (err) {
      alert(errorMessage(err) || 'Gagal menghapus user');
    }
  };

  const ensureStoresLoaded = async () => {
    if (stores.length > 0) return;
    try {
      const res = await authFetch('/api/stores?limit=100');
      const data = await readJson<{ items: { id: string; name: string }[] }>(res);
      setStores(data?.data?.items ?? []);
    } catch {
      setStores([]);
    }
  };

  const handleCreateUser = async () => {
    setCreating(true);
    setCreateNotice(null);
    try {
      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: createForm.displayName.trim(),
          email: createForm.email.trim(),
          password: createForm.password,
          role: createForm.role,
          ...(createForm.role === 'staf_toko' && createForm.storeId
            ? { storeId: createForm.storeId }
            : {}),
        }),
      });
      const data = await readJson(res);
      if (!res.ok || !data?.success) {
        const detailText = Array.isArray(data?.details)
          ? data.details.filter((d): d is string => typeof d === 'string').join(', ')
          : '';
        setCreateNotice({
          kind: 'err',
          text: detailText || data?.error || 'Gagal membuat akun',
        });
        return;
      }
      setCreateNotice({ kind: 'ok', text: `Akun ${createForm.email} berhasil dibuat` });
      setCreateForm({ displayName: '', email: '', password: '', role: 'admin', storeId: '' });
      setShowCreateForm(false);
      const fresh = await authFetch('/api/admin/users?limit=100');
      const freshData = await readJson<{ items: User[] }>(fresh);
      if (freshData?.success) setUsers(freshData.data?.items ?? []);
    } catch (err) {
      setCreateNotice({ kind: 'err', text: errorMessage(err) || 'Gagal membuat akun' });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Super Admin</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola pengguna, kategori, dan pengaturan sistem
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex gap-8" aria-label="Super admin tabs">
              <button
                onClick={() => switchTab('users')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'users' 
                    ? 'text-brand-600 dark:text-brand-400 border-brand-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Kelola Pengguna ({users.length})
              </button>
              <button
                onClick={() => switchTab('categories')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'categories' 
                    ? 'text-brand-600 dark:text-brand-400 border-brand-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Kategori ({categories.length})
              </button>
              <button
                onClick={() => switchTab('settings')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings' 
                    ? 'text-brand-600 dark:text-brand-400 border-brand-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Pengaturan
              </button>
            </nav>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daftar Pengguna</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari email atau nama..."
                        className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Semua Role</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="penjual">Penjual</option>
                      <option value="staf_toko">Staf Toko</option>
                      <option value="pembeli">Pembeli</option>
                    </select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm((v) => !v);
                        setCreateNotice(null);
                        if (!showCreateForm) void ensureStoresLoaded();
                      }}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Tambah Pengguna
                    </Button>
                  </div>
                </div>

                {createNotice && (
                  <div
                    role="alert"
                    className={`mt-4 p-3 rounded-lg text-sm border ${
                      createNotice.kind === 'ok'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {createNotice.text}
                  </div>
                )}

                {showCreateForm && (
                  <form
                    className="mt-4 grid gap-3 sm:grid-cols-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleCreateUser();
                    }}
                  >
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Nama Lengkap
                      <input
                        required
                        value={createForm.displayName}
                        onChange={(e) => setCreateForm((f) => ({ ...f, displayName: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Nama pengguna"
                      />
                    </label>
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Email
                      <input
                        required
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="nama@email.com"
                      />
                    </label>
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Password
                      <input
                        required
                        type="password"
                        minLength={8}
                        value={createForm.password}
                        onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Minimal 8 karakter"
                      />
                    </label>
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Role
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="admin">Admin / Moderator</option>
                        <option value="staf_toko">Staf Toko</option>
                        <option value="penjual">Penjual</option>
                        <option value="pembeli">Pembeli</option>
                      </select>
                    </label>
                    {createForm.role === 'staf_toko' && (
                      <label className="text-sm text-gray-700 dark:text-gray-300 sm:col-span-2">
                        Toko yang ditugaskan
                        <select
                          required
                          value={createForm.storeId}
                          onChange={(e) => setCreateForm((f) => ({ ...f, storeId: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">— Pilih toko —</option>
                          {stores.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <div className="sm:col-span-2 flex gap-3">
                      <Button type="submit" size="sm" loading={creating}>
                        Buat Akun
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setShowCreateForm(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengguna</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Toko</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dibuat</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada pengguna ditemukan
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                                <span className="text-brand-600 dark:text-brand-400 font-medium">
                                  {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{user.displayName || '-'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              user.role === 'super_admin' ? 'danger' :
                              user.role === 'admin' ? 'warning' :
                              user.role === 'penjual' ? 'success' :
                              user.role === 'staf_toko' ? 'info' : 'default'
                            }>
                              {(user.role || 'pembeli').replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {user.emailVerified ? (
                              <Badge variant="success" className="flex items-center gap-1">
                                <ShieldCheckIcon className="h-3 w-3" />
                                Terverifikasi
                              </Badge>
                            ) : (
                              <Badge variant="warning" className="flex items-center gap-1">
                                <ExclamationTriangleIcon className="h-3 w-3" />
                                Belum Verifikasi
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.storeId ? (
                              <span className="text-gray-900 dark:text-white">Toko ID: {user.storeId.slice(0, 8)}...</span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Belum punya toko</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user.uid, e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                              >
                                <option value="pembeli">Pembeli</option>
                                <option value="penjual">Penjual</option>
                                <option value="staf_toko">Staf Toko</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                              <Button
                                onClick={() => handleDeleteUser(user.uid)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kelola Kategori</h2>
                <Link
                  href="/dashboard/super-admin/kategori/baru"
                  className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Tambah Kategori
                </Link>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.name}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cat.slug}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{cat.productCount}</td>
                          <td className="px-6 py-4">
                            <Badge variant={cat.isActive ? 'success' : 'secondary'}>
                              {cat.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/dashboard/super-admin/kategori/${cat.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pengaturan Sistem</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Rate Limiting</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Konfigurasi rate limit untuk API sensitif (login, upload, dll)</p>
                    <Button variant="outline" className="mt-2" size="sm" disabled title="Fitur ini sedang dalam pengembangan">
                      Segera Hadir
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Email Templates</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Kustomisasi template email verifikasi, reset password, notifikasi</p>
                    <Button variant="outline" className="mt-2" size="sm" disabled title="Fitur ini sedang dalam pengembangan">
                      Segera Hadir
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Audit Logs</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Lihat log aktivitas admin dan sistem</p>
                    <Link
                      href="/dashboard/super-admin/logs"
                      className="inline-flex items-center mt-2 px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-2 focus:ring-brand-500 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/20"
                    >
                      Lihat Logs
                    </Link>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Backup Data</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Unduh salinan semua data (users, toko, produk, kategori, ulasan, log) dalam format JSON
                    </p>
                    <a
                      href="/api/admin/backup"
                      download
                      className="inline-flex items-center mt-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Backup Sekarang (JSON)
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Catatan Operasional
                </h2>
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  Selalu lakukan backup sebelum perubahan data besar. Fitur penghapusan massal
                  (reset database) sengaja tidak tersedia dari dashboard; hubungi tim infrastruktur
                  untuk penanganan manual.
                </p>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}