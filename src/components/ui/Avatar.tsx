'use client';

import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

export function Avatar({ className, src, alt, name, size = 'md', shape = 'circle', ...props }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 overflow-hidden',
        sizes[size],
        shapes[shape],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}