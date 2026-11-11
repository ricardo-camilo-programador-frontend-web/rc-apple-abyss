'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useSyncExternalStore } from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import { useAdGuard } from '@/hooks/use-ad-guard';

const DISMISS_KEY = 'apple_abyss_ad_banner_dismissed_until';
const DISMISS_DURATION_MS = 60 * 60 * 1000; // 1 hour
const DISMISS_EVENT = 'apple-abyss:ad-banner-dismissed';

// Fallback em memória quando o localStorage está bloqueado (modo privacidade)
const dismissedFallbackUntil = { value: 0 };

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  if (Date.now() < dismissedFallbackUntil.value) return true;
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    if (!until) return false;
    return Date.now() < parseInt(until, 10);
  } catch {
    return false;
  }
}

function subscribeDismissal(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(DISMISS_EVENT, onChange);
  // Re-checa quando o prazo de 1h expira
  const id = setInterval(onChange, 60_000);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(DISMISS_EVENT, onChange);
    clearInterval(id);
  };
}

export default function AdBanner() {
  const { adsVisible, adsRemoved } = useAdGuard();
  // SSR renderiza como não-dismissed; snapshot do client aplica após hidratação
  const dismissed = useSyncExternalStore(subscribeDismissal, isDismissed, () => false);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    } catch {
      dismissedFallbackUntil.value = Date.now() + DISMISS_DURATION_MS;
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }, []);

  if (!adsVisible || adsRemoved) return null;

  const visible = !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="ad-banner"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-24 lg:bottom-4 right-4 z-50 w-[300px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line)',
            color: 'var(--ink)',
            boxShadow: 'var(--shadow)',
          }}
        >
          {/* Header row: label + close */}
          <div className="flex items-center justify-between px-3 py-1">
            <span className="abyss-kicker select-none">Advertisement</span>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss ad banner"
              className="abyss-close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Ad unit */}
          <div className="h-[100px]">
            <AdSenseAd slot="horizontal-footer" format="auto" className="w-full h-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
