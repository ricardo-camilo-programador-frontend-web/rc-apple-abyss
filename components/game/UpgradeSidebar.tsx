'use client';

import { Coins, MousePointer2 } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { WORM_UPGRADES } from '@/lib/game/constants';
import type { GameEngine } from '@/lib/game/engine';
import type { GameState } from '@/lib/game/types';
import { WORM_CATEGORIES } from '@/lib/game/worm-catalog';
import CollapsibleSection from './CollapsibleSection';
import UpgradeCard from './UpgradeCard';

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
    upgrades: category.ids.map((id) => WORM_UPGRADES.find((u) => u.id === id)).filter(Boolean),
  }));

  return (
    <aside className={className ?? 'abyss-panel abyss-panel-left'}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="abyss-kicker">{t('upgrades')}</h2>
        <span className="abyss-hint">[C] quick buy</span>
      </div>
      <CollapsibleSection title="Click Power" icon={MousePointer2} color="yellow">
        <motion.button
          type="button"
          onClick={onBuyClickUpgrade}
          disabled={state.gold < engine.getClickUpgradeCost()}
          whileHover={state.gold >= engine.getClickUpgradeCost() ? { scale: 1.01, y: -2 } : {}}
          whileTap={state.gold >= engine.getClickUpgradeCost() ? { scale: 0.98 } : {}}
          className="abyss-card is-gold"
        >
          <div className="flex items-center gap-3">
            <div className="abyss-card-icon">
              <MousePointer2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">Click Power</span>
                <span className="abyss-level">Lv.{state.clickLevel}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="abyss-cost">
                  <Coins className="w-3 h-3" aria-hidden="true" />
                  {Math.floor(engine.getClickUpgradeCost()).toLocaleString()}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  Dmg: {engine.getClickDamage().toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <span className="abyss-hint">[C]</span>
        </motion.button>
      </CollapsibleSection>

      {upgradesByCategory.map((category) => (
        <CollapsibleSection
          key={category.title}
          title={category.title}
          icon={category.icon}
          color={category.color}
          defaultOpen={category.title === 'Basic Worms'}
        >
          {category.upgrades.map((upgrade) => {
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
