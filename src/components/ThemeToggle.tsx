'use client';

import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { isDarkNow, applyTheme, setThemePref } from '@/lib/theme';

// Tombol ganti tema terang/gelap. Pilihan disimpan di localStorage;
// bila belum pernah memilih, mengikuti preferensi sistem.
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDarkNow());
    const onChange = (event: MediaQueryListEvent) => {
      // hanya ikuti sistem bila pengguna belum memilih sendiri
      if (!localStorage.getItem('laris_manis_theme')) {
        setDark(event.matches);
        applyTheme(event.matches);
      }
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onChange);
    return () =>
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = !isDarkNow();
    setThemePref(next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        className ??
        'p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
      }
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={dark ? 'Mode terang' : 'Mode gelap'}
    >
      {dark ? <SunIcon className="h-5 w-5" aria-hidden="true" /> : <MoonIcon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
