'use client';

import React from 'react';
import { GameState } from '@/lib/game/types';
import { GameEngine } from '@/lib/game/engine';
import { Coins, Trophy, Sparkles, History, Zap, Moon, Settings } from 'lucide-react';

interface GameHeaderProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onShowStats: () => void;
  onShowSkills: () => void;
  onToggleTheme: () => void;
  onShowSettings: () => void;
  onShowHelp: (help: { title: string; content: string }) => void;
}

export default function GameHeader({
  state,
  engine,
  t,
  onShowStats,
  onShowSkills,
  onToggleTheme,
  onShowSettings,
  onShowHelp,
}: GameHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200/50 p-2 md:p-3 flex justify-between items-center z-10 flex-wrap gap-2 sticky top-0">
      <div className="flex items-center gap-3 md:gap-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
          <Coins className="text-yellow-500 w-4 h-4 md:w-5 md:h-5" />
          <span className="font-mono font-bold text-base md:text-lg text-yellow-700">{Math.floor(state.gold).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <Trophy className="text-orange-500 w-4 h-4 md:w-5 md:h-5" />
          <span className="font-bold text-sm md:text-base text-orange-700">{t('stage')}: {state.stage}</span>
        </div>
        <button 
          onClick={() => onShowHelp({ title: 'Lucky Worms', content: 'Lucky Worms increase your gold income! Formula: 1 + (Lucky Worms * 0.05)' })}
          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100 hover:border-violet-200 transition-colors"
        >
          <Sparkles className="text-violet-500 w-4 h-4 md:w-5 md:h-5" />
          <span className="font-bold text-sm md:text-base text-violet-700">
            {state.luckyWorms} <span className="hidden sm:inline opacity-70">(+{state.luckyWorms * 5}%)</span>
          </span>
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onShowStats} className="p-2 hover:bg-stone-100 rounded-xl transition-colors" title="Statistics">
          <History className="w-5 h-5 text-stone-500" />
        </button>
        <button onClick={onShowSkills} className="p-2 hover:bg-stone-100 rounded-xl transition-colors" title="Skills">
          <Zap className="w-5 h-5 text-stone-500" />
        </button>
        <button onClick={onToggleTheme} className="p-2 hover:bg-stone-100 rounded-xl transition-colors" title="Toggle theme">
          <Moon className="w-5 h-5 text-stone-500" />
        </button>
        <button onClick={onShowSettings} className="p-2 hover:bg-stone-100 rounded-xl transition-colors" title="Settings">
          <Settings className="w-5 h-5 text-stone-500" />
        </button>
      </div>
    </header>
  );
}
