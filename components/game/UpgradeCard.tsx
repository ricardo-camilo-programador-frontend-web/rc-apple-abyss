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
  const name = t(upgrade.nameKey);

  return (
    <motion.button
      type="button"
      onClick={onBuy}
      disabled={!canAfford}
      aria-label={
        canAfford
          ? `Buy ${name} for ${Math.floor(cost)} gold`
          : `${name} locked, costs ${Math.floor(cost)} gold`
      }
      className="abyss-card"
    >
      <div className="flex items-center gap-3">
        <div className="abyss-card-icon">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{name}</span>
            <span className="abyss-level">Lv.{count}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="abyss-cost">
              <Coins className="w-3 h-3" aria-hidden="true" />
              {Math.floor(cost).toLocaleString()}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              DPS {currentDPS.toFixed(1)} → {nextDPS.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
