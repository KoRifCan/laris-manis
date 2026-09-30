'use client';

import { useState } from 'react';
import { ProductImage } from '@/components/ProductImage';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [''];
  const current = list[active] ?? list[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <ProductImage
          src={current}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {list.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Lihat foto ${index + 1}`}
              aria-current={active === index}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors',
                active === index
                  ? 'border-brand-500'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <ProductImage
                src={image}
                alt={`${name} - ${index + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
