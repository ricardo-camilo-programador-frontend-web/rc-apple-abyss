'use client';

import { Gift, Heart, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';
import type { GameEngine } from '@/lib/game/engine';
import { APPLE_SPRITES, getAppleSpriteIndex } from '@/lib/game/sprites';
import type { GameState } from '@/lib/game/types';

interface AppleAreaProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  isShaking: boolean;
  particleOffsets: ReadonlyArray<{ x: number; y: number; delay: number }>;
  onAppleClick: (e: React.MouseEvent) => void;
  onActivateSkill: () => void;
  onShowRewardedAds?: () => void;
  goldBoostRemaining?: number;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function AppleArea({
  state,
  engine,
  t,
  isShaking,
  particleOffsets,
  onAppleClick,
  onActivateSkill,
  onShowRewardedAds,
  goldBoostRemaining = 0,
}: AppleAreaProps) {
  const hpPercent = (state.appleHP / state.maxAppleHP) * 100;
  const activeSpriteIndex = getAppleSpriteIndex(state.appleHP, state.maxAppleHP);
  const skill = state.skills.golden_harvest;
  const ready = skill.cooldownRemaining <= 0 && !skill.isActive;
  const reduceMotion = prefersReducedMotion();
  const [struck, setStruck] = useState(false);

  const handleAppleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStruck(true);
    window.setTimeout(() => setStruck(false), 180);
    onAppleClick(event);
  };

  const skillClass = skill.isActive
    ? 'is-active'
    : skill.cooldownRemaining > 0
      ? 'is-cool'
      : 'is-ready';

  return (
    <section className="abyss-play" aria-label="Apple">
      <div className="abyss-apple-wrap">
        <button
          type="button"
          className={`abyss-apple-btn ${skill.isActive ? 'is-skill' : ''} ${struck ? 'is-struck' : ''}`}
          onClick={handleAppleClick}
          aria-label="Apple — click to deal damage"
        >
          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
            transition={
              reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
            className={`relative w-full h-full flex items-center justify-center ${isShaking ? 'shake-active' : ''}`}
          >
            <div className="apple-sprite-container absolute inset-[12%]">
              {APPLE_SPRITES.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 256px"
                  className="apple-sprite"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{ opacity: index === activeSpriteIndex ? 1 : 0 }}
                />
              ))}
            </div>
          </motion.div>
        </button>

        <AnimatePresence>
          {skill.isActive &&
            !reduceMotion &&
            particleOffsets.map((offset, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: offset.x,
                  y: offset.y,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: offset.delay,
                }}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full z-30"
                style={{ background: 'var(--gold)' }}
                aria-hidden="true"
              />
            ))}
        </AnimatePresence>

        <div className="abyss-meter-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" style={{ color: 'var(--hp)' }} aria-hidden="true" />
              <span className="abyss-kicker">Apple HP</span>
            </div>
            <span className="font-mono text-sm font-bold">
              {Math.ceil(state.appleHP).toLocaleString()} / {state.maxAppleHP.toLocaleString()}
            </span>
          </div>
          <div
            className="abyss-meter"
            role="meter"
            aria-label="Apple HP"
            aria-valuemin={0}
            aria-valuemax={state.maxAppleHP}
            aria-valuenow={Math.ceil(state.appleHP)}
          >
            <motion.div
              className="abyss-meter-fill"
              initial={false}
              animate={{ width: `${hpPercent}%` }}
              transition={
                reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.2 }
              }
            />
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onActivateSkill}
          disabled={!ready}
          whileHover={ready && !reduceMotion ? { scale: 1.01 } : {}}
          whileTap={ready && !reduceMotion ? { scale: 0.98 } : {}}
          className={`abyss-btn abyss-skill ${skillClass}`}
        >
          <Zap className="w-5 h-5" aria-hidden="true" />
          <span className="flex flex-col items-start">
            <span className="text-sm">{t('skill_golden_harvest')}</span>
            <span className="text-[11px] font-medium opacity-80">
              {skill.isActive
                ? `${t('skill_active')}: ${Math.ceil(skill.remainingDuration)}s`
                : skill.cooldownRemaining > 0
                  ? `${t('skill_cooldown')}: ${Math.ceil(skill.cooldownRemaining)}s`
                  : 'x5 Click, x2.5 Idle'}
            </span>
          </span>
          {skill.cooldownRemaining > 0 && !skill.isActive && (
            <motion.div
              className="abyss-skill-veil"
              initial={false}
              animate={{ height: `${(skill.cooldownRemaining / 120) * 100}%` }}
              aria-hidden="true"
            />
          )}
        </motion.button>

        {onShowRewardedAds && (
          <button
            type="button"
            onClick={onShowRewardedAds}
            className="abyss-btn abyss-btn-teal mt-3"
          >
            <Gift className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">Free Rewards</span>
            {goldBoostRemaining > 0 && (
              <span className="ml-auto font-mono text-xs font-bold">
                2x active: {goldBoostRemaining}s
              </span>
            )}
          </button>
        )}
      </div>
    </section>
  );
}
