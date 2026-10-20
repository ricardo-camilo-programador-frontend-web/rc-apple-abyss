'use client';

import { Bug, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import type { WORM_UPGRADES } from '@/lib/game/constants';
import { WORM_ICONS } from '@/lib/game/worm-catalog';

interface UpgradeCardProps {
  upgrade: (typeof WORM_UPGRADES)[number];
  count: number;
  cost: number;
  canAfford: boolean;
  currentDPS: number;
  nextDPS: number;
  onBuy: () => void;
  t: (key: string, params?: any) => string;
}

export default function UpgradeCard({
  upgrade,
  count,
  cost,
  canAfford,
  currentDPS,
  nextDPS,
  onBuy,
  t,
}: UpgradeCardProps) {
  const Icon = WORM_ICONS[upgrade.id] || Bug;

  return (
    <motion.button
      onClick={onBuy}
      disabled={!canAfford}
      whileHover={canAfford ? { scale: 1.01, y: -2 } : {}}
      whileTap={canAfford ? { scale: 0.98 } : {}}
      className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
        canAfford
          ? 'bg-white dark:bg-stone-800 hover:shadow-lg border border-stone-100 dark:border-stone-600 hover:border-stone-200 dark:hover:border-stone-500 cursor-pointer'
          : 'bg-stone-50/50 dark:bg-stone-900/50 border border-stone-100/50 dark:border-stone-700/50 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            canAfford
              ? 'bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-600'
              : 'bg-stone-100 dark:bg-stone-800'
          }`}
        >
          <Icon
            className={`w-5 h-5 ${canAfford ? 'text-stone-600 dark:text-stone-200' : 'text-stone-400 dark:text-stone-500'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm dark:text-stone-100 truncate">
              {t(upgrade.nameKey)}
            </span>
            <span className="text-xs font-mono bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded-md shrink-0">
              Lv.{count}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-mono text-xs">
              <Coins className="w-3 h-3" />
              <span>{Math.floor(cost).toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400">
              DPS: {currentDPS.toFixed(1)} → {nextDPS.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
