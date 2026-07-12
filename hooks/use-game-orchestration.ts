'use client';

import { useState, useRef, useCallback } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { analytics } from '@/lib/analytics';

interface UseGameOrchestrationReturn {
  state: ReturnType<GameEngine['getState']>;
  isMounted: boolean;
  isShaking: boolean;
  canClaimDailyReward: boolean;
  clickEffects: ReadonlyArray<{ id: number; x: number; y: number; value: number }>;
  particleOffsets: ReadonlyArray<{ x: number; y: number; delay: number }>;
  // Modal visibility
  showSettings: boolean;
  showSkills: boolean;
  showStats: boolean;
  showUpgradesModal: boolean;
  showAscensionModal: boolean;
  showStatsPanelModal: boolean;
  showJourney: boolean;
  showOnboarding: boolean;
  showHelp: { title: string; content: string } | null;
  offlineResult: { apples: number; gold: number } | null;
  // Actions
  setIsMounted: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setShowSkills: (v: boolean) => void;
  setShowStats: (v: boolean) => void;
  setShowUpgradesModal: (v: boolean) => void;
  setShowAscensionModal: (v: boolean) => void;
  setShowStatsPanelModal: (v: boolean) => void;
  setShowJourney: (v: boolean) => void;
  setShowOnboarding: (v: boolean) => void;
  setShowHelp: (v: { title: string; content: string } | null) => void;
  setOfflineResult: (v: { apples: number; gold: number } | null) => void;
  handleStateUpdate: () => void;
  handleClick: (e: React.MouseEvent) => void;
  handleBuyUpgrade: (id: string) => void;
  handleBuyClickUpgrade: () => void;
  handleAscend: () => void;
  handleActivateSkill: () => void;
  handleExportSave: () => void;
  handleImportSave: (str: string) => void;
  handleResetGame: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function useGameOrchestration(
  engine: GameEngine
): UseGameOrchestrationReturn {
  const [state, setState] = useState(() => engine.getState());
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [showAscensionModal, setShowAscensionModal] = useState(false);
  const [showStatsPanelModal, setShowStatsPanelModal] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState<{ title: string; content: string } | null>(null);
  const [offlineResult, setOfflineResult] = useState<{ apples: number; gold: number } | null>(null);
  const [clickEffects, setClickEffects] = useState<
    { id: number; x: number; y: number; value: number }[]
  >([]);
  const [isShaking, setIsShaking] = useState(false);
  const [canClaimDailyReward, setCanClaimDailyReward] = useState(false);
  const [particleOffsets] = useState(() =>
    Array.from({ length: 10 }).map(() => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      delay: Math.random() * 1.5,
    }))
  );
  const clickIdCounter = useRef(0);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => engine.getLocalization().t(key, params),
    [engine]
  );

  const handleStateUpdate = useCallback(() => {
    setState({ ...engine.getState() });
    setCanClaimDailyReward(engine.canClaimDailyReward());
  }, [engine]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [engine]
  );

  const handleBuyUpgrade = useCallback(
    (id: string) => {
      engine.buyUpgrade(id);
    },
    [engine]
  );

  const handleBuyClickUpgrade = useCallback(() => {
    engine.buyClickUpgrade();
    handleStateUpdate();
  }, [engine, handleStateUpdate]);

  const handleAscend = useCallback(() => {
    const currentState = engine.getState();
    if (
      confirm(
        t('ascend_confirm') ??
          'Are you sure you want to ascend? You will lose all current progress but gain permanent bonuses.'
      )
    ) {
      engine.ascend();
      analytics.ascension(currentState.luckyWorms, currentState.highestStage);
    }
  }, [engine, t]);

  const handleActivateSkill = useCallback(() => {
    engine.activateSkill('golden_harvest');
    analytics.skillActivation('golden_harvest');
    handleStateUpdate();
  }, [engine, handleStateUpdate]);

  const handleExportSave = useCallback(async () => {
    const saveStr = await engine.exportSave();
    navigator.clipboard
      .writeText(saveStr)
      .then(() => {
        alert('Save copied to clipboard!');
      })
      .catch(() => {
        prompt('Copy your save string:', saveStr);
      });
  }, [engine]);

  const handleImportSave = useCallback(
    async (str: string) => {
      const success = await engine.importSave(str.trim());
      if (success) {
        handleStateUpdate();
        setShowSettings(false);
      }
    },
    [engine, handleStateUpdate]
  );

  const handleResetGame = useCallback(() => {
    engine.resetGame();
    handleStateUpdate();
    setShowSettings(false);
  }, [engine, handleStateUpdate]);

  return {
    state,
    isMounted,
    isShaking,
    canClaimDailyReward,
    clickEffects,
    particleOffsets,
    showSettings,
    showSkills,
    showStats,
    showUpgradesModal,
    showAscensionModal,
    showStatsPanelModal,
    showJourney,
    showOnboarding,
    showHelp,
    offlineResult,
    setIsMounted,
    setShowSettings,
    setShowSkills,
    setShowStats,
    setShowUpgradesModal,
    setShowAscensionModal,
    setShowStatsPanelModal,
    setShowJourney,
    setShowOnboarding,
    setShowHelp,
    setOfflineResult,
    handleStateUpdate,
    handleClick,
    handleBuyUpgrade,
    handleBuyClickUpgrade,
    handleAscend,
    handleActivateSkill,
    handleExportSave,
    handleImportSave,
    handleResetGame,
    t,
  };
}
