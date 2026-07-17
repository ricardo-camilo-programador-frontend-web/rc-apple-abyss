'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins } from 'lucide-react';

interface OfflineModalProps {
  result: { apples: number; gold: number } | null;
  t: (key: string, params?: any) => string;
  onDismiss: () => void;
}

export default function OfflineModal({ result, t, onDismiss }: OfflineModalProps) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-stone-800 rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center space-y-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 rounded-full flex items-center justify-center mx-auto">
              <Coins className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold dark:text-stone-100">{t('offline_welcome')}</h2>
            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
              {t('offline_earnings', {
                n: result.apples,
                g: Math.floor(result.gold).toLocaleString(),
              })}
            </p>
            <button
              onClick={onDismiss}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-200 dark:shadow-red-900/40 active:scale-95"
            >
              {t('awesome') || 'Awesome!'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
