'use client';

import { Coins, TrendingUp, Zap } from 'lucide-react';
import React from 'react';
import ClickEffects from '@/components/game/ClickEffects';
import JourneyModal from '@/components/game/JourneyModal';
import OfflineModal from '@/components/game/OfflineModal';
import OnboardingModal from '@/components/game/OnboardingModal';
import SettingsModal from '@/components/game/SettingsModal';
import SkillsModal from '@/components/game/SkillsModal';
import StatsModal from '@/components/game/StatsModal';
import Modal from '@/components/Modal';
import RewardedAdButton from '@/components/RewardedAdButton';
import type { GameEngine } from '@/lib/game/engine';
import type { GameState } from '@/lib/game/types';

interface RewardedAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: GameEngine;
  state: GameState;
  getCooldown: (key: string) => number;
  onGoldBoost: () => void;
  onInstantHarvest: () => void;
  onResetCooldown: () => void;
}

function RewardedAdsModal({
  isOpen,
  onClose,
  engine,
  state,
  getCooldown,
  onGoldBoost,
  onInstantHarvest,
  onResetCooldown,
}: RewardedAdsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Free Rewards">
      <div className="space-y-3">
        <p className="text-xs text-stone-500 dark:text-stone-400 text-center pb-2">
          Watch a short ad to claim a bonus reward. Totally optional!
        </p>

        <RewardedAdButton
          label="2x Gold Boost"
          description="Instant 10% gold bonus + 30s boost indicator"
          icon={Coins}
          cooldownRemaining={getCooldown('gold_boost')}
          onReward={onGoldBoost}
        />

        <RewardedAdButton
          label="Instant Harvest"
          description="Collect 5 minutes of idle production instantly"
          icon={TrendingUp}
          cooldownRemaining={getCooldown('instant_harvest')}
          onReward={onInstantHarvest}
          disabled={engine.getTotalDPS() === 0}
          disabledReason="Buy worms first to generate idle income"
        />

        <RewardedAdButton
          label="Reset Skill Cooldown"
          description="Instantly reset Golden Harvest cooldown"
          icon={Zap}
          cooldownRemaining={getCooldown('reset_cooldown')}
          onReward={onResetCooldown}
          disabled={
            state.skills.golden_harvest.cooldownRemaining === 0 &&
            !state.skills.golden_harvest.isActive
          }
          disabledReason="Skill is already available"
        />
      </div>
    </Modal>
  );
}

interface GameModalStackProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: Record<string, string | number>) => string;
  showSettings: boolean;
  showSkills: boolean;
  showStats: boolean;
  showJourney: boolean;
  showOnboarding: boolean;
  showHelp: { title: string; content: string } | null;
  offlineResult: { apples: number; gold: number } | null;
  clickEffects: ReadonlyArray<{ id: number; x: number; y: number; value: number }>;
  onCloseSettings: () => void;
  onCloseSkills: () => void;
  onCloseStats: () => void;
  onCloseJourney: () => void;
  onCloseOnboarding: () => void;
  onCloseHelp: () => void;
  onDismissOffline: () => void;
  onStateUpdate: () => void;
  onImportSave: (saveString: string) => Promise<boolean>;
  onResetGame: () => void;
  onExportSave: () => void;
  // Rewarded ads
  showRewardedAds: boolean;
  onCloseRewardedAds: () => void;
  getCooldown: (key: string) => number;
  onGoldBoost: () => void;
  onInstantHarvest: () => void;
  onResetCooldown: () => void;
}

export default function GameModalStack({
  state,
  engine,
  t,
  showSettings,
  showSkills,
  showStats,
  showJourney,
  showOnboarding,
  showHelp,
  offlineResult,
  clickEffects,
  onCloseSettings,
  onCloseSkills,
  onCloseStats,
  onCloseJourney,
  onCloseOnboarding,
  onCloseHelp,
  onDismissOffline,
  onStateUpdate,
  onImportSave,
  onResetGame,
  onExportSave,
  showRewardedAds,
  onCloseRewardedAds,
  getCooldown,
  onGoldBoost,
  onInstantHarvest,
  onResetCooldown,
}: GameModalStackProps) {
  return (
    <>
      {/* Help modal */}
      <Modal isOpen={!!showHelp} onClose={onCloseHelp} title={showHelp?.title ?? ''}>
        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
          {showHelp?.content}
        </p>
      </Modal>

      {/* Skills modal */}
      <SkillsModal isOpen={showSkills} engine={engine} t={t} onClose={onCloseSkills} />

      {/* Stats modal */}
      <StatsModal isOpen={showStats} state={state} t={t} onClose={onCloseStats} />

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        state={state}
        engine={engine}
        t={t}
        onClose={onCloseSettings}
        onStateUpdate={onStateUpdate}
        onImportSave={onImportSave}
        onResetGame={onResetGame}
        onExportSave={onExportSave}
      />

      {/* Offline earnings modal */}
      <OfflineModal result={offlineResult} t={t} onDismiss={onDismissOffline} />

      {/* Onboarding modal */}
      <OnboardingModal isOpen={showOnboarding} engine={engine} t={t} onClose={onCloseOnboarding} />

      {/* Journey modal */}
      <JourneyModal isOpen={showJourney} engine={engine} t={t} onClose={onCloseJourney} />

      {/* Rewarded ads modal */}
      <RewardedAdsModal
        isOpen={showRewardedAds}
        onClose={onCloseRewardedAds}
        engine={engine}
        state={state}
        getCooldown={getCooldown}
        onGoldBoost={onGoldBoost}
        onInstantHarvest={onInstantHarvest}
        onResetCooldown={onResetCooldown}
      />

      {/* Click effects overlay */}
      <ClickEffects effects={clickEffects} />
    </>
  );
}
