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

export interface GameState {
  gold: number;
  stage: number;
  appleHP: number;
  maxAppleHP: number;
  clickDamage: number;
  clickLevel: number;
  totalClicks: number;
  totalApplesEaten: number;
  gardenersSouls: number;
  highestStage: number;
  lastSaveTimestamp: number;
  worms: {
    [key: string]: number;
  };
  skills: {
    [key: string]: SkillState;
  };
  settings: {
    language: Language;
    muted: boolean;
    volume: number;
  };
}

export interface LocalizationData {
  [key: string]: Partial<Record<Language, string>> & { en: string };
}
