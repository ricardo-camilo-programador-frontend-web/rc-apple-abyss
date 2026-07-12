import { describe, expect, it } from 'vitest';
import { DAILY_REWARD_CONFIG } from '@/lib/game/constants';
import {
  calculateClaimResult,
  calculateDailyGoldReward,
  canClaimDailyReward,
  getDateStartTimestamp,
  getTimeUntilNextClaim,
  getTodayDateString,
  getTomorrowDateString,
  isValidTimestamp,
  sanitizeDailyRewardState,
} from '@/lib/game/daily-reward';
import type { DailyRewardState } from '@/lib/game/types';

function createMockDailyRewardState(overrides: Partial<DailyRewardState> = {}): DailyRewardState {
  return {
    lastClaimDate: null,
    streak: 0,
    nextClaimAvailableAt: 0,
    ...overrides,
  };
}

describe('getTodayDateString', () => {
  it('should return a string in YYYY-MM-DD format', () => {
    const result = getTodayDateString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should use the provided timestamp', () => {
    // 2025-06-15T12:00:00Z
    const fixedTimestamp = new Date(2025, 5, 15, 12, 0, 0).getTime();
    const result = getTodayDateString(fixedTimestamp);
    expect(result).toBe('2025-06-15');
  });
});

describe('getTomorrowDateString', () => {
  it('should return the next day in YYYY-MM-DD format', () => {
    const fixedTimestamp = new Date(2025, 5, 15, 23, 59, 59).getTime();
    const result = getTomorrowDateString(fixedTimestamp);
    expect(result).toBe('2025-06-16');
  });

  it('should handle month boundaries', () => {
    const fixedTimestamp = new Date(2025, 0, 31, 12, 0, 0).getTime();
    const result = getTomorrowDateString(fixedTimestamp);
    expect(result).toBe('2025-02-01');
  });
});

describe('getDateStartTimestamp', () => {
  it('should return midnight of the given date', () => {
    const timestamp = getDateStartTimestamp('2025-06-15');
    const date = new Date(timestamp);
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(5); // June (0-indexed)
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });
});

