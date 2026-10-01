// Preferensi tema: 'light' (default) | 'dark' | 'system'.
// Disimpan di localStorage; penerapan dilakukan lewat kelas .dark di <html>.
// Pengguna memilih temanya sendiri; default selalu terang.

export type ThemePref = 'light' | 'dark' | 'system';

const KEY = 'laris_manis_theme';

export function getThemePref(): ThemePref {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  } catch {
    // localStorage tidak tersedia
  }
  return 'light';
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isDarkNow(): boolean {
  const pref = getThemePref();
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return systemPrefersDark();
}

export function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark);
  document
    .getElementById('lm-theme-color')
    ?.setAttribute('content', dark ? '#141310' : '#ffffff');
}

export function setThemePref(pref: ThemePref): void {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    // tetap terapkan tema walau tidak bisa menyimpan
  }
  applyTheme(isDarkNow());
}
