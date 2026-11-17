'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { type RewardKey, secondsUntil } from '@/lib/ads/rewarded-persistence';
import {
  type GrantReward,
  type RewardedSnapshot,
  type RewardStatus,
  rewardedStore,
} from '@/lib/ads/rewarded-store';
import { REWARDED_CONFIG } from '@/lib/game/constants';
import type { GameEngine } from '@/lib/game/engine';

const SERVER_SNAPSHOT: RewardedSnapshot = {
  statuses: { gold_boost: 'idle', instant_harvest: 'idle', reset_cooldown: 'idle' },
  retryUntil: { gold_boost: 0, instant_harvest: 0, reset_cooldown: 0 },
  persisted: {
    version: 1,
    cooldownUntil: { gold_boost: 0, instant_harvest: 0, reset_cooldown: 0 },
    goldBoostUntil: 0,
  },
};

const getServerSnapshot = () => SERVER_SNAPSHOT;

function useRewardedSnapshot(): RewardedSnapshot {
  return useSyncExternalStore(
    rewardedStore.subscribe,
    rewardedStore.getSnapshot,
    getServerSnapshot,
  );
}

/** Relógio de 1 s para os contadores de cooldown. */
function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

/**
 * Free Rewards com anúncio real do H5 Games Ads (`lib/ads/h5-games.ts`).
 *
 * - 2x Gold Boost: ×2 no gold por dano durante `REWARDED_CONFIG.goldBoostDurationSeconds` (60 s).
 * - Instant Harvest: `REWARDED_CONFIG.instantHarvestSeconds` (5 min) de DPS em gold.
 * - Reset Skill Cooldown: zera o cooldown do Golden Harvest.
 *
 * Os `handle*` só pedem o anúncio. A recompensa sai em `grant`, chamada pelo
 * store apenas no `adViewed`. Cooldowns e o fim do boost ficam no localStorage.
 */
export function useRewardedAds(engine: GameEngine, onStateUpdate: () => void) {
  const [showRewardedAds, setShowRewardedAdsState] = useState(false);
  const snapshot = useRewardedSnapshot();
  const now = useNow();

  // Restaura o boost salvo (reload) e mantém o motor alinhado ao store.
  useEffect(() => {
    engine.setGoldBoostUntil(snapshot.persisted.goldBoostUntil);
  }, [engine, snapshot.persisted.goldBoostUntil]);

  const grant = useCallback<GrantReward>(
    (key, at) => {
      if (key === 'gold_boost') {
        rewardedStore.setGoldBoostUntil(engine.activateGoldBoost(at));
      } else if (key === 'instant_harvest') {
        const gold = engine
          .getTotalDPS()
          .mul(REWARDED_CONFIG.instantHarvestSeconds)
          .mul(engine.getGoldMultiplier())
          .floor();
        engine.addGold(gold);
      } else {
        const skill = engine.getState().skills.golden_harvest;
        if (skill) skill.cooldownRemaining = 0;
      }
      onStateUpdate();
    },
    [engine, onStateUpdate],
  );

  const setShowRewardedAds = useCallback((open: boolean) => {
    if (!open) rewardedStore.reset();
    setShowRewardedAdsState(open);
  }, []);

  const getCooldown = useCallback(
    (key: string): number =>
      secondsUntil(snapshot.persisted.cooldownUntil[key as RewardKey] ?? 0, now),
    [snapshot.persisted.cooldownUntil, now],
  );

  const handleGoldBoostReward = useCallback(
    () => rewardedStore.requestAd('gold_boost', grant),
    [grant],
  );
  const handleInstantHarvestReward = useCallback(
    () => rewardedStore.requestAd('instant_harvest', grant),
    [grant],
  );
  const handleResetCooldownReward = useCallback(
    () => rewardedStore.requestAd('reset_cooldown', grant),
    [grant],
  );

  return {
    showRewardedAds,
    setShowRewardedAds,
    goldBoostRemaining: secondsUntil(snapshot.persisted.goldBoostUntil, now),
    getCooldown,
    handleGoldBoostReward,
    handleInstantHarvestReward,
    handleResetCooldownReward,
  };
}

export interface RewardAdState {
  status: RewardStatus;
  /** Segundos até poder pedir outro anúncio depois de "sem anúncio". */
  retryIn: number;
}

/** Status de cada recompensa e o clique "Watch ad", para o modal. */
export function useRewardedAdStatus() {
  const snapshot = useRewardedSnapshot();
  const now = useNow();
  const get = useCallback(
    (key: RewardKey): RewardAdState => {
      const retryIn = secondsUntil(snapshot.retryUntil[key], now);
      const raw = snapshot.statuses[key];
      // Passada a espera, "sem anúncio" volta a permitir nova tentativa.
      const status = raw === 'unavailable' && retryIn === 0 ? 'idle' : raw;
      return { status, retryIn };
    },
    [snapshot, now],
  );
  const watch = useCallback((key: RewardKey) => rewardedStore.watchAd(key), []);
  return { get, watch };
}
