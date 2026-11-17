'use client';

import { Coins, History, MousePointer2, Sparkles, Sword, Trophy, Users, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import type { GameEngine } from '@/lib/game/engine';
import type { GameState } from '@/lib/game/types';
import NumberText from './NumberText';
import StatCard from './StatCard';

interface AscensionSidebarProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onAscend: () => void;
  onDiveAbyss: () => void;
  className?: string;
}

export default function AscensionSidebar({
  state,
  engine,
  t,
  onAscend,
  onDiveAbyss,
  className,
}: AscensionSidebarProps) {
  const progress = Math.min((state.stage / 50) * 100, 100);
  const canAscend = engine.canAscend();
  const pendingWorms = engine.getPendingLuckyWorms();
  const canDive = engine.canDiveAbyss();
  const showAbyss = canDive || state.abyssDepth > 0;

  return (
    <aside className={className ?? 'abyss-panel abyss-panel-right'}>
      <div>
        <h2 className="abyss-kicker mb-3">{t('ascension')}</h2>
        <div className="abyss-ascend">
          <div className="flex items-center gap-2 mb-3">
            <div className="abyss-card-icon w-9 h-9">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="font-semibold text-sm">Ascension</div>
              <div className="text-[11px] opacity-80">Reset for permanent bonuses</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress to Stage 50</span>
              <span className="font-mono">{state.stage}/50</span>
            </div>
            <div
              className="abyss-track"
              role="meter"
              aria-label="Progress to stage 50"
              aria-valuemin={0}
              aria-valuemax={50}
              aria-valuenow={Math.min(state.stage, 50)}
            >
              <motion.div
                style={{ background: 'var(--magic-solid)', height: '100%' }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              />
            </div>
          </div>

          {canAscend && (
            <div className="abyss-callout flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{pendingWorms} Lucky Worms ready!</span>
            </div>
          )}

          <button
            type="button"
            onClick={onAscend}
            disabled={!canAscend}
            className="abyss-btn abyss-btn-magic"
          >
            {canAscend
              ? t('ascend_now') || 'Ascend Now!'
              : `${t('reach_stage') || 'Reach Stage '}50`}
          </button>

          <p className="mt-2 text-[11px] text-center opacity-80">Lucky Worms: +5% gold each</p>
        </div>

        {showAbyss && (
          <div className="abyss-ascend mt-3" data-testid="abyss-dive">
            <div className="flex items-center gap-2 mb-3">
              <div className="abyss-card-icon w-9 h-9">
                <Waves className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold text-sm">The Abyss · Depth {state.abyssDepth}</div>
                <div className="text-[11px] opacity-80">
                  Damage &amp; gold ×<NumberText value={engine.getAbyssMultiplier()} />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onDiveAbyss}
              disabled={!canDive}
              className="abyss-btn abyss-btn-magic"
            >
              {canDive ? 'Dive into the Abyss' : 'Reach 1.80e308 gold'}
            </button>
            <p className="mt-2 text-[11px] text-center opacity-80">
              Resets run and Lucky Worms · ×2 forever per depth
            </p>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h2 className="abyss-kicker mb-3">{t('stats')}</h2>
        <div className="space-y-4">
          <div>
            <div className="abyss-kicker mb-2">Economy</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={Coins}
                label="Gold"
                value={<NumberText value={state.gold} />}
                color="yellow"
              />
              <StatCard icon={Trophy} label="Stage" value={state.stage} color="orange" />
            </div>
          </div>

          <div>
            <div className="abyss-kicker mb-2">Combat</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={MousePointer2}
                label="Click Dmg"
                value={<NumberText value={engine.getClickDamage()} decimals={1} />}
                color="red"
              />
              <StatCard
                icon={Sword}
                label="Idle DPS"
                value={<NumberText value={engine.getTotalDPS()} decimals={1} />}
                color="blue"
              />
            </div>
          </div>

          <div>
            <div className="abyss-kicker mb-2">Progression</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={Users}
                label="Worms"
                value={<NumberText value={Object.values(state.worms).reduce((a, b) => a + b, 0)} />}
                color="green"
              />
              <StatCard
                icon={Sparkles}
                label="Lucky"
                value={`${state.luckyWorms} (+${state.luckyWorms * 5}%)`}
                color="purple"
              />
              <StatCard
                icon={History}
                label="Eaten"
                value={<NumberText value={state.totalApplesEaten} />}
                color="stone"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
