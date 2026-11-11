'use client';

import { BarChart2, Map, Sparkles, TrendingUp } from 'lucide-react';
import React from 'react';

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
    <nav className="abyss-nav" aria-label="Game sections">
      <button type="button" onClick={onShowUpgrades} className="abyss-nav-btn">
        <TrendingUp className="w-5 h-5" aria-hidden="true" />
        <span>{t('upgrades')}</span>
      </button>
      <button type="button" onClick={onShowAscension} className="abyss-nav-btn is-magic">
        <Sparkles className="w-5 h-5" aria-hidden="true" />
        <span>{t('ascension')}</span>
      </button>
      <button
        type="button"
        onClick={onShowJourney}
        className={`abyss-nav-btn ${canClaimDailyReward ? 'is-alert' : ''}`}
      >
        <span className="relative">
          <Map className="w-5 h-5" aria-hidden="true" />
          {canClaimDailyReward && <span className="abyss-dot" aria-hidden="true" />}
        </span>
        <span>{t('journey_short')}</span>
        {canClaimDailyReward && <span className="sr-only">Daily reward available</span>}
      </button>
      <button type="button" onClick={onShowStats} className="abyss-nav-btn">
        <BarChart2 className="w-5 h-5" aria-hidden="true" />
        <span>{t('stats')}</span>
      </button>
    </nav>
  );
}
