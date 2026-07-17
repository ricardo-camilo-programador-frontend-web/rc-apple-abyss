/**
 * Pure daily reward rules.
 * Calculates eligibility, streak progression, and reward amounts.
 * No side effects — all state transitions are returned as values.
 */
import { DAILY_REWARD_CONFIG } from './constants';
import type { DailyRewardState } from './types';

/**
 * Get today's date as a YYYY-MM-DD string in local timezone.
 */
export function getTodayDateString(now: number = Date.now()): string {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get tomorrow's date as a YYYY-MM-DD string in local timezone.
 */
export function getTomorrowDateString(now: number = Date.now()): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the start of a given date string (YYYY-MM-DD) as a Unix timestamp in ms.
 * Uses local timezone.
 */
export function getDateStartTimestamp(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return date.getTime();
}

/**
 * Check if a timestamp represents a valid, reasonable date.
 * Rejects negative timestamps, far-future dates (beyond 1 year), and NaN.
 */
export function isValidTimestamp(timestamp: number): boolean {
  if (!Number.isFinite(timestamp) || timestamp < 0) return false;
  const maxAllowed = Date.now() + 365 * 24 * 60 * 60 * 1000;
  return timestamp <= maxAllowed;
}

/**
 * Check if a daily reward can be claimed right now.
 * A claim is allowed if:
 * - No claim has been made today, OR
 * - The nextClaimAvailableAt timestamp has passed
 */
export function canClaimDailyReward(
  dailyRewardState: DailyRewardState,
  now: number = Date.now(),
): boolean {
  const todayString = getTodayDateString(now);

  // Already claimed today
  if (dailyRewardState.lastClaimDate === todayString) {
    return false;
  }

  // If nextClaimAvailableAt is set, check it
  if (dailyRewardState.nextClaimAvailableAt > 0 && now < dailyRewardState.nextClaimAvailableAt) {
    return false;
  }

  return true;
}

/**
 * Calculate the new daily reward state after a successful claim.
 * Handles streak progression:
 * - If last claim was yesterday: increment streak
 * - If last claim was today: should not happen (guarded by canClaimDailyReward)
 * - If last claim was older: reset streak to 1
 * - Streak is capped at MAX_STREAK
 *
 * Returns the new DailyRewardState and the streak day (1-based).
 */
export function calculateClaimResult(
  currentState: DailyRewardState,
  now: number = Date.now(),
): { newState: DailyRewardState; streakDay: number } {
  const todayString = getTodayDateString(now);
  const tomorrowString = getTomorrowDateString(now);

  // Determine if the last claim was yesterday (consecutive)
  let newStreak: number;
  if (currentState.lastClaimDate === null || currentState.lastClaimDate === '') {
    // First ever claim
    newStreak = 1;
  } else if (currentState.lastClaimDate === getYesterdayDateString(now)) {
    // Consecutive day — increment, cap at max
    newStreak = Math.min(currentState.streak + 1, DAILY_REWARD_CONFIG.MAX_STREAK);
  } else {
    // Gap in days — reset to 1
    newStreak = 1;
  }

  // Next claim available at start of next day (local midnight)
  const nextClaimAt = getDateStartTimestamp(tomorrowString);

  const newState: DailyRewardState = {
    lastClaimDate: todayString,
    streak: newStreak,
    nextClaimAvailableAt: nextClaimAt,
  };

  return { newState, streakDay: newStreak };
}

/**
 * Get yesterday's date as a YYYY-MM-DD string in local timezone.
 */
function getYesterdayDateString(now: number = Date.now()): string {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate the gold reward for a given streak day and stage.
 * Formula: MIN_GOLD_REWARD + GOLD_PER_STREAK_DAY × streakDay + STAGE_MULTIPLIER × max(stage - MIN_STAGE_FOR_MULTIPLIER, 0)
 */
export function calculateDailyGoldReward(streakDay: number, currentStage: number): number {
  const stageBonus =
    Math.max(currentStage - DAILY_REWARD_CONFIG.MIN_STAGE_FOR_MULTIPLIER, 0) *
    DAILY_REWARD_CONFIG.STAGE_MULTIPLIER;

  return (
    DAILY_REWARD_CONFIG.MIN_GOLD_REWARD +
    DAILY_REWARD_CONFIG.GOLD_PER_STREAK_DAY * streakDay +
    stageBonus
  );
}

/**
 * Get the number of milliseconds until the next claim is available.
 * Returns 0 if a claim is available right now.
 */
export function getTimeUntilNextClaim(
  dailyRewardState: DailyRewardState,
  now: number = Date.now(),
): number {
  if (canClaimDailyReward(dailyRewardState, now)) {
    return 0;
  }
  return Math.max(0, dailyRewardState.nextClaimAvailableAt - now);
}

/**
 * Sanitize a loaded DailyRewardState, handling corrupted or invalid data.
 * Returns a safe default if the data is invalid.
 */
export function sanitizeDailyRewardState(
  loadedState: Partial<DailyRewardState> | undefined,
): DailyRewardState {
  if (!loadedState) {
    return {
      lastClaimDate: null,
      streak: 0,
      nextClaimAvailableAt: 0,
    };
  }

  return {
    lastClaimDate: typeof loadedState.lastClaimDate === 'string' ? loadedState.lastClaimDate : null,
    streak:
      typeof loadedState.streak === 'number' && Number.isFinite(loadedState.streak)
        ? Math.max(0, Math.min(loadedState.streak, DAILY_REWARD_CONFIG.MAX_STREAK))
        : 0,
    nextClaimAvailableAt:
      typeof loadedState.nextClaimAvailableAt === 'number' &&
      isValidTimestamp(loadedState.nextClaimAvailableAt)
        ? loadedState.nextClaimAvailableAt
        : 0,
  };
}
