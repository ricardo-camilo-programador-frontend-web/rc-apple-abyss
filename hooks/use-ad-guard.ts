'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Ad Guard Hook — controls ad visibility with industry-standard practices.
 *
 * Features:
 * 1. Grace period: No ads in first GRACE_PERIOD_SECONDS of a session.
 *    This follows Mind Studios' pattern: "first steps devoid of ads, increasing
 *    retention as new users immerse smoothly without interruptions."
 * 2. Remove ads toggle: User can disable ads entirely (placeholder for future IAP).
 * 3. Rewarded ad cooldown tracking: Prevents spamming rewarded ads.
 */

const GRACE_PERIOD_SECONDS = 30;
const STORAGE_KEY_REMOVED = 'apple_abyss_ads_removed';
const STORAGE_KEY_SESSION_START = 'apple_abyss_session_start';

function getSessionStart(): number {
  if (typeof window === 'undefined') return Date.now();
  const stored = sessionStorage.getItem(STORAGE_KEY_SESSION_START);
  if (stored) return parseInt(stored, 10);
  const now = Date.now();
  sessionStorage.setItem(STORAGE_KEY_SESSION_START, String(now));
  return now;
}

function getAdsRemoved(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_REMOVED) === 'true';
}

export interface AdGuardState {
  /** True when ads should be visible (past grace period AND not removed) */
  adsVisible: boolean;
  /** Seconds remaining in grace period (0 if expired) */
  gracePeriodRemaining: number;
  /** True if user has toggled "Remove ads" */
  adsRemoved: boolean;
  /** Toggle ads removed state */
  toggleAdsRemoved: () => void;
  /** Seconds since session start */
  sessionAge: number;
}

export function useAdGuard(): AdGuardState {
  const [sessionStart] = useState(getSessionStart);
  const [adsRemoved, setAdsRemoved] = useState(getAdsRemoved);
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Only tick during grace period for efficiency
    const sessionAge = (Date.now() - sessionStart) / 1000;
    if (sessionAge >= GRACE_PERIOD_SECONDS) return;

    tickRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [sessionStart]);

  // Sync adsRemoved to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_REMOVED, String(adsRemoved));
  }, [adsRemoved]);

  const sessionAge = (now - sessionStart) / 1000;
  const gracePeriodRemaining = Math.max(0, GRACE_PERIOD_SECONDS - sessionAge);
  const pastGracePeriod = sessionAge >= GRACE_PERIOD_SECONDS;
  const adsVisible = pastGracePeriod && !adsRemoved;

  const toggleAdsRemoved = useCallback(() => {
    setAdsRemoved(prev => !prev);
  }, []);

  return {
    adsVisible,
    gracePeriodRemaining,
    adsRemoved,
    toggleAdsRemoved,
    sessionAge,
  };
}

/**
 * Rewarded ad cooldown tracker.
 * Tracks per-reward-type cooldowns in component state.
 */
export function useRewardedCooldown() {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldowns(prev => {
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] > 0) {
            next[key] = Math.max(0, next[key] - 1);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCooldown = useCallback((key: string, seconds: number) => {
    setCooldowns(prev => ({ ...prev, [key]: seconds }));
  }, []);

  const getCooldown = useCallback((key: string): number => {
    return cooldowns[key] || 0;
  }, [cooldowns]);

  return { startCooldown, getCooldown };
}
