'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useEffect, useState } from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import { useAdGuard } from '@/hooks/use-ad-guard';

const DISMISS_KEY = 'apple_abyss_ad_banner_dismissed_until';
const DISMISS_DURATION_MS = 60 * 60 * 1000; // 1 hour

function isDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  const until = localStorage.getItem(DISMISS_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

export default function AdBanner() {
  const { adsVisible, adsRemoved } = useAdGuard();
  const [dismissed, setDismissed] = useState(() => isDismissed());

  // Re-check dismiss state periodically
  useEffect(() => {
    if (!adsVisible) return;
    const id = setInterval(() => {
      setDismissed(isDismissed());
    }, 60_000);
    return () => clearInterval(id);
  }, [adsVisible]);

  const handleDismiss = useCallback(() => {
    const until = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(DISMISS_KEY, String(until));
    setDismissed(true);
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
          className="fixed bottom-4 right-4 z-50 w-[300px] max-w-[calc(100vw-2rem)] bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header row: label + close */}
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-stone-500 select-none">
              Advertisement
            </span>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss ad banner"
              className="p-0.5 rounded text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
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
