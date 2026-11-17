import { calculateMaxAppleHP } from './balance';
import { GAME_CONFIG } from './constants';
import { Decimal, isFiniteDecimal } from './num';
import type { GameState } from './types';

export interface OfflineProgressResult {
  applesEaten: number;
  goldGained: Decimal;
  offlineSeconds: number;
  stagesAdvanced: number;
  finalStage: number;
  finalAppleHP: Decimal;
  finalMaxAppleHP: Decimal;
  antiCheatFlags: Array<AntiCheatFlag>;
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
  startAppleHP: Decimal;
  startMaxAppleHP: Decimal;
  totalDamage: Decimal;
  goldMultiplier: Decimal;
  offlineSeconds: number;
}

interface OfflineProgressDeps {
  getCurrentState: () => GameState;
  getWormDPS: (id: string) => Decimal;
  getTotalDPS: () => Decimal;
  getGoldMultiplier: () => Decimal;
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
    baseHP: GAME_CONFIG.INITIAL_HP,
    growthFactor: GAME_CONFIG.HP_GROWTH,
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

    if (!isFiniteDecimal(totalDPS) || totalDPS.lte(0)) return null;

    const goldMultiplier = this.deps.getGoldMultiplier();

    const clampedSeconds = this.clampOfflineTime(offlineSeconds);
    const totalDamage = totalDPS.mul(clampedSeconds);

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

    state.gold = state.gold.add(result.goldGained);
    state.statistics.totalGoldEarned = state.statistics.totalGoldEarned.add(result.goldGained);
    state.totalApplesEaten += result.applesEaten;
    state.stage = result.finalStage;
    state.appleHP = Decimal.max(1, result.finalAppleHP);
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
    const {
      startStage,
      startAppleHP,
      startMaxAppleHP,
      totalDamage,
      goldMultiplier,
      offlineSeconds,
    } = data;

    if (totalDamage.lte(0)) {
      return this.createEmptyResult(offlineSeconds, startStage, startAppleHP, startMaxAppleHP);
    }

    const maxIterations = Math.min(
      this.config.maxOfflineApplesPerBatch,
      Math.ceil(Math.min(1e9, totalDamage.div(this.config.appleHP.baseHP).toNumber())),
    );

    let currentStage = startStage;
    let currentAppleHP = startAppleHP;
    let currentMaxAppleHP = startMaxAppleHP;
    let applesEaten = 0;
    let goldGained = new Decimal(0);
    let remainingDamage = totalDamage;

    for (let i = 0; i < maxIterations && remainingDamage.gt(0); i++) {
      const appleHP = currentAppleHP;

      if (remainingDamage.lt(appleHP)) {
        currentAppleHP = appleHP.sub(remainingDamage);
        remainingDamage = new Decimal(0);
        break;
      }

      goldGained = goldGained.add(appleHP.mul(goldMultiplier));
      applesEaten++;
      remainingDamage = remainingDamage.sub(appleHP);

      currentStage++;
      currentMaxAppleHP = this.calculateMaxAppleHP(currentStage);
      currentAppleHP = currentMaxAppleHP;
    }

    if (currentAppleHP.lte(0)) {
      currentAppleHP = currentMaxAppleHP;
    }

    return {
      applesEaten,
      goldGained,
      offlineSeconds,
      stagesAdvanced: applesEaten,
      finalStage: currentStage,
      finalAppleHP: Decimal.max(1, currentAppleHP),
      finalMaxAppleHP: currentMaxAppleHP,
      antiCheatFlags: this.getAntiCheatFlags(applesEaten, goldGained, totalDamage, goldMultiplier),
    };
  }

  private createEmptyResult(
    offlineSeconds: number,
    startStage: number,
    startAppleHP: Decimal,
    startMaxAppleHP: Decimal,
  ): OfflineProgressResult {
    return {
      applesEaten: 0,
      goldGained: new Decimal(0),
      offlineSeconds,
      stagesAdvanced: 0,
      finalStage: startStage,
      finalAppleHP: startAppleHP,
      finalMaxAppleHP: startMaxAppleHP,
      antiCheatFlags: [],
    };
  }

  private calculateMaxAppleHP(stage: number): Decimal {
    const { baseHP, growthFactor } = this.config.appleHP;
    // A curva padrão é a do jogo (dois trechos); uma config de teste pode trocá-la.
    if (baseHP === GAME_CONFIG.INITIAL_HP && growthFactor === GAME_CONFIG.HP_GROWTH) {
      return calculateMaxAppleHP(stage);
    }
    return Decimal.pow(growthFactor, stage - 1)
      .mul(baseHP)
      .floor()
      .max(1);
  }

  private getAntiCheatFlags(
    applesEaten: number,
    goldGained: Decimal,
    totalDamage: Decimal,
    goldMultiplier: Decimal,
  ): Array<AntiCheatFlag> {
    const flags: Array<AntiCheatFlag> = [];

    // O ouro nunca pode passar do dano total × multiplicador. O teto fixo antigo
    // (1e15) disparava em toda sessão de fim de jogo; agora ele é relativo.
    const goldCeiling = Decimal.max(
      this.config.maxReasonableGoldAmount,
      totalDamage.mul(goldMultiplier.min(this.config.maxReasonableGoldMultiplier)).mul(1.0001),
    );
    if (goldGained.gt(goldCeiling)) {
      flags.push('UNREALISTIC_GOLD_AMOUNT');
    }

    if (applesEaten > this.config.maxOfflineApplesPerBatch) {
      flags.push('EXCESSIVE_DAMAGE_PER_ITERATION');
    }

    return flags;
  }
}
