// Preferensi tema: 'light' | 'dark' | 'system' (default).
// Disimpan di localStorage; penerapan dilakukan lewat kelas .dark di <html>.

export type ThemePref = 'light' | 'dark' | 'system';

const KEY = 'laris_manis_theme';

export function getThemePref(): ThemePref {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage tidak tersedia
  }
  return 'system';
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isDarkNow(): boolean {
  const pref = getThemePref();
  return pref === 'dark' || (pref === 'system' && systemPrefersDark());
}

export function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  document
    .getElementById('lm-theme-color')
    ?.setAttribute('content', dark ? '#141310' : '#ffffff');
}

export function setThemePref(pref: ThemePref): void {
  try {
    if (pref === 'system') {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, pref);
    }
  } catch {
    // tetap terapkan tema walau tidak bisa menyimpan
  }
  applyTheme(isDarkNow());
}
