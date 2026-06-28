'use client';

import React from 'react';
import { GameState } from '@/lib/game/types';
import { GameEngine } from '@/lib/game/engine';
import UpgradeCard from './UpgradeCard';
import CollapsibleSection from './CollapsibleSection';
import { WORM_CATEGORIES } from '@/lib/game/worm-catalog';
import { WORM_UPGRADES } from '@/lib/game/constants';
import { Coins, MousePointer2 } from 'lucide-react';
import { motion } from 'motion/react';

interface UpgradeSidebarProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onBuyUpgrade: (id: string) => void;
  onBuyClickUpgrade: () => void;
  className?: string;
}

export default function UpgradeSidebar({
  state,
  engine,
  t,
  onBuyUpgrade,
  onBuyClickUpgrade,
  className,
}: UpgradeSidebarProps) {
  const upgradesByCategory = Object.entries(WORM_CATEGORIES).map(([key, category]) => ({
    ...category,
    upgrades: category.ids.map(id => WORM_UPGRADES.find(u => u.id === id)).filter(Boolean)
  }));

  return (
    <aside className={className ?? "hidden lg:flex w-80 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border-r border-stone-200/50 dark:border-stone-700/50 overflow-y-auto p-4 flex-col gap-2"}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">{t('upgrades')}</h2>
        <span className="text-[10px] text-stone-400 font-mono">[C] quick buy</span>
      </div>
      <CollapsibleSection 
        title="Click Power" 
        icon={MousePointer2} 
        color="yellow"
      >
        <motion.button
          onClick={onBuyClickUpgrade}
          disabled={state.gold < engine.getClickUpgradeCost()}
          whileHover={state.gold >= engine.getClickUpgradeCost() ? { scale: 1.01, y: -2 } : {}}
          whileTap={state.gold >= engine.getClickUpgradeCost() ? { scale: 0.98 } : {}}
          className={`relative w-full p-3 rounded-xl text-left transition-all duration-200 ${
            state.gold >= engine.getClickUpgradeCost()
              ? 'bg-white dark:bg-stone-800 hover:shadow-lg border border-yellow-200 dark:border-yellow-700 cursor-pointer' 
              : 'bg-stone-50/50 dark:bg-stone-800/50 border border-stone-100/50 dark:border-stone-700/50 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 rounded-lg flex items-center justify-center">
              <MousePointer2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">Click Power</span>
                <span className="text-xs font-mono bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-md shrink-0">
                  Lv.{state.clickLevel}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-mono text-xs">
                  <Coins className="w-3 h-3" />
                  <span>{Math.floor(engine.getClickUpgradeCost()).toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                  Dmg: {engine.getClickDamage().toFixed(1)}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-1 right-1 text-[8px] text-stone-300 dark:text-stone-600 font-bold uppercase">[C]</div>
        </motion.button>
      </CollapsibleSection>

      {upgradesByCategory.map(category => (
        <CollapsibleSection 
          key={category.title}
          title={category.title} 
          icon={category.icon} 
          color={category.color}
          defaultOpen={category.title === 'Basic Worms'}
        >
          {category.upgrades.map(upgrade => {
            if (!upgrade) return null;
            const cost = engine.getUpgradeCost(upgrade.id);
            const canAfford = state.gold >= cost;
            const count = state.worms[upgrade.id] || 0;
            const currentDPS = engine.getWormDPS(upgrade.id);
            const nextDPS = count === 0 ? upgrade.baseDPS : currentDPS * upgrade.dpsGrowth;

            return (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                count={count}
                cost={cost}
                canAfford={canAfford}
                currentDPS={currentDPS}
                nextDPS={nextDPS}
                onBuy={() => onBuyUpgrade(upgrade.id)}
                t={t}
              />
            );
          })}
        </CollapsibleSection>
      ))}
    </aside>
  );
}
