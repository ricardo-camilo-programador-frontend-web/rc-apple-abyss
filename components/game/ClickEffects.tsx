'use client';

import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface ClickEffectsProps {
  effects: ReadonlyArray<{ id: number; x: number; y: number; value: number }>;
}

export default function ClickEffects({ effects }: ClickEffectsProps) {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence>
      {effects.map((effect) => (
        <motion.div
          key={effect.id}
          initial={{ opacity: 1, y: effect.y - 20, x: effect.x }}
          animate={{ opacity: 0, y: reduceMotion ? effect.y - 20 : effect.y - 80 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.6 }}
          className="click-pop"
          aria-hidden="true"
        >
          +{effect.value}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
