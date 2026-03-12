import { GameState } from './types';

export interface OfflineProgressResult {
  applesEaten: number;
  goldGained: number;
  offlineSeconds: number;
  stagesAdvanced: number;
  finalStage: number;
  finalAppleHP: number;
  finalMaxAppleHP: number;
  antiCheatFlags: AntiCheatFlag[];
}

export type AntiCheatFlag = 
  | 'SUSPICIOUS_TIME_NEGATIVE'
  | 'EXCESSIVE_DAMAGE_PER_ITERATION'
  | 'UNREALISTIC_GOLD_AMOUNT';

export interface AppleHPFormula {
  baseHP: number;
  growthFactor: number;
}

interface OfflineCalculationData {
  startStage: number;
  startAppleHP: number;
  startMaxAppleHP: number;
  totalDamage: number;
  goldMultiplier: number;
  offlineSeconds: number;
}

interface OfflineProgressDeps {
  getCurrentState: () => GameState;
  getWormDPS: (id: string) => number;
  getTotalDPS: () => number;
  getGoldMultiplier: () => number;
}

interface OfflineConfig {
  maxOfflineHours: number;
  minOfflineSeconds: number;
  maxOfflineApplesPerBatch: number;
  maxReasonableGoldMultiplier: number;
  maxReasonableGoldAmount: number;
  appleHP: AppleHPFormula;
}

const DEFAULT_OFFLINE_CONFIG: OfflineConfig = {
  maxOfflineHours: 12,
  minOfflineSeconds: 10,
  maxOfflineApplesPerBatch: 1000,
  maxReasonableGoldMultiplier: 1e15,
  maxReasonableGoldAmount: 1e15,
  appleHP: {
    baseHP: 50,
    growthFactor: 1.5,
  },
};

export class OfflineProgressSystem {
  private readonly config: OfflineConfig;
  private readonly deps: OfflineProgressDeps;

  constructor(config: Partial<OfflineConfig>, deps: OfflineProgressDeps) {
    this.config = { ...DEFAULT_OFFLINE_CONFIG, ...config };
    this.deps = deps;
  }

  calculate(): OfflineProgressResult | null {
    const currentState = this.deps.getCurrentState();
    const now = Date.now();
    const lastSave = currentState.lastSaveTimestamp;

    const offlineMs = this.validateOfflineTime(now, lastSave);
    if (offlineMs === null) return null;

    const offlineSeconds = Math.floor(offlineMs / 1000);
    const totalDPS = this.deps.getTotalDPS();

    if (totalDPS <= 0) return null;

    const goldMultiplier = this.deps.getGoldMultiplier();

    const clampedSeconds = this.clampOfflineTime(offlineSeconds);
    const totalDamage = totalDPS * clampedSeconds;

    const result = this.simulateAppleDestruction({
      startStage: currentState.stage,
      startAppleHP: currentState.appleHP,
      startMaxAppleHP: currentState.maxAppleHP,
      totalDamage,
      goldMultiplier,
      offlineSeconds: clampedSeconds,
    });

    if (result.antiCheatFlags.length > 0) {
      console.warn('[OfflineProgress] Anti-cheat flags:', result.antiCheatFlags);
    }

    return result;
  }

  applyToState(result: OfflineProgressResult): void {
    const state = this.deps.getCurrentState();
    
    state.gold += result.goldGained;
    state.totalApplesEaten += result.applesEaten;
    state.stage = result.finalStage;
    state.appleHP = Math.max(1, result.finalAppleHP);
    state.maxAppleHP = result.finalMaxAppleHP;

    
    if (result.stagesAdvanced > 0) {
      state.highestStage = Math.max(state.highestStage, result.finalStage);
    }
  }

  private validateOfflineTime(now: number, lastSave: number): number | null {
    if (lastSave < 0 || lastSave > now) {
      return null;
    }

    const offlineMs = now - lastSave;

    if (offlineMs < this.config.minOfflineSeconds * 1000) {
      return null;
    }

    return offlineMs;
  }

  private clampOfflineTime(offlineSeconds: number): number {
    return Math.min(offlineSeconds, this.config.maxOfflineHours * 3600);
  }

  private simulateAppleDestruction(data: OfflineCalculationData): OfflineProgressResult {
    const { startStage, startAppleHP, startMaxAppleHP, totalDamage, goldMultiplier, offlineSeconds } = data;

    if (totalDamage <= 0) {
      return this.createEmptyResult(offlineSeconds);
    }

    const maxIterations = Math.min(
      this.config.maxOfflineApplesPerBatch,
      Math.ceil(totalDamage / this.config.appleHP.baseHP)
    );

    let currentStage = startStage;
    let currentAppleHP = startAppleHP;
    let currentMaxAppleHP = startMaxAppleHP;
    let applesEaten = 0;
    let goldGained = 0;
    let remainingDamage = totalDamage;

    for (let i = 0; i < maxIterations && remainingDamage > 0; i++) {
      const appleHP = currentAppleHP;
      const maxAppleHP = currentMaxAppleHP;

      if (remainingDamage < appleHP) {
        currentAppleHP = appleHP - remainingDamage;
        remainingDamage = 0;
        break;
      }

      const damageToApple = Math.min(remainingDamage, appleHP);
      const goldFromApple = damageToApple * goldMultiplier;

      goldGained += goldFromApple;
      applesEaten++;
      remainingDamage -= damageToApple;

      currentStage++;
      currentMaxAppleHP = this.calculateMaxAppleHP(currentStage);
      currentAppleHP = currentMaxAppleHP;
    }

    
    if (currentAppleHP <= 0) {
      currentAppleHP = currentMaxAppleHP;
    }

    return {
      applesEaten,
      goldGained,
      offlineSeconds,
      stagesAdvanced: applesEaten,
      finalStage: currentStage,
      finalAppleHP: Math.max(1, currentAppleHP),
      finalMaxAppleHP: currentMaxAppleHP,
      antiCheatFlags: this.getAntiCheatFlags(applesEaten, goldGained, totalDamage),
    };
  }

  private createEmptyResult(offlineSeconds: number): OfflineProgressResult {
    return {
      applesEaten: 0,
      goldGained: 0,
      offlineSeconds,
      stagesAdvanced: 0,
      finalStage: 1,
      finalAppleHP: 50,
      finalMaxAppleHP: 50,
      antiCheatFlags: [],
    };
  }

  private calculateMaxAppleHP(stage: number): number {
    const { baseHP, growthFactor } = this.config.appleHP;
    return Math.floor(baseHP * Math.pow(growthFactor, stage - 1));
  }
  private getAntiCheatFlags(
    applesEaten: number,
    goldGained: number,
    totalDamage: number,
  ): AntiCheatFlag[] {
    const flags: AntiCheatFlag[] = [];

    if (goldGained > this.config.maxReasonableGoldAmount) {
      flags.push('UNREALISTIC_GOLD_AMOUNT');
    }

    if (applesEaten > this.config.maxOfflineApplesPerBatch) {
      flags.push('EXCESSIVE_DAMAGE_PER_ITERATION');
    }

    return flags;
  }
}
