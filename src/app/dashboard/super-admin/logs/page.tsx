'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import {
  authFetch,
  readJson,
  ApiError,
  errorMessage,
  getSession,
} from '@/lib/client-auth';

interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string | Date | { _seconds?: number; seconds?: number } | null;
}

interface LogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const LIMIT = 50;

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async (targetPage: number, action: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(targetPage), limit: String(LIMIT) });
      if (action.trim()) params.set('action', action.trim());
      const res = await authFetch(`/api/audit-logs?${params.toString()}`);
      const data = await readJson<LogsResponse>(res);
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Gagal memuat log');
        return;
      }
      const payload = data.data!;
      setLogs(payload.items ?? []);
      setTotal(payload.total ?? 0);
      setPage(payload.page ?? targetPage);
      setHasMore(Boolean(payload.hasMore));
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'session') {
        router.push('/auth/login?callbackUrl=/dashboard/super-admin/logs');
        return;
      }
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!getSession()) {
      router.push('/auth/login?callbackUrl=/dashboard/super-admin/logs');
      return;
    }
    // jalankan di microtask agar tidak memicu render berantai dari effect
    queueMicrotask(() => fetchLogs(1, ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/super-admin"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Dashboard Super Admin
          </Link>

          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Aktivitas</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Riwayat audit sistem — {total} entri
              </p>
            </div>
            <form
              className="flex w-full max-w-sm items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                fetchLogs(1, actionFilter);
              }}
            >
              <div className="flex-1">
                <Input
                  label="Filter aksi"
                  name="action"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  placeholder="mis. login, create_product"
                />
              </div>
              <Button type="submit" variant="outline" className="mb-1">
                Terapkan
              </Button>
            </form>
          </div>

          {error && (
            <div
              className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
              role="alert"
            >
              {error}
            </div>
          )}

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">Memuat log...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                Tidak ada log untuk filter ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Aksi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Aktor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Target
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">{log.action}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="font-mono text-xs" title={log.actorId}>
                            {log.actorId.slice(0, 12)}…
                          </div>
                          <Badge variant="info">{log.actorRole}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {log.targetType ? (
                            <>
                              <span className="text-xs uppercase text-gray-400">{log.targetType}</span>
                              <div className="font-mono text-xs" title={log.targetId}>
                                {log.targetId ? `${log.targetId.slice(0, 12)}…` : '—'}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <details>
                            <summary className="cursor-pointer text-brand-600 hover:underline dark:text-brand-400">
                              Lihat
                            </summary>
                            <pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap break-all rounded bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              {JSON.stringify(log.details ?? {}, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchLogs(page - 1, actionFilter)}
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => fetchLogs(page + 1, actionFilter)}
            >
              Berikutnya
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
