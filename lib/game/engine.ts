import { GameState, Language, JourneyState, OnboardingState, DailyRewardState, GoalProgress } from './types';
import { INITIAL_STATE, WORM_UPGRADES, CLICK_UPGRADE, LUCKY_WORMS_CONFIG, GAME_CONFIG, INITIAL_JOURNEY_STATE } from './constants';
import { AudioSystem } from './audio';
import { LocalizationSystem } from './localization';
import { SkillSystem } from './skills';
import { OfflineProgressSystem, OfflineProgressResult } from './offline';
import { findNewlyCompletedGoals, calculateAllGoalProgress, getGoalDefinition } from './goals';
import { canClaimDailyReward, calculateClaimResult, calculateDailyGoldReward, sanitizeDailyRewardState } from './daily-reward';

/** Number of onboarding steps (must match ONBOARDING_STEPS in OnboardingModal) */
const ONBOARDING_TOTAL_STEPS = 3;

/** Max deltaTime in seconds — prevents massive damage spikes when tab returns from background */
const MAX_DELTA_TIME_S = 5;

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

  private readonly SAVE_KEY = 'apple_clicker_save';

  constructor() {
    this.state = this.loadGame();
    this.audio = new AudioSystem(this.state.settings.muted, this.state.settings.volume);
    this.localization = new LocalizationSystem(this.state.settings.language);
    this.skills = new SkillSystem(this.state);
    this.offlineSystem = new OfflineProgressSystem({}, {
      getCurrentState: () => this.state,
      getWormDPS: (id) => this.getWormDPS(id),
      getTotalDPS: () => this.getTotalDPS(),
      getGoldMultiplier: () => this.getGoldMultiplier(),
    });

    this.calculateOfflineProgress();
    this.startAutoSave();
  }

  private loadGame(): GameState {
    if (typeof window === 'undefined') return this.mergeWithInitialState({});
    const saved = localStorage.getItem(this.SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return this.mergeWithInitialState(parsed);
      } catch (e) {
        console.error('Failed to parse save', e);
      }
    }
    return this.mergeWithInitialState({});
  }

  private mergeWithInitialState(parsed: Partial<GameState>): GameState {
    const mergedSkills: Record<string, { isActive: boolean; remainingDuration: number; cooldownRemaining: number }> = {};
    const initialSkills = INITIAL_STATE.skills as Record<string, { isActive: boolean; remainingDuration: number; cooldownRemaining: number }>;
    const parsedSkills = (parsed.skills || {}) as Record<string, { isActive: boolean; remainingDuration: number; cooldownRemaining: number }>;
    const allSkillIds = new Set([
      ...Object.keys(initialSkills),
      ...Object.keys(parsedSkills),
    ]);
    for (const id of allSkillIds) {
      const initial = initialSkills[id] || { isActive: false, remainingDuration: 0, cooldownRemaining: 0 };
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
      settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
      journey: mergedJourney,
    };
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
      hasSeenOnboarding: typeof parsed.hasSeenOnboarding === 'boolean'
        ? parsed.hasSeenOnboarding
        : false,
      completedStep: typeof parsed.completedStep === 'number'
        ? parsed.completedStep
        : -1,
      wasSkipped: typeof parsed.wasSkipped === 'boolean'
        ? parsed.wasSkipped
        : false,
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
    if (dps > 0) {
      this.applyDamage(dps * deltaTime, false);
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
  private applyDamage(damage: number, _isClick: boolean): void {
    let remainingDamage = damage;

    while (remainingDamage > 0) {
      // Guard against zero/negative HP edge cases (floating-point, save corruption)
      if (this.state.appleHP <= 0) {
        this.advanceStage();
        this.state.appleHP = this.state.maxAppleHP;
        continue;
      }

      if (this.state.appleHP > remainingDamage) {
        const goldGained = remainingDamage * this.getGoldMultiplier();
        this.state.appleHP -= remainingDamage;
        this.state.gold += goldGained;
        this.state.statistics.totalGoldEarned += goldGained;
        remainingDamage = 0;
      } else {
        // Apple is destroyed — use exactly the damage needed
        const damageToKill = this.state.appleHP;
        const goldGained = damageToKill * this.getGoldMultiplier();
        this.state.gold += goldGained;
        this.state.statistics.totalGoldEarned += goldGained;
        remainingDamage -= damageToKill;

        this.audio.playBreak();
        this.state.totalApplesEaten++;
        this.state.statistics.totalApplesEaten = this.state.totalApplesEaten;
        this.advanceStage();
        this.state.appleHP = this.state.maxAppleHP;
      }
    }
  }

  private advanceStage(): void {
    this.state.stage++;
    if (this.state.stage > this.state.highestStage) {
      this.state.highestStage = this.state.stage;
      this.state.statistics.highestStage = this.state.highestStage;
    }
    this.state.maxAppleHP = this.calculateMaxAppleHP(this.state.stage);
  }

  private calculateMaxAppleHP(stage: number): number {
    return Math.floor(GAME_CONFIG.INITIAL_HP * Math.pow(GAME_CONFIG.HP_GROWTH, stage - 1));
  }

  public getClickDamage(): number {
    const baseDamage = GAME_CONFIG.CLICK_BASE_DAMAGE * Math.pow(CLICK_UPGRADE.damageGrowth, this.state.clickLevel);
    const luckyWormBonus = 1 + (this.state.luckyWorms * LUCKY_WORMS_CONFIG.damageBonusPerWorm);
    const skillMultiplier = this.skills.getGoldMultiplierClick();
    return baseDamage * luckyWormBonus * skillMultiplier;
  }

  public getWormDPS(id: string): number {
    const upgrade = WORM_UPGRADES.find(u => u.id === id);
    if (!upgrade) return 0;
    const count = this.state.worms[id] || 0;
    if (count === 0) return 0;
    return upgrade.baseDPS * Math.pow(upgrade.dpsGrowth, count - 1);
  }

  public getTotalDPS(): number {
    let totalDPS = 0;
    for (const upgrade of WORM_UPGRADES) {
      totalDPS += this.getWormDPS(upgrade.id);
    }
    const luckyWormBonus = 1 + (this.state.luckyWorms * LUCKY_WORMS_CONFIG.damageBonusPerWorm);
    const skillMultiplier = this.skills.getGoldMultiplierIdle();
    return totalDPS * luckyWormBonus * skillMultiplier;
  }

  public getGoldMultiplier(): number {
    return 1 + (this.state.luckyWorms * LUCKY_WORMS_CONFIG.goldBonusPerWorm);
  }

  public getUpgradeCost(upgradeId: string): number {
    const upgrade = WORM_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    const count = this.state.worms[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, count));
  }

  public buyUpgrade(upgradeId: string): void {
    const cost = this.getUpgradeCost(upgradeId);
    if (this.state.gold >= cost) {
      this.state.gold -= cost;
      this.state.worms[upgradeId] = (this.state.worms[upgradeId] || 0) + 1;
      this.audio.playUpgrade();
      this.saveGame();
    }
  }

  public getClickUpgradeCost(): number {
    return Math.floor(GAME_CONFIG.CLICK_UPGRADE_BASE_COST * Math.pow(GAME_CONFIG.CLICK_UPGRADE_COST_GROWTH, this.state.clickLevel));
  }

  public buyClickUpgrade(): boolean {
    const cost = this.getClickUpgradeCost();
    if (this.state.gold >= cost) {
      this.state.gold -= cost;
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
    if (this.state.stage < GAME_CONFIG.ASCENSION_STAGE) return 0;
    return Math.floor(Math.sqrt(this.state.highestStage));
  }

  public ascend(): void {
    if (!this.canAscend()) return;

    const worms = this.getPendingLuckyWorms();
    this.state.luckyWorms += worms;
    this.state.statistics.luckyWormsCollected = this.state.luckyWorms;
    this.state.statistics.totalAscensions++;

    this.state.gold = 0;
    this.state.stage = 1;
    this.state.appleHP = GAME_CONFIG.INITIAL_HP;
    this.state.maxAppleHP = GAME_CONFIG.INITIAL_HP;
    this.state.clickLevel = 0;
    this.state.worms = { ...INITIAL_STATE.worms };

    this.audio.playAscension();
    this.saveGame();
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

  public setLanguage(lang: Language): void {
    this.state.settings.language = lang;
    this.localization.setLanguage(lang);
    this.debouncedSave();
  }

  public activateSkill(skillId: string): void {
    if (skillId === 'golden_harvest') {
      this.skills.activateSkill(skillId, GAME_CONFIG.SKILL_DURATION_S, GAME_CONFIG.SKILL_COOLDOWN_S);
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
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
      const expectedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (expectedHash !== saveObj.hash) return false;

      if (!this.validateSaveData(saveObj.data)) return false;

      this.state = this.mergeWithInitialState(saveObj.data);
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

    if (!isFiniteNum(d['gold'], 0, 1e100)) return false;
    if (!isFiniteNum(d['stage'], 1, 1000000)) return false;
    if (!isFiniteNum(d['totalClicks'], 0, Infinity)) return false;
    if (!isFiniteNum(d['appleHP'], 0, 1e100)) return false;
    if (!isFiniteNum(d['maxAppleHP'], 1, 1e100)) return false;
    if (!isFiniteNum(d['clickLevel'], 0, 1000000)) return false;
    if (!isFiniteNum(d['luckyWorms'], 0, 1e15)) return false;
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
  public checkAndAwardGoals(): string[] {
    const journeyState = this.ensureJourneyState();
    const completedSet = new Set(journeyState.completedGoals);
    const newlyCompleted = findNewlyCompletedGoals(this.state, journeyState.completedGoals);

    const newCompletedIds: string[] = [];

    for (const goal of newlyCompleted) {
      if (completedSet.has(goal.id)) continue;

      // Grant reward deterministically
      if (goal.rewardType === 'gold') {
        this.state.gold += goal.rewardAmount;
        this.state.statistics.totalGoldEarned += goal.rewardAmount;
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
  public getAllGoalProgress(): GoalProgress[] {
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

    this.state.gold += goldReward;
    this.state.statistics.totalGoldEarned += goldReward;
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
