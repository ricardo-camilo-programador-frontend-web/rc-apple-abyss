'use client';

import React from 'react';
import { TrendingUp, Sparkles, BarChart2, Map } from 'lucide-react';

interface MobileNavProps {
  t: (key: string, params?: any) => string;
  onShowUpgrades: () => void;
  onShowAscension: () => void;
  onShowStats: () => void;
  onShowJourney: () => void;
  canClaimDailyReward: boolean;
}

export default function MobileNav({
  t,
  onShowUpgrades,
  onShowAscension,
  onShowStats,
  onShowJourney,
  canClaimDailyReward,
}: MobileNavProps) {
  return (
    <nav className="lg:hidden bg-white/80 backdrop-blur-sm border-t border-stone-200/50 flex justify-around p-3 z-10">
      <button onClick={onShowUpgrades} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-stone-100 transition-colors">
        <TrendingUp className="w-5 h-5 text-stone-600" />
        <span className="text-[10px] font-bold uppercase text-stone-500">{t('upgrades')}</span>
      </button>
      <button onClick={onShowAscension} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <span className="text-[10px] font-bold uppercase text-violet-600">{t('ascension')}</span>
      </button>
      <button
        onClick={onShowJourney}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative ${canClaimDailyReward ? 'hover:bg-amber-50' : 'hover:bg-blue-50'}`}
      >
        <div className="relative">
          <Map className={`w-5 h-5 ${canClaimDailyReward ? 'text-amber-600' : 'text-blue-600'}`} />
          {canClaimDailyReward && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] font-bold uppercase ${canClaimDailyReward ? 'text-amber-600' : 'text-blue-600'}`}>
          {t('journey_short')}
        </span>
      </button>
      <button onClick={onShowStats} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
        <BarChart2 className="w-5 h-5 text-blue-600" />
        <span className="text-[10px] font-bold uppercase text-blue-600">{t('stats')}</span>
      </button>
    </nav>
  );
}
