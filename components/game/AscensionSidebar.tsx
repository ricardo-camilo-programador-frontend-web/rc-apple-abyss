'use client';

import React from 'react';
import { GameState } from '@/lib/game/types';
import { GameEngine } from '@/lib/game/engine';
import StatCard from './StatCard';
import { Coins, Trophy, MousePointer2, Sword, Users, Sparkles, History } from 'lucide-react';
import { motion } from 'motion/react';

interface AscensionSidebarProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onAscend: () => void;
  className?: string;
}

export default function AscensionSidebar({
  state,
  engine,
  t,
  onAscend,
  className,
}: AscensionSidebarProps) {
  const progress = Math.min((state.stage / 50) * 100, 100);
  const canAscend = engine.canAscend();
  const pendingWorms = engine.getPendingLuckyWorms();

  return (
    <aside className={className ?? "hidden lg:flex w-80 bg-white/50 dark:bg-stone-800/50 backdrop-blur-sm border-l border-stone-200/50 dark:border-stone-700/50 p-4 flex-col gap-4 overflow-y-auto"}>
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">{t('ascension')}</h2>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl p-4 border border-violet-100 dark:border-violet-800/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="font-semibold text-sm text-violet-900 dark:text-violet-200">Ascension</div>
              <div className="text-[10px] text-violet-600 dark:text-violet-400">Reset for permanent bonuses</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-violet-600 dark:text-violet-400">Progress to Stage 50</span>
              <span className="font-mono text-violet-900 dark:text-violet-200">{state.stage}/50</span>
            </div>
            <div className="h-2 bg-violet-100 dark:bg-violet-900/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              />
            </div>
          </div>

          {canAscend && (
            <div className="flex items-center gap-2 p-2 bg-violet-100/50 dark:bg-violet-900/30 rounded-lg mb-3">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-900 dark:text-violet-200">
                {pendingWorms} Lucky Worms ready!
              </span>
            </div>
          )}

          <button
            onClick={onAscend}
            disabled={!canAscend}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
              canAscend
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 active:scale-95 shadow-lg shadow-violet-200 dark:shadow-violet-900/50'
                : 'bg-violet-100 dark:bg-violet-900/40 text-violet-400 dark:text-violet-600 cursor-not-allowed'
            }`}
          >
            {canAscend ? t('ascend_now') || 'Ascend Now!' : (t('reach_stage') || 'Reach Stage ') + '50'}
          </button>

          <div className="mt-2 text-[10px] text-violet-500 dark:text-violet-400 text-center">
            Lucky Worms: +5% gold each
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">{t('stats')}</h2>
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">Economy</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard 
                icon={Coins} 
                label="Gold" 
                value={Math.floor(state.gold).toLocaleString()} 
                color="yellow" 
              />
              <StatCard 
                icon={Trophy} 
                label="Stage" 
                value={state.stage} 
                color="orange" 
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">Combat</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard 
                icon={MousePointer2} 
                label="Click Dmg" 
                value={engine.getClickDamage().toFixed(1)} 
                color="red" 
              />
              <StatCard 
                icon={Sword} 
                label="Idle DPS" 
                value={engine.getTotalDPS().toFixed(1)} 
                color="blue" 
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">Progression</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard 
                icon={Users} 
                label="Worms" 
                value={Object.values(state.worms).reduce((a, b) => a + b, 0)} 
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
                value={state.totalApplesEaten.toLocaleString()} 
                color="stone" 
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
