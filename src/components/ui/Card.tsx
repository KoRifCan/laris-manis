'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 shadow-sm',
      outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-xl', variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export { Card };