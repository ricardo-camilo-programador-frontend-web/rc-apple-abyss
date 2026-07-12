'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ClickEffectsProps {
  effects: ReadonlyArray<{ id: number; x: number; y: number; value: number }>;
}

export default function ClickEffects({ effects }: ClickEffectsProps) {
  return (
    <AnimatePresence>
      {effects.map(effect => (
        <motion.div
          key={effect.id}
          initial={{ opacity: 1, y: effect.y - 20, x: effect.x }}
          animate={{ opacity: 0, y: effect.y - 100 }}
          exit={{ opacity: 0 }}
          className="fixed pointer-events-none z-[100] font-mono font-bold text-red-500 text-xl drop-shadow-md"
          aria-hidden="true"
        >
          +{effect.value}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