describe('isValidTimestamp', () => {
  it('should return true for current timestamp', () => {
    expect(isValidTimestamp(Date.now())).toBe(true);
  });

  it('should return true for a recent past timestamp', () => {
    expect(isValidTimestamp(Date.now() - 86400000)).toBe(true);
  });

  it('should return false for negative timestamps', () => {
    expect(isValidTimestamp(-1)).toBe(false);
    expect(isValidTimestamp(-1000)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(isValidTimestamp(NaN)).toBe(false);
  });

  it('should return false for Infinity', () => {
    expect(isValidTimestamp(Infinity)).toBe(false);
  });

  it('should return false for timestamps beyond 1 year in the future', () => {
    const farFuture = Date.now() + 400 * 365 * 24 * 60 * 60 * 1000;
    expect(isValidTimestamp(farFuture)).toBe(false);
  });
});

describe('canClaimDailyReward', () => {
  it('should allow claim when no claim has been made', () => {
    const state = createMockDailyRewardState({ lastClaimDate: null });
    expect(canClaimDailyReward(state)).toBe(true);
  });

  it('should deny claim when already claimed today', () => {
    const today = getTodayDateString();
    const state = createMockDailyRewardState({
      lastClaimDate: today,
      nextClaimAvailableAt: getDateStartTimestamp(getTomorrowDateString()),
    });
    expect(canClaimDailyReward(state)).toBe(false);
  });

  it('should allow claim when last claim was yesterday', () => {
    const yesterdayTimestamp = Date.now() - 86400000;
    const yesterday = getTodayDateString(yesterdayTimestamp);
    const state = createMockDailyRewardState({
      lastClaimDate: yesterday,
      nextClaimAvailableAt: 0,
    });
    expect(canClaimDailyReward(state)).toBe(true);
  });

  it('should deny claim when nextClaimAvailableAt is in the future', () => {
    const futureTimestamp = Date.now() + 3600000; // 1 hour from now
    const state = createMockDailyRewardState({
      lastClaimDate: '2025-01-01',
      nextClaimAvailableAt: futureTimestamp,
    });
    expect(canClaimDailyReward(state, Date.now())).toBe(false);
  });

  it('should allow claim when nextClaimAvailableAt has passed', () => {
    const pastTimestamp = Date.now() - 3600000; // 1 hour ago
    const state = createMockDailyRewardState({
      lastClaimDate: '2025-01-01',
      nextClaimAvailableAt: pastTimestamp,
    });
    expect(canClaimDailyReward(state, Date.now())).toBe(true);
  });
});

describe('calculateClaimResult', () => {
  it('should set streak to 1 for first ever claim', () => {
    const state = createMockDailyRewardState({ lastClaimDate: null, streak: 0 });
    const result = calculateClaimResult(state);
    expect(result.streakDay).toBe(1);
    expect(result.newState.lastClaimDate).toBe(getTodayDateString());
  });

  it('should increment streak for consecutive claims', () => {
    const yesterday = getTodayDateString(Date.now() - 86400000);
    const state = createMockDailyRewardState({ lastClaimDate: yesterday, streak: 3 });
    const result = calculateClaimResult(state);
    expect(result.streakDay).toBe(4);
  });

  it('should reset streak to 1 after a gap', () => {
    const twoDaysAgo = getTodayDateString(Date.now() - 2 * 86400000);
    const state = createMockDailyRewardState({ lastClaimDate: twoDaysAgo, streak: 5 });
    const result = calculateClaimResult(state);
    expect(result.streakDay).toBe(1);
  });

  it('should cap streak at MAX_STREAK', () => {
    const yesterday = getTodayDateString(Date.now() - 86400000);
    const state = createMockDailyRewardState({
      lastClaimDate: yesterday,
      streak: DAILY_REWARD_CONFIG.MAX_STREAK,
    });
    const result = calculateClaimResult(state);
    expect(result.streakDay).toBe(DAILY_REWARD_CONFIG.MAX_STREAK);
  });

  it('should set nextClaimAvailableAt to tomorrow start', () => {
    const state = createMockDailyRewardState({ lastClaimDate: null });
    const result = calculateClaimResult(state);
    const expectedNext = getDateStartTimestamp(getTomorrowDateString());
    expect(result.newState.nextClaimAvailableAt).toBe(expectedNext);
  });

  it('should set lastClaimDate to today', () => {
    const state = createMockDailyRewardState({ lastClaimDate: null });
    const result = calculateClaimResult(state);
    expect(result.newState.lastClaimDate).toBe(getTodayDateString());
  });
});

describe('calculateDailyGoldReward', () => {
  it('should return minimum reward for day 1 at stage 1', () => {
    const reward = calculateDailyGoldReward(1, 1);
    expect(reward).toBe(
      DAILY_REWARD_CONFIG.MIN_GOLD_REWARD + DAILY_REWARD_CONFIG.GOLD_PER_STREAK_DAY * 1,
    );
  });

  it('should increase reward with higher streak day', () => {
    const rewardDay1 = calculateDailyGoldReward(1, 1);
    const rewardDay3 = calculateDailyGoldReward(3, 1);
    expect(rewardDay3).toBeGreaterThan(rewardDay1);
  });

  it('should increase reward with higher stage', () => {
    const rewardStage1 = calculateDailyGoldReward(1, 1);
    const rewardStage10 = calculateDailyGoldReward(1, 10);
    expect(rewardStage10).toBeGreaterThan(rewardStage1);
  });

  it('should not give negative stage bonus for low stages', () => {
    const reward = calculateDailyGoldReward(1, 1);
    expect(reward).toBeGreaterThanOrEqual(DAILY_REWARD_CONFIG.MIN_GOLD_REWARD);
  });

  it('should scale correctly at max streak with high stage', () => {
    const reward = calculateDailyGoldReward(DAILY_REWARD_CONFIG.MAX_STREAK, 100);
    const stageBonus =
      Math.max(100 - DAILY_REWARD_CONFIG.MIN_STAGE_FOR_MULTIPLIER, 0) *
      DAILY_REWARD_CONFIG.STAGE_MULTIPLIER;
    expect(reward).toBe(
      DAILY_REWARD_CONFIG.MIN_GOLD_REWARD +
        DAILY_REWARD_CONFIG.GOLD_PER_STREAK_DAY * DAILY_REWARD_CONFIG.MAX_STREAK +
        stageBonus,
    );
  });
});

describe('getTimeUntilNextClaim', () => {
  it('should return 0 when claim is available', () => {
    const state = createMockDailyRewardState({ lastClaimDate: null });
    expect(getTimeUntilNextClaim(state)).toBe(0);
  });

  it('should return positive number when claim is not available', () => {
    const futureTimestamp = Date.now() + 3600000;
    const state = createMockDailyRewardState({
      lastClaimDate: '2025-01-01',
      nextClaimAvailableAt: futureTimestamp,
    });
    const timeUntil = getTimeUntilNextClaim(state, Date.now());
    expect(timeUntil).toBeGreaterThan(0);
    expect(timeUntil).toBeLessThanOrEqual(3600000);
  });

  it('should return 0 when nextClaimAvailableAt is in the past', () => {
    const pastTimestamp = Date.now() - 1000;
    const state = createMockDailyRewardState({
      lastClaimDate: '2025-01-01',
      nextClaimAvailableAt: pastTimestamp,
    });
    expect(getTimeUntilNextClaim(state, Date.now())).toBe(0);
  });
});

describe('sanitizeDailyRewardState', () => {
  it('should return defaults for undefined state', () => {
    const result = sanitizeDailyRewardState(undefined);
    expect(result.lastClaimDate).toBeNull();
    expect(result.streak).toBe(0);
    expect(result.nextClaimAvailableAt).toBe(0);
  });

  it('should preserve valid state', () => {
    const validState: DailyRewardState = {
      lastClaimDate: '2025-06-15',
      streak: 3,
      nextClaimAvailableAt: Date.now() + 86400000,
    };
    const result = sanitizeDailyRewardState(validState);
    expect(result.lastClaimDate).toBe('2025-06-15');
    expect(result.streak).toBe(3);
  });

  it('should reset invalid streak to 0', () => {
    const result = sanitizeDailyRewardState({ streak: -5 });
    expect(result.streak).toBe(0);
  });

  it('should reset NaN streak to 0', () => {
    const result = sanitizeDailyRewardState({ streak: NaN });
    expect(result.streak).toBe(0);
  });

  it('should cap streak at MAX_STREAK', () => {
    const result = sanitizeDailyRewardState({ streak: 999 });
    expect(result.streak).toBe(DAILY_REWARD_CONFIG.MAX_STREAK);
  });

  it('should reject invalid lastClaimDate type', () => {
    const result = sanitizeDailyRewardState({ lastClaimDate: 12345 as unknown as string });
    expect(result.lastClaimDate).toBeNull();
  });

  it('should reject invalid nextClaimAvailableAt', () => {
    const result = sanitizeDailyRewardState({ nextClaimAvailableAt: -1 });
    expect(result.nextClaimAvailableAt).toBe(0);
  });

  it('should reject far-future nextClaimAvailableAt', () => {
    const farFuture = Date.now() + 2 * 365 * 24 * 60 * 60 * 1000;
    const result = sanitizeDailyRewardState({ nextClaimAvailableAt: farFuture });
    expect(result.nextClaimAvailableAt).toBe(0);
  });
});
