import { describe, expect, it } from 'vitest';
import {
  calculateAllGoalProgress,
  findNewlyCompletedGoals,
  GOAL_DEFINITIONS,
  getGoalCurrentValue,
  getGoalDefinition,
} from '@/lib/game/goals';
import type { GameState } from '@/lib/game/types';

function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    gold: 0,
    stage: 1,
    appleHP: 50,
    maxAppleHP: 50,
    clickDamage: 1,
    clickLevel: 0,
    totalClicks: 0,
    totalApplesEaten: 0,
    luckyWorms: 0,
    highestStage: 1,
    lastSaveTimestamp: Date.now(),
    worms: {
      small_worm: 0,
      hungry_worm: 0,
      fat_worm: 0,
      queen_worm: 0,
      acid_worm: 0,
      mutant_worm: 0,
      mecha_worm: 0,
      galactic_worm: 0,
      quantum_worm: 0,
      dimensional_worm: 0,
      infinite_worm: 0,
    },
    skills: {
      golden_harvest: {
        isActive: false,
        remainingDuration: 0,
        cooldownRemaining: 0,
      },
    },
    statistics: {
      totalClicks: 0,
      totalApplesEaten: 0,
      totalGoldEarned: 0,
      highestStage: 1,
      totalAscensions: 0,
      luckyWormsCollected: 0,
      goldenHarvestActivations: 0,
    },
    settings: {
      language: 'en',
      muted: false,
      volume: 0.5,
    },
    ...overrides,
  };
}

