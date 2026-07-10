/**
 * Pure goal definitions and progress calculation.
 * Goals are derived from GameState — no fragile parallel counters.
 */
import { GameState, GoalDefinition, GoalProgress } from './types';

/**
 * Complete catalog of game goals.
 * Each goal has a stable id used for persistence and analytics.
 */
export const GOAL_DEFINITIONS: GoalDefinition[] = [
  {
    id: 'first_apple',
    type: 'milestone',
    targetValue: 1,
    nameKey: 'goal_first_apple_name',
    descriptionKey: 'goal_first_apple_desc',
    rewardType: 'gold',
    rewardAmount: 10,
  },
  {
    id: 'first_upgrade',
    type: 'upgrade',
    targetValue: 1,
    nameKey: 'goal_first_upgrade_name',
    descriptionKey: 'goal_first_upgrade_desc',
    rewardType: 'gold',
    rewardAmount: 25,
  },
  {
    id: 'ten_apples',
    type: 'milestone',
    targetValue: 10,
    nameKey: 'goal_ten_apples_name',
    descriptionKey: 'goal_ten_apples_desc',
    rewardType: 'gold',
    rewardAmount: 50,
  },
  {
    id: 'hundred_apples',
    type: 'milestone',
    targetValue: 100,
    nameKey: 'goal_hundred_apples_name',
    descriptionKey: 'goal_hundred_apples_desc',
    rewardType: 'gold',
    rewardAmount: 200,
  },
  {
    id: 'stage_ten',
    type: 'milestone',
    targetValue: 10,
    nameKey: 'goal_stage_ten_name',
    descriptionKey: 'goal_stage_ten_desc',
    rewardType: 'gold',
    rewardAmount: 100,
  },
  {
    id: 'stage_twenty_five',
    type: 'milestone',
    targetValue: 25,
    nameKey: 'goal_stage_twenty_five_name',
    descriptionKey: 'goal_stage_twenty_five_desc',
    rewardType: 'gold',
    rewardAmount: 500,
  },
  {
    id: 'stage_fifty',
    type: 'milestone',
    targetValue: 50,
    nameKey: 'goal_stage_fifty_name',
    descriptionKey: 'goal_stage_fifty_desc',
    rewardType: 'luckyWorms',
    rewardAmount: 1,
  },
  {
    id: 'first_ascension',
    type: 'ascension',
    targetValue: 1,
    nameKey: 'goal_first_ascension_name',
    descriptionKey: 'goal_first_ascension_desc',
    rewardType: 'luckyWorms',
    rewardAmount: 1,
  },
  {
    id: 'ten_lucky_worms',
    type: 'collection',
    targetValue: 10,
    nameKey: 'goal_ten_lucky_worms_name',
    descriptionKey: 'goal_ten_lucky_worms_desc',
    rewardType: 'gold',
    rewardAmount: 1000,
  },
  {
    id: 'golden_harvest_activation',
    type: 'skill',
    targetValue: 1,
    nameKey: 'goal_golden_harvest_activation_name',
    descriptionKey: 'goal_golden_harvest_activation_desc',
    rewardType: 'gold',
    rewardAmount: 300,
  },
];

/** Lookup map for O(1) access by id */
const GOAL_BY_ID: ReadonlyMap<string, GoalDefinition> = new Map(
  GOAL_DEFINITIONS.map((definition) => [definition.id, definition])
);

/**
 * Extract the current numeric progress for a given goal from game state.
 * Returns 0 if the goal id is unknown.
 */
export function getGoalCurrentValue(goalId: string, state: GameState): number {
  switch (goalId) {
    case 'first_apple':
    case 'ten_apples':
    case 'hundred_apples':
      return state.totalApplesEaten;
    case 'first_upgrade':
      return getTotalUpgradeCount(state);
    case 'stage_ten':
    case 'stage_twenty_five':
    case 'stage_fifty':
      return state.highestStage;
    case 'first_ascension':
      return state.statistics.totalAscensions;
    case 'ten_lucky_worms':
      return state.luckyWorms;
    case 'golden_harvest_activation':
      return state.statistics.goldenHarvestActivations;
    default:
      return 0;
  }
}

/**
 * Calculate total number of worm upgrades owned (across all types).
 */
function getTotalUpgradeCount(state: GameState): number {
  let totalOwned = 0;
  for (const upgradeId of Object.keys(state.worms)) {
    totalOwned += state.worms[upgradeId];
  }
  return totalOwned;
}

/**
 * Get the definition for a specific goal id.
 * Returns undefined if the id is not found in the catalog.
 */
export function getGoalDefinition(goalId: string): GoalDefinition | undefined {
  return GOAL_BY_ID.get(goalId);
}

/**
 * Calculate the full progress array for all known goals.
 * Already-completed goals (from journey.completedGoals) are marked as such.
 */
export function calculateAllGoalProgress(
  state: GameState,
  completedGoalIds: ReadonlyArray<string>
): GoalProgress[] {
  const completedSet = new Set(completedGoalIds);

  return GOAL_DEFINITIONS.map((definition) => {
    const currentValue = getGoalCurrentValue(definition.id, state);
    const isCompleted = completedSet.has(definition.id);

    return {
      goalId: definition.id,
      currentValue,
      isCompleted,
    };
  });
}

/**
 * Find goals that are newly completable (current value >= target, not yet in completed set).
 * Returns an array of goal definitions that should be awarded.
 */
export function findNewlyCompletedGoals(
  state: GameState,
  completedGoalIds: ReadonlyArray<string>
): GoalDefinition[] {
  const completedSet = new Set(completedGoalIds);

  return GOAL_DEFINITIONS.filter((definition) => {
    if (completedSet.has(definition.id)) return false;
    const currentValue = getGoalCurrentValue(definition.id, state);
    return currentValue >= definition.targetValue;
  });
}
