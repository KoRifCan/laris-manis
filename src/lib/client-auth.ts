// Helper autentikasi di sisi klien: menyimpan ID token Firebase dan
// memberi klasifikasi error yang jelas (offline / sesi / server)
// agar kegagalan tidak lagi selalu tampil "Terjadi kesalahan jaringan".

export type ApiErrorKind = 'offline' | 'session' | 'server' | 'client';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

const TOKEN_KEY = 'laris_manis_id_token';

const MESSAGES: Record<ApiErrorKind, string> = {
  offline: 'Tidak ada koneksi internet. Periksa jaringan Anda lalu coba lagi.',
  session: 'Sesi berakhir atau Anda belum login. Silakan masuk kembali.',
  server: 'Server sedang mengalami gangguan. Silakan coba lagi beberapa saat lagi.',
  client: 'Permintaan tidak dapat diproses. Silakan coba lagi.',
};

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage penuh/private mode: token tidak bertahan antar reload
  }
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // abaikan
  }
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

// fetch yang otomatis menyertakan Authorization: Bearer <token>
// dan melempar ApiError terklasifikasi (offline / sesi habis / server error).
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (isOffline()) {
    throw new ApiError('offline', MESSAGES.offline);
  }

  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError('offline', MESSAGES.offline);
  }

  if (res.status === 401) {
    clearToken();
    throw new ApiError('session', MESSAGES.session, 401);
  }
  if (res.status >= 500) {
    throw new ApiError('server', MESSAGES.server, res.status);
  }

  return res;
}

export interface ApiEnvelope<T = Record<string, unknown>> {
  success?: boolean;
  error?: string;
  details?: unknown;
  data?: T;
}

// Parse JSON dengan aman: respons non-JSON (HTML error page, body kosong)
// menghasilkan null, bukan exception yang bikin pesan "jaringan" palsu.
export async function readJson<T = Record<string, unknown>>(
  res: Response
): Promise<ApiEnvelope<T> | null> {
  try {
    return (await res.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.kind === 'client' ? err.message : MESSAGES[err.kind];
  }
  if (isOffline()) {
    return MESSAGES.offline;
  }
  return 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
}

// --- Sesi tampilan (untuk Header & redirect halaman login) ---

export const AUTH_EVENT = 'lm-auth-changed';

export interface UserSession {
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
}

const USER_KEY = 'laris_manis_user';

function notifyAuthChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

// Baca `exp` dari payload JWT (hanya untuk deteksi kedaluwarsa di UI;
// verifikasi kriptografis tetap dilakukan server).
function readExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const data = JSON.parse(atob(padded));
    return typeof data.exp === 'number' ? data.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenValid(token: string | null): token is string {
  if (!token) return false;
  const exp = readExpiry(token);
  return exp === null || exp > Date.now();
}

export function setSession(idToken: string, user: UserSession): void {
  setToken(idToken);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // abaikan storage penuh/private mode
    }
  }
  notifyAuthChanged();
}

export function clearSession(): void {
  clearToken();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // abaikan
    }
  }
  notifyAuthChanged();
}

// Snapshot murni tanpa efek samping: hasilnya di-cache per token agar
// aman dipakai sebagai getSnapshot() useSyncExternalStore (Object.is stabil).
let snapshotCache: { token: string | null; user: UserSession | null } = {
  token: null,
  user: null,
};

export function getSessionSnapshot(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const token = getToken();
  if (token === snapshotCache.token) return snapshotCache.user;

  let user: UserSession | null = null;
  if (isTokenValid(token)) {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      user = raw ? (JSON.parse(raw) as UserSession) : {};
    } catch {
      user = {};
    }
  }
  snapshotCache = { token, user };
  return user;
}

// null = belum login / token kedaluwarsa (token kedaluwarsa dibersihkan).
export function getSession(): UserSession | null {
  const user = getSessionSnapshot();
  if (user === null && getToken()) {
    clearSession();
  }
  return user;
}

export function subscribeSession(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(AUTH_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
