import { AudioSystem } from './audio';
import {
  abyssMultiplier,
  calculateClickDamageBase,
  calculateClickUpgradeCost,
  calculateMaxAppleHP,
  calculatePendingLuckyWorms,
  calculateWormCost,
  calculateWormDPS,
} from './balance';
import {
  GAME_CONFIG,
  INITIAL_JOURNEY_STATE,
  INITIAL_STATE,
  LUCKY_WORMS_CONFIG,
  REWARDED_CONFIG,
  WORM_UPGRADES,
} from './constants';
import {
  calculateClaimResult,
  calculateDailyGoldReward,
  canClaimDailyReward,
  sanitizeDailyRewardState,
} from './daily-reward';
import { isNumberNotation, type NumberNotation } from './format';
import { calculateAllGoalProgress, findNewlyCompletedGoals, getGoalDefinition } from './goals';
import { LocalizationSystem } from './localization';
import { ABYSS_THRESHOLD, Decimal, type DecimalSource, isFiniteDecimal, ZERO } from './num';
import { OfflineProgressResult, OfflineProgressSystem } from './offline';
import { migrateSave } from './save-migration';
import { SkillSystem } from './skills';
import {
  DailyRewardState,
  type GameState,
  type GoalProgress,
  type JourneyState,
  type Language,
  type OnboardingState,
} from './types';

/** Number of onboarding steps (must match ONBOARDING_STEPS in OnboardingModal) */
const ONBOARDING_TOTAL_STEPS = 3;

/** Max deltaTime in seconds — prevents massive damage spikes when tab returns from background */
const MAX_DELTA_TIME_S = 5;

/** Máximo de maçãs destruídas por um único golpe ou tick. */
const MAX_KILLS_PER_HIT = 10_000;

export class GameEngine {
  private state: GameState;
  private audio: AudioSystem;
  private localization: LocalizationSystem;
  private skills: SkillSystem;
  private offlineSystem: OfflineProgressSystem;
  private lastTick: number = Date.now();
  private saveInterval: ReturnType<typeof setInterval> | null = null;
  private beforeUnloadHandler: (() => void) | null = null;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  /** Fim do 2x Gold Boost (ms desde a época). Fora do save; persistido em `lib/ads/rewarded-persistence.ts`. */
  private goldBoostUntil = 0;

  private readonly SAVE_KEY = 'apple_clicker_save';

  constructor() {
    this.state = this.loadGame();
    this.audio = new AudioSystem(this.state.settings.muted, this.state.settings.volume);
    this.localization = new LocalizationSystem(this.state.settings.language);
    this.skills = new SkillSystem(this.state);
    this.offlineSystem = new OfflineProgressSystem(
      {},
      {
        getCurrentState: () => this.state,
        getWormDPS: (id) => this.getWormDPS(id),
        getTotalDPS: () => this.getTotalDPS(),
        getGoldMultiplier: () => this.getGoldMultiplier(),
      },
    );

    this.calculateOfflineProgress();
    this.startAutoSave();
  }

