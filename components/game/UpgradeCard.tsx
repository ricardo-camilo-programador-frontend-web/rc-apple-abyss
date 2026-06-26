'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Coins, Bug } from 'lucide-react';
import { WORM_UPGRADES } from '@/lib/game/constants';
import { WORM_ICONS } from '@/lib/game/worm-catalog';

interface UpgradeCardProps {
  upgrade: typeof WORM_UPGRADES[number];
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
  t 
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
          ? 'bg-white hover:shadow-lg border border-stone-100 hover:border-stone-200 cursor-pointer' 
          : 'bg-stone-50/50 border border-stone-100/50 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          canAfford ? 'bg-gradient-to-br from-stone-100 to-stone-50' : 'bg-stone-100'
        }`}>
          <Icon className={`w-5 h-5 ${canAfford ? 'text-stone-600' : 'text-stone-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm truncate">{t(upgrade.nameKey)}</span>
            <span className="text-xs font-mono bg-stone-100 px-2 py-0.5 rounded-md shrink-0">
              Lv.{count}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-yellow-600 font-mono text-xs">
              <Coins className="w-3 h-3" />
              <span>{Math.floor(cost).toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-stone-500">
              DPS: {currentDPS.toFixed(1)} → {nextDPS.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
