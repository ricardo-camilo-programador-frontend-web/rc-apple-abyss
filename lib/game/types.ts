import type { NumberNotation } from './format';
import type { Decimal } from './num';

export type Language =
  | 'en'
  | 'zh'
  | 'hi'
  | 'es'
  | 'fr'
  | 'ar'
  | 'bn'
  | 'pt'
  | 'ru'
  | 'ur'
  | 'id'
  | 'de'
  | 'ja'
  | 'sw'
  | 'mr'
  | 'te'
  | 'tr'
  | 'ta'
  | 'vi'
  | 'ko';

export interface WormUpgrade {
  id: string;
  nameKey: string;
  baseCost: number;
  baseDPS: number;
  costGrowth: number;
}

export interface SkillState {
  isActive: boolean;
  remainingDuration: number;
  cooldownRemaining: number;
}

export interface LuckyWormsConfig {
  goldBonusPerWorm: number;
  damageBonusPerWorm: number;
}

export interface StatisticsData {
  totalClicks: number;
  totalApplesEaten: number;
  totalGoldEarned: Decimal;
  highestStage: number;
  totalAscensions: number;
  luckyWormsCollected: number;
  goldenHarvestActivations: number;
}

export interface HelpContent {
  titleKey: string;
  descriptionKey: string;
  formula?: string;
}

export type HelpTopicId =
  | 'lucky_worms'
  | 'golden_harvest'
  | 'ascension'
  | 'click_damage'
  | 'idle_damage'
  | 'worm_upgrades';

export interface GameState {
  /** Versão do formato do save; saves sem o campo são v1. */
  saveVersion: number;
  gold: Decimal;
  stage: number;
  appleHP: Decimal;
  maxAppleHP: Decimal;
  clickDamage: number;
  clickLevel: number;
  totalClicks: number;
  totalApplesEaten: number;
  luckyWorms: number;
  /** Mergulhos no Abismo (prestígio de 1,79e308): ×2 de dano e ouro por nível */
  abyssDepth: number;
  highestStage: number;
  lastSaveTimestamp: number;
  lastOfflineResult?: { apples: number; gold: Decimal };
  worms: Record<string, number>;
  skills: Record<string, SkillState>;
  statistics: StatisticsData;
  settings: {
    language: Language;
    muted: boolean;
    volume: number;
    /** Notação dos números grandes (padrão: mixed) */
    notation: NumberNotation;
  };
  /** Journey state: goals, onboarding, daily reward — additive migration */
  journey?: JourneyState;
}

export interface LocalizationData {
  [key: string]: Partial<Record<Language, string>> & { en: string };
}

/* ─── Journey: Goals & Daily Reward ─── */

export type GoalType = 'milestone' | 'upgrade' | 'ascension' | 'collection' | 'skill';

export interface GoalDefinition {
  /** Stable identifier used for persistence and analytics */
  readonly id: string;
  /** Logical category of the objective */
  readonly type: GoalType;
  /** Target value that marks the goal as completed */
  readonly targetValue: number;
  /** Localization key for the goal name */
  readonly nameKey: string;
  /** Localization key for the goal description */
  readonly descriptionKey: string;
  /** Type of reward granted upon completion */
  readonly rewardType: 'gold' | 'luckyWorms';
  /** Amount of reward (only meaningful when rewardType is set) */
  readonly rewardAmount: number;
}

export interface GoalProgress {
  /** The goal definition id */
  readonly goalId: string;
  /** Current progress toward targetValue (derived from state) */
  readonly currentValue: number;
  /** Whether the goal has been completed */
  readonly isCompleted: boolean;
}

export interface OnboardingState {
  /** Whether the onboarding has been shown at least once */
  readonly hasSeenOnboarding: boolean;
  /** Highest completed step index (0-based) */
  readonly completedStep: number;
  /** Whether onboarding was skipped */
  readonly wasSkipped: boolean;
}

export interface DailyRewardState {
  /** ISO date string (YYYY-MM-DD) of the last claim, or null if never claimed */
  readonly lastClaimDate: string | null;
  /** Current consecutive day streak (1–7) */
  readonly streak: number;
  /** Unix timestamp (ms) when the next claim becomes available, or 0 if available now */
  readonly nextClaimAvailableAt: number;
}

export interface JourneyState {
  /** IDs of completed goals */
  completedGoals: Array<string>;
  /** Onboarding state */
  onboarding: OnboardingState;
  /** Daily reward state */
  dailyReward: DailyRewardState;
}
