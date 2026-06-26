'use client';

import React from 'react';
import { GameState } from '@/lib/game/types';
import { GameEngine } from '@/lib/game/engine';
import { APPLE_SPRITES, getAppleSpriteIndex } from '@/lib/game/sprites';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap } from 'lucide-react';

interface AppleAreaProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  isShaking: boolean;
  particleOffsets: Array<{ x: number; y: number; delay: number }>;
  onAppleClick: (e: React.MouseEvent) => void;
  onActivateSkill: () => void;
}

export default function AppleArea({
  state,
  engine,
  t,
  isShaking,
  particleOffsets,
  onAppleClick,
  onActivateSkill,
}: AppleAreaProps) {
  const hpPercent = (state.appleHP / state.maxAppleHP) * 100;
  const activeSpriteIndex = getAppleSpriteIndex(state.appleHP, state.maxAppleHP);

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative min-h-[500px]">
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 via-orange-50/20 to-yellow-50/30 rounded-full blur-3xl scale-150" />
        
        <div className="relative group cursor-pointer" onClick={onAppleClick}>
          <div className={`relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto transition-all duration-500 ${
            state.skills.golden_harvest.isActive ? 'scale-105' : ''
          }`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-white via-stone-50 to-white rounded-full shadow-2xl transition-all duration-300 ${
              state.skills.golden_harvest.isActive 
                ? 'border-4 border-yellow-400 shadow-yellow-200/50' 
                : 'border-4 border-stone-100'
            }`} />
            
            <div className="absolute inset-4 bg-gradient-to-br from-stone-50 to-white rounded-full shadow-inner flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`relative w-full h-full flex items-center justify-center ${isShaking ? 'shake-active' : ''}`}
              >
                <div className={`apple-sprite-container absolute inset-8 transition-all duration-300 ${
                  state.skills.golden_harvest.isActive 
                    ? 'brightness-110 saturate-150 sepia-[0.3] hue-rotate-[40deg] drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]' 
                    : ''
                }`}>
                  {APPLE_SPRITES.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt="Apple"
                      className="apple-sprite"
                      loading="eager"
                      decoding="async"
                      style={{ opacity: index === activeSpriteIndex ? 1 : 0 }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {state.skills.golden_harvest.isActive && particleOffsets.map((offset, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1.5, 0],
                  x: offset.x,
                  y: offset.y
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: offset.delay
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full z-30 shadow-lg"
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-stone-100 dark:border-stone-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Apple HP</span>
              </div>
              <span className="font-mono text-sm font-bold text-stone-700 dark:text-stone-300">
                {Math.ceil(state.appleHP).toLocaleString()} / {state.maxAppleHP.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-500 via-red-400 to-orange-400 rounded-full"
                initial={false}
                animate={{ width: `${hpPercent}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              />
            </div>
          </div>

          <motion.button
            onClick={onActivateSkill}
            disabled={state.skills.golden_harvest.cooldownRemaining > 0 || state.skills.golden_harvest.isActive}
            whileHover={!state.skills.golden_harvest.cooldownRemaining && !state.skills.golden_harvest.isActive ? { scale: 1.02 } : {}}
            whileTap={!state.skills.golden_harvest.cooldownRemaining && !state.skills.golden_harvest.isActive ? { scale: 0.98 } : {}}
            className={`w-full relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all overflow-hidden ${
              state.skills.golden_harvest.isActive
                ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-lg shadow-yellow-200/50'
                : state.skills.golden_harvest.cooldownRemaining > 0
                ? 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:border-yellow-400 dark:hover:border-yellow-600 shadow-lg shadow-yellow-100/50'
            }`}
          >
            <Zap className={`w-5 h-5 ${state.skills.golden_harvest.isActive ? 'animate-bounce' : ''}`} />
            <div className="flex flex-col items-start">
              <span className="text-sm">{t('skill_golden_harvest')}</span>
              <span className="text-[10px] opacity-70">
                {state.skills.golden_harvest.isActive 
                  ? `${t('skill_active')}: ${Math.ceil(state.skills.golden_harvest.remainingDuration)}s`
                  : state.skills.golden_harvest.cooldownRemaining > 0
                  ? `${t('skill_cooldown')}: ${Math.ceil(state.skills.golden_harvest.cooldownRemaining)}s`
                  : 'x5 Click, x2.5 Idle'}
              </span>
            </div>
            
            {state.skills.golden_harvest.cooldownRemaining > 0 && !state.skills.golden_harvest.isActive && (
              <motion.div 
                className="absolute inset-0 bg-stone-200/50"
                initial={false}
                animate={{ height: `${(state.skills.golden_harvest.cooldownRemaining / 120) * 100}%` }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
