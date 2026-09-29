'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after user has visited for a bit
      setTimeout(() => setShowPrompt(true), 30000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (isInstalled || !showPrompt || typeof window === 'undefined') return null;

  return (
    <div className={cn(
      'fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up',
      showPrompt ? 'block' : 'hidden'
    )} role="dialog" aria-label="Pasang aplikasi Laris Manis">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
            <ArrowDownTrayIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white">Pasang Aplikasi Laris Manis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Akses cepat ke katalog produk UMKM, favorit, dan chat penjual langsung dari layar utama.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            aria-label="Tutup"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Pasang Sekarang
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}