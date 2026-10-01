// Nomor lokal Indonesia → E.164 untuk Firebase Auth; null bila format tak dikenal
export function toE164(phone: string): string | null {
  const p = phone.replace(/[\s\-()]/g, '');
  if (/^\+\d{8,15}$/.test(p)) return p;
  if (/^0\d{8,12}$/.test(p)) return '+62' + p.slice(1);
  if (/^62\d{8,12}$/.test(p)) return '+' + p;
  if (/^8\d{8,11}$/.test(p)) return '+62' + p;
  return null;
}
