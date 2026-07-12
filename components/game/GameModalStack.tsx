'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { GameState } from '@/lib/game/types';
import { GameEngine } from '@/lib/game/engine';
import SettingsModal from '@/components/game/SettingsModal';
import OfflineModal from '@/components/game/OfflineModal';
import SkillsModal from '@/components/game/SkillsModal';
import StatsModal from '@/components/game/StatsModal';
import OnboardingModal from '@/components/game/OnboardingModal';
import JourneyModal from '@/components/game/JourneyModal';
import ClickEffects from '@/components/game/ClickEffects';

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
  onImportSave: (str: string) => void;
  onResetGame: () => void;
  onExportSave: () => void;
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
}: GameModalStackProps) {
  return (
    <>
      {/* Help modal */}
      <Modal isOpen={!!showHelp} onClose={onCloseHelp} title={showHelp?.title ?? ''}>
        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{showHelp?.content}</p>
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
      <OnboardingModal
        isOpen={showOnboarding}
        engine={engine}
        t={t}
        onClose={onCloseOnboarding}
      />

      {/* Journey modal */}
      <JourneyModal
        isOpen={showJourney}
        engine={engine}
        t={t}
        onClose={onCloseJourney}
      />

      {/* Click effects overlay */}
      <ClickEffects effects={clickEffects} />
    </>
  );
}
