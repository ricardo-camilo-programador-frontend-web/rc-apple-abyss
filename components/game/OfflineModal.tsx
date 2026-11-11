'use client';

import { Coins } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface OfflineModalProps {
  result: { apples: number; gold: number } | null;
  t: (key: string, params?: any) => string;
  onDismiss: () => void;
}

export default function OfflineModal({ result, t, onDismiss }: OfflineModalProps) {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          className="abyss-backdrop"
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offline-title"
            initial={reduceMotion ? false : { scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            className="abyss-modal"
          >
            <div className="abyss-modal-body text-center space-y-5">
              <div className="abyss-card-icon w-16 h-16 mx-auto rounded-full">
                <Coins className="w-8 h-8" aria-hidden="true" />
              </div>
              <h2 id="offline-title" className="text-2xl font-bold">
                {t('offline_welcome')}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {t('offline_earnings', {
                  n: result.apples,
                  g: Math.floor(result.gold).toLocaleString(),
                })}
              </p>
              <button type="button" onClick={onDismiss} className="abyss-btn abyss-btn-apple">
                {t('awesome') || 'Awesome!'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
