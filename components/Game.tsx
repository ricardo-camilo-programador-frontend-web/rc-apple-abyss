'use client';

import React, { useEffect, useState } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { analytics } from '@/lib/analytics';

// Extracted layout components
import GameHeader from '@/components/game/GameHeader';
import AppleArea from '@/components/game/AppleArea';
import UpgradeSidebar from '@/components/game/UpgradeSidebar';
import AscensionSidebar from '@/components/game/AscensionSidebar';
import MobileNav from '@/components/game/MobileNav';
import GameFooter from '@/components/game/GameFooter';

// Extracted ad, modal and effects components
import AdSidebars from '@/components/game/AdLayout';
import FooterAds from '@/components/game/FooterAds';
import GameModalStack from '@/components/game/GameModalStack';
import MobileModals from '@/components/game/MobileModals';

// Extracted hooks
import { useGameLoop } from '@/hooks/use-game-loop';
import { useGameKeyboard } from '@/hooks/use-game-keyboard';
import { useGameOrchestration } from '@/hooks/use-game-orchestration';

export default function Game() {
  const [engine] = useState(() => new GameEngine());
  const orch = useGameOrchestration(engine);

  // Mount effect
  useEffect(() => {
    const timer = setTimeout(() => orch.setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, [orch]);

  // Game loop and keyboard hooks
  useGameLoop(engine, orch.handleStateUpdate);
  useGameKeyboard(engine, orch.handleStateUpdate);

  // Show onboarding on first mount for new players
  useEffect(() => {
    if (orch.isMounted && engine.shouldShowOnboarding()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time initialization from engine state
      orch.setShowOnboarding(true);
    }
  }, [orch.isMounted, engine, orch]);

  // Periodic goal checking
  useEffect(() => {
    if (!orch.isMounted) return;
    const interval = setInterval(() => {
      const newCompleted = engine.checkAndAwardGoals();
      if (newCompleted.length > 0) {
        orch.handleStateUpdate();
        for (const goalId of newCompleted) {
          analytics.goalCompleted(goalId);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [orch.isMounted, engine, orch]);

  if (!orch.isMounted || !orch.state || !engine)
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50 dark:bg-stone-900">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 overflow-hidden select-none">
      <GameHeader
        state={orch.state}
        t={orch.t}
        onShowStats={() => orch.setShowStats(true)}
        onShowSkills={() => orch.setShowSkills(true)}
        onShowSettings={() => orch.setShowSettings(true)}
        onShowHelp={help => orch.setShowHelp(help)}
        onShowJourney={() => orch.setShowJourney(true)}
        canClaimDailyReward={orch.canClaimDailyReward}
      />

      <div className="flex-1 flex flex-row overflow-hidden">
        <AdSidebars />
        <main className="flex-1 flex flex-col lg:flex-row relative overflow-y-auto">
          <UpgradeSidebar
            state={orch.state}
            engine={engine}
            t={orch.t}
            onBuyUpgrade={orch.handleBuyUpgrade}
            onBuyClickUpgrade={orch.handleBuyClickUpgrade}
          />
          <AppleArea
            state={orch.state}
            engine={engine}
            t={orch.t}
            isShaking={orch.isShaking}
            particleOffsets={orch.particleOffsets}
            onAppleClick={orch.handleClick}
            onActivateSkill={orch.handleActivateSkill}
          />
          <AscensionSidebar
            state={orch.state}
            engine={engine}
            t={orch.t}
            onAscend={orch.handleAscend}
          />
        </main>
      </div>

      <MobileNav
        t={orch.t}
        onShowUpgrades={() => orch.setShowUpgradesModal(true)}
        onShowAscension={() => orch.setShowAscensionModal(true)}
        onShowStats={() => orch.setShowStatsPanelModal(true)}
        onShowJourney={() => orch.setShowJourney(true)}
        canClaimDailyReward={orch.canClaimDailyReward}
      />

      <GameFooter t={orch.t} />
      <FooterAds />

      <GameModalStack
        state={orch.state}
        engine={engine}
        t={orch.t}
        showSettings={orch.showSettings}
        showSkills={orch.showSkills}
        showStats={orch.showStats}
        showJourney={orch.showJourney}
        showOnboarding={orch.showOnboarding}
        showHelp={orch.showHelp}
        offlineResult={orch.offlineResult}
        clickEffects={orch.clickEffects}
        onCloseSettings={() => orch.setShowSettings(false)}
        onCloseSkills={() => orch.setShowSkills(false)}
        onCloseStats={() => orch.setShowStats(false)}
        onCloseJourney={() => orch.setShowJourney(false)}
        onCloseOnboarding={() => orch.setShowOnboarding(false)}
        onCloseHelp={() => orch.setShowHelp(null)}
        onDismissOffline={() => orch.setOfflineResult(null)}
        onStateUpdate={orch.handleStateUpdate}
        onImportSave={orch.handleImportSave}
        onResetGame={orch.handleResetGame}
        onExportSave={orch.handleExportSave}
      />

      <MobileModals
        state={orch.state}
        engine={engine}
        t={orch.t}
        showUpgradesModal={orch.showUpgradesModal}
        showAscensionModal={orch.showAscensionModal}
        showStatsPanelModal={orch.showStatsPanelModal}
        onCloseUpgrades={() => orch.setShowUpgradesModal(false)}
        onCloseAscension={() => orch.setShowAscensionModal(false)}
        onCloseStatsPanel={() => orch.setShowStatsPanelModal(false)}
        onBuyUpgrade={orch.handleBuyUpgrade}
        onBuyClickUpgrade={orch.handleBuyClickUpgrade}
        onAscend={orch.handleAscend}
      />
    </div>
  );
}
