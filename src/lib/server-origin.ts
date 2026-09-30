import { headers } from 'next/headers';

/**
 * Origin absolut untuk fetch internal (API route) dari server component.
 * Next 16 tidak lagi me-resolve fetch relatif, jadi origin dibangun dari
 * header request (aman di belakang proxy Vercel) dengan fallback aman.
 */
export async function serverOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  } catch {
    // di luar request context
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}
