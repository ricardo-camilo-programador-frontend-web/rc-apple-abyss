'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRewardedCooldown } from '@/hooks/use-ad-guard';
import type { GameEngine } from '@/lib/game/engine';

/**
 * Encapsulates all rewarded ad logic:
 * - 2x Gold Boost (10% instant bonus, 30s visual, 2min CD)
 * - Instant Harvest (5min DPS as gold, 5min CD)
 * - Reset Golden Harvest cooldown (3min CD)
 *
 * Intended to be called from Game.tsx and passed down via props.
 */
export function useRewardedAds(engine: GameEngine, onStateUpdate: () => void) {
  const [showRewardedAds, setShowRewardedAds] = useState(false);
  const [goldBoostRemaining, setGoldBoostRemaining] = useState(0);
  const { startCooldown, getCooldown } = useRewardedCooldown();

  // Gold boost tick-down
  useEffect(() => {
    if (goldBoostRemaining <= 0) return;
    const timer = setInterval(() => {
      setGoldBoostRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [goldBoostRemaining]);

  const handleGoldBoostReward = useCallback(() => {
    setGoldBoostRemaining(30);
    startCooldown('gold_boost', 120);
    const currentGold = engine.getState().gold;
    const bonusGold = Math.floor(currentGold * 0.1);
    engine.getState().gold += bonusGold;
    onStateUpdate();
  }, [engine, startCooldown, onStateUpdate]);

  const handleInstantHarvestReward = useCallback(() => {
    const dps = engine.getTotalDPS();
    const goldMul = engine.getGoldMultiplier();
    const instantGold = Math.floor(dps * 300 * goldMul);
    engine.getState().gold += instantGold;
    onStateUpdate();
    startCooldown('instant_harvest', 300);
    setShowRewardedAds(false);
  }, [engine, startCooldown, onStateUpdate]);

  const handleResetCooldownReward = useCallback(() => {
    const skill = engine.getState().skills.golden_harvest;
    if (skill) {
      skill.cooldownRemaining = 0;
    }
    onStateUpdate();
    startCooldown('reset_cooldown', 180);
    setShowRewardedAds(false);
  }, [engine, startCooldown, onStateUpdate]);

  return {
    showRewardedAds,
    setShowRewardedAds,
    goldBoostRemaining,
    getCooldown,
    handleGoldBoostReward,
    handleInstantHarvestReward,
    handleResetCooldownReward,
  };
}