describe('GOAL_DEFINITIONS', () => {
  it('should have at least 10 goals defined', () => {
    expect(GOAL_DEFINITIONS.length).toBeGreaterThanOrEqual(10);
  });

  it('should have unique ids', () => {
    const ids = GOAL_DEFINITIONS.map((goal) => goal.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have valid types', () => {
    const validTypes = ['milestone', 'upgrade', 'ascension', 'collection', 'skill'];
    for (const goal of GOAL_DEFINITIONS) {
      expect(validTypes).toContain(goal.type);
    }
  });

  it('should have positive target values', () => {
    for (const goal of GOAL_DEFINITIONS) {
      expect(goal.targetValue).toBeGreaterThan(0);
    }
  });

  it('should have valid reward types', () => {
    const validRewardTypes = ['gold', 'luckyWorms'];
    for (const goal of GOAL_DEFINITIONS) {
      expect(validRewardTypes).toContain(goal.rewardType);
    }
  });

  it('should have positive reward amounts', () => {
    for (const goal of GOAL_DEFINITIONS) {
      expect(goal.rewardAmount).toBeGreaterThan(0);
    }
  });

  it('should have non-empty nameKey and descriptionKey', () => {
    for (const goal of GOAL_DEFINITIONS) {
      expect(goal.nameKey.length).toBeGreaterThan(0);
      expect(goal.descriptionKey.length).toBeGreaterThan(0);
    }
  });
});

describe('getGoalCurrentValue', () => {
  it('should return totalApplesEaten for apple milestone goals', () => {
    const state = createMockGameState({ totalApplesEaten: 42 });
    expect(getGoalCurrentValue('first_apple', state)).toBe(42);
    expect(getGoalCurrentValue('ten_apples', state)).toBe(42);
    expect(getGoalCurrentValue('hundred_apples', state)).toBe(42);
  });

  it('should return total upgrade count for first_upgrade goal', () => {
    const state = createMockGameState({
      worms: { small_worm: 3, hungry_worm: 2, fat_worm: 0 },
    });
    expect(getGoalCurrentValue('first_upgrade', state)).toBe(5);
  });

  it('should return highestStage for stage goals', () => {
    const state = createMockGameState({ highestStage: 30 });
    expect(getGoalCurrentValue('stage_ten', state)).toBe(30);
    expect(getGoalCurrentValue('stage_twenty_five', state)).toBe(30);
    expect(getGoalCurrentValue('stage_fifty', state)).toBe(30);
  });

  it('should return totalAscensions for first_ascension', () => {
    const state = createMockGameState({
      statistics: { ...createMockGameState().statistics, totalAscensions: 3 },
    });
    expect(getGoalCurrentValue('first_ascension', state)).toBe(3);
  });

  it('should return luckyWorms for ten_lucky_worms', () => {
    const state = createMockGameState({ luckyWorms: 7 });
    expect(getGoalCurrentValue('ten_lucky_worms', state)).toBe(7);
  });

  it('should return goldenHarvestActivations for golden_harvest_activation', () => {
    const state = createMockGameState({
      statistics: { ...createMockGameState().statistics, goldenHarvestActivations: 2 },
    });
    expect(getGoalCurrentValue('golden_harvest_activation', state)).toBe(2);
  });

  it('should return 0 for unknown goal id', () => {
    const state = createMockGameState();
    expect(getGoalCurrentValue('nonexistent_goal', state)).toBe(0);
  });
});

describe('getGoalDefinition', () => {
  it('should return definition for existing goal id', () => {
    const definition = getGoalDefinition('first_apple');
    expect(definition).toBeDefined();
    expect(definition!.id).toBe('first_apple');
  });

  it('should return undefined for unknown goal id', () => {
    expect(getGoalDefinition('nonexistent')).toBeUndefined();
  });
});

describe('calculateAllGoalProgress', () => {
  it('should return progress for all defined goals', () => {
    const state = createMockGameState({ totalApplesEaten: 5 });
    const progress = calculateAllGoalProgress(state, []);
    expect(progress.length).toBe(GOAL_DEFINITIONS.length);
  });

  it('should mark completed goals as completed', () => {
    const state = createMockGameState({ totalApplesEaten: 1 });
    const progress = calculateAllGoalProgress(state, ['first_apple']);
    const firstAppleProgress = progress.find((p) => p.goalId === 'first_apple');
    expect(firstAppleProgress!.isCompleted).toBe(true);
  });

  it('should not mark uncompleted goals as completed', () => {
    const state = createMockGameState({ totalApplesEaten: 0 });
    const progress = calculateAllGoalProgress(state, []);
    const firstAppleProgress = progress.find((p) => p.goalId === 'first_apple');
    expect(firstAppleProgress!.isCompleted).toBe(false);
  });

  it('should correctly report currentValue', () => {
    const state = createMockGameState({ totalApplesEaten: 25 });
    const progress = calculateAllGoalProgress(state, []);
    const tenApplesProgress = progress.find((p) => p.goalId === 'ten_apples');
    expect(tenApplesProgress!.currentValue).toBe(25);
  });
});

describe('findNewlyCompletedGoals', () => {
  it('should find goals that are completable but not yet completed', () => {
    const state = createMockGameState({ totalApplesEaten: 50 });
    const newlyCompleted = findNewlyCompletedGoals(state, ['first_apple']);
    const tenApples = newlyCompleted.find((g) => g.id === 'ten_apples');
    expect(tenApples).toBeDefined();
  });

  it('should not include already completed goals', () => {
    const state = createMockGameState({ totalApplesEaten: 50 });
    const newlyCompleted = findNewlyCompletedGoals(state, ['first_apple', 'ten_apples']);
    const firstApple = newlyCompleted.find((g) => g.id === 'first_apple');
    const tenApples = newlyCompleted.find((g) => g.id === 'ten_apples');
    expect(firstApple).toBeUndefined();
    expect(tenApples).toBeUndefined();
  });

  it('should not include goals that are not yet completable', () => {
    const state = createMockGameState({ totalApplesEaten: 3 });
    const newlyCompleted = findNewlyCompletedGoals(state, []);
    const tenApples = newlyCompleted.find((g) => g.id === 'ten_apples');
    const hundredApples = newlyCompleted.find((g) => g.id === 'hundred_apples');
    expect(tenApples).toBeUndefined();
    expect(hundredApples).toBeUndefined();
  });

  it('should return empty array when nothing new is completable', () => {
    const state = createMockGameState({ totalApplesEaten: 0 });
    const newlyCompleted = findNewlyCompletedGoals(state, []);
    expect(newlyCompleted).toHaveLength(0);
  });

  it('should find multiple newly completed goals', () => {
    const state = createMockGameState({
      totalApplesEaten: 100,
      highestStage: 10,
      statistics: { ...createMockGameState().statistics, totalAscensions: 1 },
    });
    const newlyCompleted = findNewlyCompletedGoals(state, []);
    const ids = newlyCompleted.map((g) => g.id);
    expect(ids).toContain('first_apple');
    expect(ids).toContain('ten_apples');
    expect(ids).toContain('hundred_apples');
    expect(ids).toContain('stage_ten');
    expect(ids).toContain('first_ascension');
  });
});
