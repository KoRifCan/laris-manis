'use client';

import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    secondary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    aktif: { label: 'Aktif', variant: 'success' },
    nonaktif: { label: 'Nonaktif', variant: 'secondary' },
    draft: { label: 'Draft', variant: 'default' },
    menunggu_review: { label: 'Menunggu Review', variant: 'warning' },
    ditolak: { label: 'Ditolak', variant: 'danger' },
    pending: { label: 'Pending', variant: 'warning' },
    approved: { label: 'Disetujui', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'danger' },
    verified: { label: 'Terverifikasi', variant: 'success' },
    unverified: { label: 'Belum Verifikasi', variant: 'warning' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}