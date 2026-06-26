'use client';

import React from 'react';
import { TrendingUp, Sparkles, BarChart2 } from 'lucide-react';

interface MobileNavProps {
  t: (key: string, params?: any) => string;
  onShowUpgrades: () => void;
  onShowAscension: () => void;
  onShowStats: () => void;
}

export default function MobileNav({
  t,
  onShowUpgrades,
  onShowAscension,
  onShowStats,
}: MobileNavProps) {
  return (
    <nav className="lg:hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-t border-stone-200/50 dark:border-stone-700/50 flex justify-around p-3 z-10">
      <button onClick={onShowUpgrades} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">
        <TrendingUp className="w-5 h-5 text-stone-600" />
        <span className="text-[10px] font-bold uppercase text-stone-500">{t('upgrades')}</span>
      </button>
      <button onClick={onShowAscension} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <span className="text-[10px] font-bold uppercase text-violet-600">{t('ascension')}</span>
      </button>
      <button onClick={onShowStats} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
        <BarChart2 className="w-5 h-5 text-blue-600" />
        <span className="text-[10px] font-bold uppercase text-blue-600">{t('stats')}</span>
      </button>
    </nav>
  );
}
