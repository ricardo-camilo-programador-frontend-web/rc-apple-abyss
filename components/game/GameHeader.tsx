'use client';

import { Coins, History, Map, Moon, Settings, Sparkles, Sun, Trophy, Zap } from 'lucide-react';
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';
import type { GameState } from '@/lib/game/types';

interface GameHeaderProps {
  state: GameState;
  t: (key: string, params?: any) => string;
  onShowStats: () => void;
  onShowSkills: () => void;
  onShowSettings: () => void;
  onShowHelp: (help: { title: string; content: string }) => void;
  onShowJourney: () => void;
  canClaimDailyReward: boolean;
}

export default function GameHeader({
  state,
  t,
  onShowStats,
  onShowSkills,
  onShowSettings,
  onShowHelp,
  onShowJourney,
  canClaimDailyReward,
}: GameHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    const next: Record<string, 'light' | 'dark' | 'system'> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setTheme(next[theme] ?? 'system');
  };

  const themeLabel = `Theme: ${theme} (click to switch)`;
  const ThemeIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <header className="abyss-header">
      <div className="abyss-header-stats">
        <div className="abyss-chip abyss-chip-gold">
          <Coins className="w-5 h-5" aria-hidden="true" />
          <strong>{Math.floor(state.gold).toLocaleString()}</strong>
          <span className="sr-only">gold</span>
        </div>
        <div className="abyss-chip abyss-chip-stage">
          <Trophy className="w-4 h-4" aria-hidden="true" />
          <span>
            {t('stage')}: {state.stage}
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            onShowHelp({
              title: 'Lucky Worms',
              content: 'Lucky Worms increase your gold income! Formula: 1 + (Lucky Worms * 0.05)',
            })
          }
          className="abyss-chip abyss-chip-magic"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>
            {state.luckyWorms} <span className="hidden sm:inline">(+{state.luckyWorms * 5}%)</span>
          </span>
          <span className="sr-only">Lucky Worms. Open explanation.</span>
        </button>
      </div>
      <div className="abyss-header-actions">
        <button
          type="button"
          onClick={onShowJourney}
          className={`abyss-icon-btn ${canClaimDailyReward ? 'is-alert' : ''}`}
          title="Journey"
          aria-label="Journey"
        >
          <Map className="w-5 h-5" />
          {canClaimDailyReward && (
            <>
              <span className="abyss-dot" aria-hidden="true" />
              <span className="sr-only">Daily reward available</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onShowStats}
          className="abyss-icon-btn"
          title="Statistics"
          aria-label="Statistics"
        >
          <History className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onShowSkills}
          className="abyss-icon-btn"
          title="Skills"
          aria-label="Skills"
        >
          <Zap className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={cycleTheme}
          className="abyss-icon-btn"
          title={themeLabel}
          aria-label={themeLabel}
        >
          <ThemeIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onShowSettings}
          className="abyss-icon-btn"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
