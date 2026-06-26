export type Language = 
  | 'en' | 'zh' | 'hi' | 'es' | 'fr' | 'ar' | 'bn' | 'pt' | 'ru' | 'ur' 
  | 'id' | 'de' | 'ja' | 'sw' | 'mr' | 'te' | 'tr' | 'ta' | 'vi' | 'ko';

export interface WormUpgrade {
  id: string;
  nameKey: string;
  baseCost: number;
  baseDPS: number;
  costGrowth: number;
  dpsGrowth: number;
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
  totalGoldEarned: number;
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
  gold: number;
  stage: number;
  appleHP: number;
  maxAppleHP: number;
  clickDamage: number;
  clickLevel: number;
  totalClicks: number;
  totalApplesEaten: number;
  luckyWorms: number;
  highestStage: number;
  lastSaveTimestamp: number;
  lastOfflineResult?: { apples: number; gold: number };
  worms: Record<string, number>;
  skills: Record<string, SkillState>;
  statistics: StatisticsData;
  settings: {
    language: Language;
    muted: boolean;
    volume: number;
  };
}

export interface LocalizationData {
  [key: string]: Partial<Record<Language, string>> & { en: string };
}
