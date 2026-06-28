'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameState } from '@/lib/game/types';
import { motion, AnimatePresence } from 'motion/react';
import AdsterraAd from '@/components/AdsterraAd';
import AdSenseAd from '@/components/AdSenseAd';
import { AdFormat } from '@/lib/ads/adsterra';
import Modal from '@/components/Modal';
import { analytics } from '@/lib/analytics';

// Extracted layout components
import GameHeader from '@/components/game/GameHeader';
import AppleArea from '@/components/game/AppleArea';
import UpgradeSidebar from '@/components/game/UpgradeSidebar';
import AscensionSidebar from '@/components/game/AscensionSidebar';
import MobileNav from '@/components/game/MobileNav';
import GameFooter from '@/components/game/GameFooter';

// Extracted modal components
import SettingsModal from '@/components/game/SettingsModal';
import OfflineModal from '@/components/game/OfflineModal';
import SkillsModal from '@/components/game/SkillsModal';
import StatsModal from '@/components/game/StatsModal';

// Extracted hooks
import { useGameLoop } from '@/hooks/use-game-loop';
import { useGameKeyboard } from '@/hooks/use-game-keyboard';

export default function Game() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState(() => engine.getState());
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [showAscensionModal, setShowAscensionModal] = useState(false);
  const [showStatsPanelModal, setShowStatsPanelModal] = useState(false);
  const [showHelp, setShowHelp] = useState<{ title: string; content: string } | null>(null);
  const [offlineResult, setOfflineResult] = useState<{ apples: number; gold: number } | null>(
    null
  );
  const [clickEffects, setClickEffects] = useState<
    { id: number; x: number; y: number; value: number }[]
  >([]);
  const [isShaking, setIsShaking] = useState(false);
  const [particleOffsets] = useState(() =>
    Array.from({ length: 10 }).map(() => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      delay: Math.random() * 1.5,
    }))
  );
  const clickIdCounter = useRef(0);

  const t = useCallback(
    (key: string, params?: any) => engine.getLocalization().t(key, params),
    [engine]
  );

  // Mount effect
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStateUpdate = useCallback(() => {
    setState({ ...engine.getState() });
  }, [engine]);

  // Game loop and keyboard hooks
  useGameLoop(engine, handleStateUpdate);
  useGameKeyboard(engine, handleStateUpdate);

  // --- Event handlers ---
  const handleClick = (e: React.MouseEvent) => {
    engine.clickApple();
    const damage = engine.getClickDamage();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);
    const newEffect = {
      id: clickIdCounter.current++,
      x: e.clientX,
      y: e.clientY,
      value: Math.floor(damage),
    };
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(eff => eff.id !== newEffect.id));
    }, 1000);
  };

  const handleBuyUpgrade = (id: string) => {
    engine.buyUpgrade(id);
  };

  const handleBuyClickUpgrade = () => {
    engine.buyClickUpgrade();
    handleStateUpdate();
  };

  const handleAscend = () => {
    if (
      confirm(
        t('ascend_confirm') ||
          'Are you sure you want to ascend? You will lose all current progress but gain permanent bonuses.'
      )
    ) {
      engine.ascend();
      analytics.ascension(state.luckyWorms, state.highestStage);
    }
  };

  const handleActivateSkill = () => {
    engine.activateSkill('golden_harvest');
    analytics.skillActivation('golden_harvest');
    handleStateUpdate();
  };

  const handleExportSave = async () => {
    const saveStr = await engine.exportSave();
    navigator.clipboard
      .writeText(saveStr)
      .then(() => {
        alert('Save copied to clipboard!');
      })
      .catch(() => {
        prompt('Copy your save string:', saveStr);
      });
  };

  const handleImportSave = async (str: string) => {
    const success = await engine.importSave(str.trim());
    if (success) {
      handleStateUpdate();
      setShowSettings(false);
    }
  };

  const handleResetGame = () => {
    engine.resetGame();
    handleStateUpdate();
    setShowSettings(false);
  };

  if (!isMounted || !state || !engine)
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100">Loading...</div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 overflow-hidden select-none">
      <AdsterraAd format={AdFormat.POPUNDER} />
      <AdsterraAd format={AdFormat.SOCIAL_BAR} />
      <AdsterraAd format={AdFormat.SMARTLINK} />

      <GameHeader
        state={state}
        t={t}
        onShowStats={() => setShowStats(true)}
        onShowSkills={() => setShowSkills(true)}
        onShowSettings={() => setShowSettings(true)}
        onShowHelp={help => setShowHelp(help)}
      />

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left ad sidebar */}
        <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-r border-stone-200/50 dark:border-stone-700/50 gap-4 py-4">
          <AdSenseAd slot="vertical-left" format="auto" className="w-full flex-1" />
          <AdsterraAd format={AdFormat.DISPLAY_BANNER_160x300} className="w-full" />
        </div>

        <main className="flex-1 flex flex-col lg:flex-row relative overflow-y-auto">
          <UpgradeSidebar
            state={state}
            engine={engine}
            t={t}
            onBuyUpgrade={handleBuyUpgrade}
            onBuyClickUpgrade={handleBuyClickUpgrade}
          />

          <AppleArea
            state={state}
            engine={engine}
            t={t}
            isShaking={isShaking}
            particleOffsets={particleOffsets}
            onAppleClick={handleClick}
            onActivateSkill={handleActivateSkill}
          />

          <AscensionSidebar
            state={state}
            engine={engine}
            t={t}
            onAscend={handleAscend}
          />
        </main>

        {/* Right ad sidebar */}
        <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-l border-stone-200/50 dark:border-stone-700/50 gap-4 py-4">
          <AdSenseAd slot="vertical-right" format="auto" className="w-full flex-1" />
          <AdsterraAd format={AdFormat.DISPLAY_BANNER_160x300} className="w-full" />
        </div>
      </div>

      <MobileNav
        t={t}
        onShowUpgrades={() => setShowUpgradesModal(true)}
        onShowAscension={() => setShowAscensionModal(true)}
        onShowStats={() => setShowStatsPanelModal(true)}
      />

      <GameFooter t={t} />

      {/* Footer ad area */}
      <div className="w-full h-[90px] bg-stone-200/30 dark:bg-stone-800/30 flex items-center justify-center border-t border-stone-200/50 dark:border-stone-700/50">
        <AdSenseAd slot="horizontal-footer" format="auto" className="w-full h-full max-w-4xl" />
      </div>

      {/* Mobile ad density reduction — hide on small screens */}
      <div className="hidden md:block">
        <AdsterraAd format={AdFormat.NATIVE_BANNER} className="w-full max-w-4xl mx-auto my-4" />
        <AdsterraAd format={AdFormat.DISPLAY_BANNER_468x60} className="w-full max-w-4xl mx-auto my-2" />
      </div>

      {/* Help modal */}
      <Modal isOpen={!!showHelp} onClose={() => setShowHelp(null)} title={showHelp?.title || ''}>
        <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{showHelp?.content}</p>
      </Modal>

      {/* Skills modal */}
      <SkillsModal isOpen={showSkills} engine={engine} t={t} onClose={() => setShowSkills(false)} />

      {/* Stats modal */}
      <StatsModal isOpen={showStats} state={state} t={t} onClose={() => setShowStats(false)} />

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettings}
        state={state}
        engine={engine}
        t={t}
        onClose={() => setShowSettings(false)}
        onStateUpdate={handleStateUpdate}
        onImportSave={handleImportSave}
        onResetGame={handleResetGame}
        onExportSave={handleExportSave}
      />

      {/* Offline earnings modal */}
      <OfflineModal result={offlineResult} t={t} onDismiss={() => setOfflineResult(null)} />

      {/* Click effects overlay */}
      <AnimatePresence>
        {clickEffects.map(effect => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, y: effect.y - 20, x: effect.x }}
            animate={{ opacity: 0, y: effect.y - 100 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-[100] font-mono font-bold text-red-500 text-xl drop-shadow-md"
          >
            +{effect.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mobile modals */}
      <Modal isOpen={showUpgradesModal} onClose={() => setShowUpgradesModal(false)} title={t('upgrades')}>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
          <UpgradeSidebar
            state={state}
            engine={engine}
            t={t}
            onBuyUpgrade={handleBuyUpgrade}
            onBuyClickUpgrade={handleBuyClickUpgrade}
            className="flex flex-col gap-2"
          />
        </div>
      </Modal>

      <Modal isOpen={showAscensionModal} onClose={() => setShowAscensionModal(false)} title={t('ascension')}>
        <AscensionSidebar
          state={state}
          engine={engine}
          t={t}
          onAscend={handleAscend}
          className="flex flex-col gap-4"
        />
      </Modal>

      <Modal isOpen={showStatsPanelModal} onClose={() => setShowStatsPanelModal(false)} title={t('statistics')}>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Clicks:</span>{' '}
            <span className="font-mono font-bold">{state.totalClicks}</span>
          </div>
          <div className="flex justify-between">
            <span>Apples Eaten:</span>{' '}
            <span className="font-mono font-bold">{state.totalApplesEaten}</span>
          </div>
          <div className="flex justify-between">
            <span>Lucky Worms:</span>{' '}
            <span className="font-mono font-bold">{state.luckyWorms}</span>
          </div>
          <div className="flex justify-between">
            <span>Gold Bonus:</span>{' '}
            <span className="font-mono font-bold">+{state.luckyWorms * 5}%</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
