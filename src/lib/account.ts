import { authFetch, readJson } from './client-auth';

// Cache singkat agar Header tidak memanggil /api/users/me di setiap navigasi.

export interface MyStore {
  id: string;
  name?: string;
  slug?: string;
  city?: string;
  isVerified?: boolean;
  reviewStatus?: string;
}

export interface MyAccount {
  uid?: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string | null;
  address?: string | null;
  role?: string;
  storeId?: string | null;
  sellerApplicationStatus?: string | null;
  sellerApplicationRejectionReason?: string | null;
  store?: MyStore | null;
}

const TTL_MS = 30_000;

let cache: { data: MyAccount | null; at: number } | null = null;

export async function getMyAccount(force = false): Promise<MyAccount | null> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) {
    return cache.data;
  }
  try {
    const res = await authFetch('/api/users/me');
    if (!res.ok) {
      return cache?.data ?? null;
    }
    const json = await readJson<{ [key: string]: unknown }>(res);
    const data = (json?.data as MyAccount | undefined) ?? null;
    cache = { data, at: Date.now() };
    return data;
  } catch {
    return cache?.data ?? null;
  }
}

export function invalidateAccount(): void {
  cache = null;
}
