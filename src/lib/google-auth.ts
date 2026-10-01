'use client';

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  linkWithCredential,
  linkWithPopup,
  GoogleAuthProvider,
  type OAuthCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export interface GoogleSignInResult {
  status: 'success' | 'needs-password' | 'cancelled' | 'error';
  idToken?: string;
  /** Email dari akun Google ketika akun dengan email sama sudah terdaftar. */
  email?: string;
  /** Kredensial Google dari popup — dipakai utk menautkan ke akun password yang sama. */
  credential?: OAuthCredential | null;
  message?: string;
}

export interface GoogleLinkResult {
  status: 'linked' | 'cancelled' | 'error';
  message?: string;
  googleIdToken?: string;
}

function mapGoogleError(code?: string): string {
  switch (code) {
    case 'auth/popup-blocked':
      return 'Popup diblokir peramban. Izinkan popup lalu coba lagi.';
    case 'auth/unauthorized-domain':
      return 'Domain ini belum diizinkan Firebase utk masuk Google. Tambahkan domain di Firebase Console → Authentication → Settings.';
    case 'auth/network-request-failed':
      return 'Gagal menghubungi layanan Google. Periksa koneksi Anda lalu coba lagi.';
    case 'auth/operation-not-allowed':
      return 'Masuk dengan Google belum diaktifkan. Aktifkan provider Google di Firebase Console → Authentication.';
    case 'auth/credential-already-in-use':
      return 'Akun Google ini sudah terkait dengan akun lain.';
    default:
      return 'Gagal masuk dengan Google. Silakan coba lagi.';
  }
}

/**
 * Masuk/daftar via popup Google.
 * - Email baru → user Google dibuat Firebase, backend akan mendaftarkannya.
 * - Email sudah terdaftar (akun password) → status 'needs-password':
 *   kredensial dikembalikan agar UI meminta password utk menautkan
 *   (email sama = akun yang sama, bukan dua akun terpisah).
 */
export async function startGoogleSignIn(): Promise<GoogleSignInResult> {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken();
    return { status: 'success', idToken };
  } catch (err) {
    const e = err as {
      code?: string;
      customData?: { email?: string; credential?: OAuthCredential };
    };
    if (e.code === 'auth/account-exists-with-different-credential') {
      return {
        status: 'needs-password',
        email: e.customData?.email || '',
        credential: e.customData?.credential ?? null,
      };
    }
    if (
      e.code === 'auth/popup-closed-by-user' ||
      e.code === 'auth/cancelled-popup-request'
    ) {
      return { status: 'cancelled' };
    }
    return { status: 'error', message: mapGoogleError(e.code) };
  }
}

/**
 * Lanjutan utk status 'needs-password': masuk dgn email+password lalu
 * menautkan kredensial Google ke akun yang sama (satu uid, dua provider).
 */
export async function completeGoogleLinkWithPassword(
  email: string,
  password: string,
  credential: OAuthCredential | null
): Promise<GoogleSignInResult> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (credential) {
      await linkWithCredential(cred.user, credential);
    }
    const idToken = await cred.user.getIdToken(true);
    return { status: 'success', idToken };
  } catch (err) {
    const e = err as { code?: string };
    if (
      e.code === 'auth/wrong-password' ||
      e.code === 'auth/invalid-credential' ||
      e.code === 'auth/invalid-login-credentials' ||
      e.code === 'auth/user-not-found'
    ) {
      return { status: 'error', message: 'Email atau password salah.' };
    }
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      return { status: 'cancelled' };
    }
    if (e.code === 'auth/credential-already-in-use') {
      return { status: 'error', message: 'Akun Google ini sudah terkait dengan akun lain.' };
    }
    return { status: 'error', message: mapGoogleError(e.code) };
  }
}

/**
 * Tautkan Google ke akun yang sedang login (sesi email/password).
 * Server mengirim custom token uid yang sama agar Firebase client
 * memiliki currentUser, lalu linkWithPopup menambahkan provider Google
 * ke akun yang SAMA (bukan membuat akun baru).
 */
export async function linkGoogleToCurrentAccount(
  customToken: string
): Promise<GoogleLinkResult> {
  try {
    const cred = await signInWithCustomToken(auth, customToken);
    try {
      await linkWithPopup(cred.user, new GoogleAuthProvider());
    } catch (err) {
      const e = err as { code?: string };
      if (e.code === 'auth/provider-already-linked') {
        const idToken = await cred.user.getIdToken(true);
        return { status: 'linked', googleIdToken: idToken };
      }
      if (
        e.code === 'auth/popup-closed-by-user' ||
        e.code === 'auth/cancelled-popup-request'
      ) {
        return { status: 'cancelled' };
      }
      return { status: 'error', message: mapGoogleError(e.code) };
    }
    const idToken = await cred.user.getIdToken(true);
    return { status: 'linked', googleIdToken: idToken };
  } catch (err) {
    const e = err as { code?: string };
    return { status: 'error', message: mapGoogleError(e.code) };
  }
}