  private loadGame(): GameState {
    if (typeof window === 'undefined') return this.mergeWithInitialState({});
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return this.mergeWithInitialState(migrateSave(parsed));
      } catch (e) {
        console.error('Failed to parse save', e);
      }
    }
    return this.mergeWithInitialState({});
  }

  private mergeWithInitialState(parsed: Partial<GameState>): GameState {
    const mergedSkills: Record<
      string,
      { isActive: boolean; remainingDuration: number; cooldownRemaining: number }
    > = {};
    const initialSkills = INITIAL_STATE.skills as Record<
      string,
      { isActive: boolean; remainingDuration: number; cooldownRemaining: number }
    >;
    const parsedSkills = (parsed.skills || {}) as Record<
      string,
      { isActive: boolean; remainingDuration: number; cooldownRemaining: number }
    >;
    const allSkillIds = new Set([...Object.keys(initialSkills), ...Object.keys(parsedSkills)]);
    for (const id of allSkillIds) {
      const initial = initialSkills[id] || {
        isActive: false,
        remainingDuration: 0,
        cooldownRemaining: 0,
      };
      const saved = parsedSkills[id];
      mergedSkills[id] = saved ? { ...initial, ...saved } : { ...initial };
    }

    // Merge journey state with additive migration for old saves
    const mergedJourney = this.mergeJourneyState(parsed.journey);

    return {
      ...INITIAL_STATE,
      ...parsed,
      worms: { ...INITIAL_STATE.worms, ...(parsed.worms || {}) },
      skills: mergedSkills,
      statistics: { ...INITIAL_STATE.statistics, ...(parsed.statistics || {}) },
      settings: this.mergeSettings(parsed.settings),
      journey: mergedJourney,
    };
  }

  /** Settings com notação validada: saves antigos (sem `notation`) recebem o padrão. */
  private mergeSettings(parsed: Partial<GameState['settings']> | undefined): GameState['settings'] {
    const merged = { ...INITIAL_STATE.settings, ...(parsed || {}) };
    if (!isNumberNotation(merged.notation)) merged.notation = INITIAL_STATE.settings.notation;
    return merged;
  }

  /**
   * Merge journey state from parsed save data.
   * Old saves without journey field get default initial state (additive migration).
   * Corrupted journey data is sanitized gracefully.
   */
  private mergeJourneyState(parsedJourney: JourneyState | undefined): JourneyState {
    if (!parsedJourney) {
      return { ...INITIAL_JOURNEY_STATE };
    }

    return {
      completedGoals: Array.isArray(parsedJourney.completedGoals)
        ? [...parsedJourney.completedGoals]
        : [],
      onboarding: this.mergeOnboardingState(parsedJourney.onboarding),
      dailyReward: sanitizeDailyRewardState(parsedJourney.dailyReward),
    };
  }

  private mergeOnboardingState(parsed: Partial<OnboardingState> | undefined): OnboardingState {
    if (!parsed) {
      return { ...INITIAL_JOURNEY_STATE.onboarding };
    }
    return {
      hasSeenOnboarding:
        typeof parsed.hasSeenOnboarding === 'boolean' ? parsed.hasSeenOnboarding : false,
      completedStep: typeof parsed.completedStep === 'number' ? parsed.completedStep : -1,
      wasSkipped: typeof parsed.wasSkipped === 'boolean' ? parsed.wasSkipped : false,
    };
  }

  public saveGame(): void {
    if (typeof window === 'undefined') return;
    this.state.lastSaveTimestamp = Date.now();
    localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state));
  }

  /**
   * Debounced save — prevents excessive localStorage writes when settings change rapidly
   * (e.g., volume slider drag fires dozens of calls per second).
   */
  private debouncedSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveGame(), 500);
  }

  private startAutoSave(): void {
    this.saveInterval = setInterval(() => this.saveGame(), GAME_CONFIG.AUTOSAVE_INTERVAL_MS);
    if (typeof window !== 'undefined') {
      this.beforeUnloadHandler = () => this.saveGame();
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  private calculateOfflineProgress(): void {
    const result = this.offlineSystem.calculate();
    if (result) {
      this.offlineSystem.applyToState(result);
      this.state.lastOfflineResult = {
        apples: result.applesEaten,
        gold: result.goldGained,
      };
    }
  }

  public tick(): void {
    const now = Date.now();
    let deltaTime = (now - this.lastTick) / 1000;
    this.lastTick = now;

    // Clamp deltaTime to prevent massive damage spikes from backgrounded tabs
    if (deltaTime > MAX_DELTA_TIME_S) {
      deltaTime = MAX_DELTA_TIME_S;
    }

    this.skills.update(deltaTime);

    const dps = this.getTotalDPS();
    if (dps.gt(0) && deltaTime > 0) {
      this.applyDamage(dps.mul(deltaTime), false);
    }
  }

  public clickApple(): void {
    const damage = this.getClickDamage();
    this.applyDamage(damage, true);
    this.state.totalClicks++;
    this.state.statistics.totalClicks = this.state.totalClicks;
    this.audio.playClick();
  }

  /**
   * Apply damage to the apple. Handles multi-kill (overflow damage)
   * to prevent gold loss at high DPS relative to apple HP.
   */
  private applyDamage(damage: DecimalSource, _isClick: boolean): void {
    let remainingDamage = new Decimal(damage);
    if (!isFiniteDecimal(remainingDamage) || remainingDamage.lte(0)) return;
    const goldMultiplier = this.getGoldMultiplier().mul(this.getGoldBoostMultiplier());
    // Teto de maçãs por chamada: evita laço longo quando o dano é muito maior que o HP.
    let kills = 0;

    while (remainingDamage.gt(0) && kills < MAX_KILLS_PER_HIT) {
      // Guard against zero/negative HP edge cases (save corruption)
      if (this.state.appleHP.lte(0)) {
        this.advanceStage();
        this.state.appleHP = this.state.maxAppleHP;
        continue;
      }

      if (this.state.appleHP.gt(remainingDamage)) {
        this.state.appleHP = this.state.appleHP.sub(remainingDamage);
        this.addGold(remainingDamage.mul(goldMultiplier));
        remainingDamage = ZERO;
      } else {
        // Apple is destroyed — use exactly the damage needed
        const damageToKill = this.state.appleHP;
        this.addGold(damageToKill.mul(goldMultiplier));
        remainingDamage = remainingDamage.sub(damageToKill);
        kills++;

        this.audio.playBreak();
        this.state.totalApplesEaten++;
        this.state.statistics.totalApplesEaten = this.state.totalApplesEaten;
        this.advanceStage();
        this.state.appleHP = this.state.maxAppleHP;
      }
    }
  }

  /** Soma ouro ao saldo e à estatística; ignora valores inválidos. */
  public addGold(amount: DecimalSource): void {
    const value = new Decimal(amount);
    if (!isFiniteDecimal(value) || value.lte(0)) return;
    this.state.gold = this.state.gold.add(value);
    this.state.statistics.totalGoldEarned = this.state.statistics.totalGoldEarned.add(value);
  }

  private advanceStage(): void {
    this.state.stage++;
    if (this.state.stage > this.state.highestStage) {
      this.state.highestStage = this.state.stage;
      this.state.statistics.highestStage = this.state.highestStage;
    }
    this.state.maxAppleHP = calculateMaxAppleHP(this.state.stage);
  }

  public getClickDamage(): Decimal {
    const baseDamage = calculateClickDamageBase(this.state.clickLevel);
    const luckyWormBonus = 1 + this.state.luckyWorms * LUCKY_WORMS_CONFIG.damageBonusPerWorm;
    const skillMultiplier = this.skills.getGoldMultiplierClick();
    return baseDamage.mul(luckyWormBonus * skillMultiplier).mul(this.getAbyssMultiplier());
  }

  public getWormDPS(id: string, count: number = this.state.worms[id] || 0): Decimal {
    const upgrade = WORM_UPGRADES.find((u) => u.id === id);
    if (!upgrade) return new Decimal(0);
    return calculateWormDPS(upgrade, count);
  }

  public getTotalDPS(): Decimal {
    let totalDPS = new Decimal(0);
    for (const upgrade of WORM_UPGRADES) {
      totalDPS = totalDPS.add(this.getWormDPS(upgrade.id));
    }
    const luckyWormBonus = 1 + this.state.luckyWorms * LUCKY_WORMS_CONFIG.damageBonusPerWorm;
    const skillMultiplier = this.skills.getGoldMultiplierIdle();
    return totalDPS.mul(luckyWormBonus * skillMultiplier).mul(this.getAbyssMultiplier());
  }

  public getGoldMultiplier(): Decimal {
    return this.getAbyssMultiplier().mul(
      1 + this.state.luckyWorms * LUCKY_WORMS_CONFIG.goldBonusPerWorm,
    );
  }

  /**
   * Liga o 2x Gold Boost do Free Rewards por `REWARDED_CONFIG.goldBoostDurationSeconds`.
   * Só deve ser chamado depois de `adViewed`. Devolve o instante em que acaba.
   */
  public activateGoldBoost(now: number = Date.now()): number {
    this.goldBoostUntil = now + REWARDED_CONFIG.goldBoostDurationSeconds * 1000;
    return this.goldBoostUntil;
  }

  /** Restaura o fim do boost salvo (reload). Valores inválidos desligam o boost. */
  public setGoldBoostUntil(until: number): void {
    this.goldBoostUntil = Number.isFinite(until) && until > 0 ? until : 0;
  }

  public getGoldBoostRemainingSeconds(now: number = Date.now()): number {
    return this.goldBoostUntil > now ? Math.ceil((this.goldBoostUntil - now) / 1000) : 0;
  }

  /**
   * Multiplicador temporário de gold por dano (clique e idle). Fica fora de
   * `getGoldMultiplier()` para não valer no progresso offline nem no Instant Harvest.
   */
  public getGoldBoostMultiplier(now: number = Date.now()): number {
    return now < this.goldBoostUntil ? REWARDED_CONFIG.goldBoostMultiplier : 1;
  }

  /** ×2 de dano e ouro por nível de Abismo. */
  public getAbyssMultiplier(): Decimal {
    return abyssMultiplier(this.state.abyssDepth);
  }

  public getUpgradeCost(upgradeId: string): Decimal {
    const upgrade = WORM_UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return new Decimal(0);
    return calculateWormCost(upgrade, this.state.worms[upgradeId] || 0);
  }

  public buyUpgrade(upgradeId: string): void {
    const cost = this.getUpgradeCost(upgradeId);
    if (this.state.gold.gte(cost)) {
      this.state.gold = this.state.gold.sub(cost);
      this.state.worms[upgradeId] = (this.state.worms[upgradeId] || 0) + 1;
      this.audio.playUpgrade();
      this.saveGame();
    }
  }

  public getClickUpgradeCost(): Decimal {
    return calculateClickUpgradeCost(this.state.clickLevel);
  }

  public buyClickUpgrade(): boolean {
    const cost = this.getClickUpgradeCost();
    if (this.state.gold.gte(cost)) {
      this.state.gold = this.state.gold.sub(cost);
      this.state.clickLevel++;
      this.audio.playUpgrade();
      this.saveGame();
      return true;
    }
    return false;
  }

  public canAscend(): boolean {
    return this.state.stage >= GAME_CONFIG.ASCENSION_STAGE;
  }

  public getPendingLuckyWorms(): number {
    return calculatePendingLuckyWorms(this.state.stage);
  }

  public ascend(): void {
    if (!this.canAscend()) return;

    const worms = this.getPendingLuckyWorms();
    this.state.luckyWorms += worms;
    this.state.statistics.luckyWormsCollected = this.state.luckyWorms;
    this.state.statistics.totalAscensions++;

    this.resetRun();
    this.audio.playAscension();
    this.saveGame();
  }

  /** Zera a corrida: ouro, estágio, HP, clique e worms. */
  private resetRun(): void {
    this.state.gold = new Decimal(0);
    this.state.stage = 1;
    this.state.appleHP = new Decimal(GAME_CONFIG.INITIAL_HP);
    this.state.maxAppleHP = new Decimal(GAME_CONFIG.INITIAL_HP);
    this.state.clickLevel = 0;
    this.state.worms = { ...INITIAL_STATE.worms };
  }

  /**
   * O Abismo: quando o ouro passa de 1,79e308 (o antigo Infinity do `number`),
   * o jogador pode mergulhar. O mergulho zera a corrida e os Lucky Worms e
   * dá ×2 permanente de dano e ouro por nível de Abismo.
   */
  public canDiveAbyss(): boolean {
    return this.state.gold.gte(ABYSS_THRESHOLD);
  }

  public diveAbyss(): boolean {
    if (!this.canDiveAbyss()) return false;
    this.state.abyssDepth += 1;
    this.state.luckyWorms = 0;
    this.resetRun();
    this.audio.playAscension();
    this.saveGame();
    return true;
  }

  public setMuted(muted: boolean): void {
    this.state.settings.muted = muted;
    this.audio.setMuted(muted);
    this.debouncedSave();
  }

  public setVolume(volume: number): void {
    this.state.settings.volume = volume;
    this.audio.setVolume(volume);
    this.debouncedSave();
  }

  public setNotation(notation: NumberNotation): void {
    if (!isNumberNotation(notation)) return;
    this.state.settings.notation = notation;
    this.debouncedSave();
  }

  public setLanguage(lang: Language): void {
    this.state.settings.language = lang;
    this.localization.setLanguage(lang);
    this.debouncedSave();
  }

  public activateSkill(skillId: string): void {
    if (skillId === 'golden_harvest') {
      this.skills.activateSkill(
        skillId,
        GAME_CONFIG.SKILL_DURATION_S,
        GAME_CONFIG.SKILL_COOLDOWN_S,
      );
      this.state.statistics.goldenHarvestActivations++;
      this.audio.playUpgrade();
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public getAudio(): AudioSystem {
    return this.audio;
  }

  public getLocalization(): LocalizationSystem {
    return this.localization;
  }

  public getSkills(): SkillSystem {
    return this.skills;
  }

  /**
   * Export save as base64-encoded JSON with SHA-256 integrity hash.
   * Note: This is integrity-verified encoding, NOT encryption.
   * For true encryption, use AES-GCM via WebCrypto API.
   */
  public async exportSave(): Promise<string> {
    const dataStr = JSON.stringify(this.state);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataStr));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return btoa(JSON.stringify({ data: this.state, hash: hashHex }));
  }

  public async importSave(saveStr: string): Promise<boolean> {
    try {
      const decoded = atob(saveStr);
      const saveObj = JSON.parse(decoded);

      if (!saveObj.data || typeof saveObj.hash !== 'string') return false;

      const dataStr = JSON.stringify(saveObj.data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataStr));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const expectedHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      if (expectedHash !== saveObj.hash) return false;

      const migrated = migrateSave(saveObj.data);
      if (!this.validateSaveData(migrated)) return false;

      this.state = this.mergeWithInitialState(migrated);
      this.saveGame();
      return true;
    } catch {
      return false;
    }
  }

  private validateSaveData(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false;

    // Check for prototype pollution vectors
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    for (const key of dangerousKeys) {
      if (Object.prototype.hasOwnProperty.call(data, key)) return false;
    }

    const isFiniteNum = (v: unknown, min: number, max: number): boolean =>
      typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

    const d = data as Record<string, unknown>;

    // Sem teto: ouro e HP são Decimal (o save já passou por migrateSave).
    const isDecimal = (v: unknown, min: number): boolean =>
      v instanceof Decimal && isFiniteDecimal(v) && v.gte(min);
    if (!isDecimal(d['gold'], 0)) return false;
    if (!isFiniteNum(d['stage'], 1, 1000000)) return false;
    if (!isFiniteNum(d['totalClicks'], 0, Infinity)) return false;
    if (!isDecimal(d['appleHP'], 0)) return false;
    if (!isDecimal(d['maxAppleHP'], 1)) return false;
    if (!isFiniteNum(d['clickLevel'], 0, 1000000)) return false;
    if (!isFiniteNum(d['luckyWorms'], 0, 1e15)) return false;
    if (!isFiniteNum(d['abyssDepth'] ?? 0, 0, 1e6)) return false;
    if (!isFiniteNum(d['highestStage'], 1, 1000000)) return false;

    return true;
  }

  public resetGame(): void {
    this.state = this.mergeWithInitialState({ settings: this.state.settings });
    this.saveGame();
  }

  /* ─── Journey / Goal Commands ─── */

  /**
   * Check for newly completed goals and award their rewards.
   * Returns an array of newly completed goal ids.
   * Each goal is awarded exactly once (idempotent).
   */
  public checkAndAwardGoals(): Array<string> {
    const journeyState = this.ensureJourneyState();
    const completedSet = new Set(journeyState.completedGoals);
    const newlyCompleted = findNewlyCompletedGoals(this.state, journeyState.completedGoals);

    const newCompletedIds: Array<string> = [];

    for (const goal of newlyCompleted) {
      if (completedSet.has(goal.id)) continue;

      // Grant reward deterministically
      if (goal.rewardType === 'gold') {
        this.addGold(goal.rewardAmount);
      } else if (goal.rewardType === 'luckyWorms') {
        this.state.luckyWorms += goal.rewardAmount;
        this.state.statistics.luckyWormsCollected = this.state.luckyWorms;
      }

      completedSet.add(goal.id);
      newCompletedIds.push(goal.id);
    }

    if (newCompletedIds.length > 0) {
      journeyState.completedGoals = [...completedSet];
      this.debouncedSave();
    }

    return newCompletedIds;
  }

  /**
   * Get all goal progress (completed and pending).
   */
  public getAllGoalProgress(): Array<GoalProgress> {
    const journeyState = this.ensureJourneyState();
    return calculateAllGoalProgress(this.state, journeyState.completedGoals);
  }

  /**
   * Get progress of a specific goal by id.
   */
  public getGoalProgressById(goalId: string): GoalProgress | undefined {
    const allProgress = this.getAllGoalProgress();
    return allProgress.find((progress) => progress.goalId === goalId);
  }

  /* ─── Daily Reward Commands ─── */

  /**
   * Check if a daily reward can be claimed right now.
   */
  public canClaimDailyReward(): boolean {
    const journeyState = this.ensureJourneyState();
    return canClaimDailyReward(journeyState.dailyReward);
  }

  /**
   * Claim the daily reward if eligible.
   * Returns the streak day (1-based) if claimed, or 0 if not eligible.
   */
  public claimDailyReward(): number {
    const journeyState = this.ensureJourneyState();

    if (!canClaimDailyReward(journeyState.dailyReward)) {
      return 0;
    }

    const claimResult = calculateClaimResult(journeyState.dailyReward);
    const goldReward = calculateDailyGoldReward(claimResult.streakDay, this.state.stage);

    this.addGold(goldReward);
    journeyState.dailyReward = claimResult.newState;

    this.debouncedSave();
    return claimResult.streakDay;
  }

  /**
   * Get time until next daily reward claim (in ms).
   * Returns 0 if available now.
   */
  public getTimeUntilNextDailyReward(): number {
    const journeyState = this.ensureJourneyState();
    const dailyRewardState = journeyState.dailyReward;
    if (canClaimDailyReward(dailyRewardState)) {
      return 0;
    }
    return Math.max(0, dailyRewardState.nextClaimAvailableAt - Date.now());
  }

  /* ─── Onboarding Commands ─── */

  /**
   * Mark a specific onboarding step as completed.
   * Step index is 0-based.
   */
  public completeOnboardingStep(stepIndex: number): void {
    const journeyState = this.ensureJourneyState();
    if (stepIndex > journeyState.onboarding.completedStep) {
      journeyState.onboarding = {
        ...journeyState.onboarding,
        hasSeenOnboarding: true,
        completedStep: stepIndex,
      };
      this.debouncedSave();
    }
  }

  /**
   * Mark onboarding as completed (all steps done).
   */
  public completeOnboarding(): void {
    const journeyState = this.ensureJourneyState();
    journeyState.onboarding = {
      hasSeenOnboarding: true,
      completedStep: Number.MAX_SAFE_INTEGER,
      wasSkipped: false,
    };
    this.debouncedSave();
  }

  /**
   * Skip onboarding entirely.
   */
  public skipOnboarding(): void {
    const journeyState = this.ensureJourneyState();
    journeyState.onboarding = {
      hasSeenOnboarding: true,
      completedStep: -1,
      wasSkipped: true,
    };
    this.debouncedSave();
  }

  /**
   * Check if onboarding should be shown.
   * Returns true only when the player has never started onboarding
   * or has partially completed it (not finished all steps and not skipped).
   */
  public shouldShowOnboarding(): boolean {
    const journeyState = this.ensureJourneyState();
    const onboarding = journeyState.onboarding;
    // Already fully completed or explicitly skipped — never show again
    if (onboarding.wasSkipped || onboarding.completedStep >= ONBOARDING_TOTAL_STEPS - 1) {
      return false;
    }
    // Never seen — always show
    if (!onboarding.hasSeenOnboarding) {
      return true;
    }
    // Partially completed — resume from next step
    return onboarding.completedStep < ONBOARDING_TOTAL_STEPS - 1;
  }

  /**
   * Get the onboarding state.
   */
  public getOnboardingState(): OnboardingState {
    return this.ensureJourneyState().onboarding;
  }

  /**
   * Reset onboarding so it can be shown again (from settings).
   */
  public resetOnboarding(): void {
    const journeyState = this.ensureJourneyState();
    journeyState.onboarding = {
      hasSeenOnboarding: false,
      completedStep: -1,
      wasSkipped: false,
    };
    this.debouncedSave();
  }

  /* ─── Journey Helpers ─── */

  /**
   * Ensure journey state exists on the game state.
   * Handles the case where old saves don't have it.
   */
  private ensureJourneyState(): JourneyState {
    if (!this.state.journey) {
      this.state.journey = { ...INITIAL_JOURNEY_STATE };
    }
    return this.state.journey;
  }

  /**
   * Clean up intervals, event listeners, and audio resources.
   * Call this when the engine is no longer needed (component unmount).
   */
  public destroy(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.beforeUnloadHandler && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
    this.audio.destroy();
  }
}
