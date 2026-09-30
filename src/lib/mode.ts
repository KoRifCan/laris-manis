// Mode aktif akun: 'belanja' (pembeli) atau 'toko' (kelola toko penjual).
// Satu akun bisa keduanya; mode hanya memilih tampilan/arah navigasi,
// disimpan di localStorage dan dibagikan lewat event agar Header & halaman
// lain bisa bereaksi (useSyncExternalStore).

export type ShopMode = 'belanja' | 'toko';

export const MODE_EVENT = 'lm-mode-changed';
const KEY = 'laris_manis_mode';

export function getMode(): ShopMode {
  if (typeof window === 'undefined') return 'belanja';
  try {
    return localStorage.getItem(KEY) === 'toko' ? 'toko' : 'belanja';
  } catch {
    return 'belanja';
  }
}

let snapshotCache: { raw: string | null; mode: ShopMode } = { raw: null, mode: 'belanja' };

export function getModeSnapshot(): ShopMode {
  if (typeof window === 'undefined') return 'belanja';
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw === snapshotCache.raw) return snapshotCache.mode;
  const mode: ShopMode = raw === 'toko' ? 'toko' : 'belanja';
  snapshotCache = { raw, mode };
  return mode;
}

export function setMode(mode: ShopMode): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'belanja') {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, mode);
    }
  } catch {
    // abaikan storage penuh/private mode
  }
  snapshotCache = { raw: mode === 'belanja' ? null : mode, mode };
  window.dispatchEvent(new Event(MODE_EVENT));
}

export function subscribeMode(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(MODE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(MODE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
