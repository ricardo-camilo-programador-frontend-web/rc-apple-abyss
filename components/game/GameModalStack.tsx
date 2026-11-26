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
import { useRewardedAdStatus } from '@/hooks/use-rewarded-ads';
import { REWARDED_CONFIG } from '@/lib/game/constants';
import type { GameEngine } from '@/lib/game/engine';
import type { Decimal } from '@/lib/game/num';
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
  const ads = useRewardedAdStatus();
  const goldBoost = ads.get('gold_boost');
  const harvest = ads.get('instant_harvest');
  const resetSkill = ads.get('reset_cooldown');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Free Rewards">
      <div className="space-y-3">
        <p className="text-sm text-center pb-2" style={{ color: 'var(--muted)' }}>
          Watch a short ad to claim a bonus. The reward is given only after the ad ends. Totally
          optional!
        </p>

        <RewardedAdButton
          label="2x Gold Boost"
          description={`Double gold from clicks and idle for ${REWARDED_CONFIG.goldBoostDurationSeconds}s`}
          icon={Coins}
          cooldownRemaining={getCooldown('gold_boost')}
          status={goldBoost.status}
          retryIn={goldBoost.retryIn}
          onRequest={onGoldBoost}
          onWatch={() => ads.watch('gold_boost')}
        />

        <RewardedAdButton
          label="Instant Harvest"
          description="Collect 5 minutes of idle production instantly"
          icon={TrendingUp}
          cooldownRemaining={getCooldown('instant_harvest')}
          status={harvest.status}
          retryIn={harvest.retryIn}
          onRequest={onInstantHarvest}
          onWatch={() => ads.watch('instant_harvest')}
          disabled={engine.getTotalDPS().lte(0)}
          disabledReason="Buy worms first to generate idle income"
        />

        <RewardedAdButton
          label="Reset Skill Cooldown"
          description="Instantly reset Golden Harvest cooldown"
          icon={Zap}
          cooldownRemaining={getCooldown('reset_cooldown')}
          status={resetSkill.status}
          retryIn={resetSkill.retryIn}
          onRequest={onResetCooldown}
          onWatch={() => ads.watch('reset_cooldown')}
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
  clickEffects: ReadonlyArray<{ id: number; x: number; y: number; value: Decimal }>;
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
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
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
