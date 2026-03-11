import { GameState, Language, WormUpgrade } from './types';
import { INITIAL_STATE, WORM_UPGRADES, CLICK_UPGRADE } from './constants';
import { AudioSystem } from './audio';
import { LocalizationSystem } from './localization';
import { SkillSystem } from './skills';

export class GameEngine {
  private state: GameState;
  private audio: AudioSystem;
  private localization: LocalizationSystem;
  private skills: SkillSystem;
  private lastTick: number = Date.now();
  private saveInterval: any;

  constructor() {
    this.state = this.loadGame();
    this.audio = new AudioSystem(this.state.settings.muted, this.state.settings.volume);
    this.localization = new LocalizationSystem(this.state.settings.language);
    this.skills = new SkillSystem(this.state);
    
    this.calculateOfflineProgress();
    this.startAutoSave();
  }

  private loadGame(): GameState {
    if (typeof window === 'undefined') return INITIAL_STATE;
    const saved = localStorage.getItem('apple_clicker_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial state to handle new properties in updates
        return { 
          ...INITIAL_STATE, 
          ...parsed, 
          worms: { ...INITIAL_STATE.worms, ...(parsed.worms || {}) },
          skills: { ...INITIAL_STATE.skills, ...(parsed.skills || {}) },
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) } 
        };
      } catch (e) {
        console.error('Failed to parse save', e);
      }
    }
    return INITIAL_STATE;
  }

  public saveGame() {
    if (typeof window === 'undefined') return;
    this.state.lastSaveTimestamp = Date.now();
    localStorage.setItem('apple_clicker_save', JSON.stringify(this.state));
  }

  private startAutoSave() {
    this.saveInterval = setInterval(() => this.saveGame(), 10000);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveGame());
    }
  }

  private calculateOfflineProgress() {
    const now = Date.now();
    let offlineTimeMs = now - this.state.lastSaveTimestamp;
    if (offlineTimeMs < 10000) return; // Less than 10 seconds, ignore

    // Cap offline progress to 12 hours
    const MAX_OFFLINE_MS = 12 * 60 * 60 * 1000;
    if (offlineTimeMs > MAX_OFFLINE_MS) {
      offlineTimeMs = MAX_OFFLINE_MS;
    }

    const dps = this.getTotalDPS();
    if (dps <= 0) return;

    const totalDamage = (dps * offlineTimeMs) / 1000;
    let remainingDamage = totalDamage;
    let applesEaten = 0;
    let goldGained = 0;

    // Simulate eating apples
    while (remainingDamage >= this.state.appleHP) {
      remainingDamage -= this.state.appleHP;
      goldGained += this.state.appleHP * this.getGoldMultiplier();
      applesEaten++;
      this.advanceStage();
      // Recalculate HP for next stage
      this.state.appleHP = this.state.maxAppleHP;
    }

    this.state.appleHP -= remainingDamage;
    this.state.gold += goldGained;
    this.state.totalApplesEaten += applesEaten;

    // We'll show a notification in the UI later
    (this.state as any).lastOfflineResult = { apples: applesEaten, gold: goldGained };
  }

  public tick() {
    const now = Date.now();
    const deltaTime = (now - this.lastTick) / 1000;
    this.lastTick = now;

    this.skills.update(deltaTime);

    const dps = this.getTotalDPS();
    if (dps > 0) {
      this.applyDamage(dps * deltaTime, false);
    }
  }

  public clickApple() {
    const damage = this.getClickDamage();
    this.applyDamage(damage, true);
    this.state.totalClicks++;
    this.audio.playClick();
  }

  private applyDamage(damage: number, isClick: boolean) {
    this.state.appleHP -= damage;
    this.state.gold += damage * this.getGoldMultiplier();

    if (this.state.appleHP <= 0) {
      this.audio.playBreak();
      this.state.totalApplesEaten++;
      this.advanceStage();
      this.state.appleHP = this.state.maxAppleHP;
    }
  }

  private advanceStage() {
    this.state.stage++;
    if (this.state.stage > this.state.highestStage) {
      this.state.highestStage = this.state.stage;
    }
    // Exponential growth: HP = 50 * 1.5^(stage-1)
    this.state.maxAppleHP = Math.floor(50 * Math.pow(1.5, this.state.stage - 1));
  }

  public getClickDamage(): number {
    const base = 1 * Math.pow(CLICK_UPGRADE.damageGrowth, this.state.clickLevel);
    const soulBonus = 1 + (this.state.luckyWorms * 0.1); // 10% per soul
    const skillMultiplier = this.skills.getGoldMultiplierClick();
    return base * soulBonus * skillMultiplier;
  }

  public getWormDPS(id: string): number {
    const upgrade = WORM_UPGRADES.find(u => u.id === id);
    if (!upgrade) return 0;
    const count = this.state.worms[id] || 0;
    if (count === 0) return 0;
    return upgrade.baseDPS * Math.pow(upgrade.dpsGrowth, count - 1);
  }

  public getTotalDPS(): number {
    let dps = 0;
    WORM_UPGRADES.forEach(upgrade => {
      dps += this.getWormDPS(upgrade.id);
    });
    const soulBonus = 1 + (this.state.luckyWorms * 0.1);
    const skillMultiplier = this.skills.getGoldMultiplierIdle();
    return dps * soulBonus * skillMultiplier;
  }

  public getGoldMultiplier(): number {
    return 1 + (this.state.luckyWorms * 0.05); // 5% per soul
  }

  public buyUpgrade(upgradeId: string) {
    const upgrade = WORM_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = this.getUpgradeCost(upgradeId);
    if (this.state.gold >= cost) {
      this.state.gold -= cost;
      this.state.worms[upgradeId] = (this.state.worms[upgradeId] || 0) + 1;
      this.audio.playUpgrade();
      this.saveGame();
    }
  }

  public getUpgradeCost(upgradeId: string): number {
    const upgrade = WORM_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return 0;
    const count = this.state.worms[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, count));
  }

  public getClickUpgradeCost(): number {
    return Math.floor(20 * Math.pow(1.15, this.state.clickLevel));
  }

  public buyClickUpgrade() {
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
    return this.state.stage >= 50;
  }

  public getPendingSouls(): number {
    if (this.state.stage < 50) return 0;
    return Math.floor(Math.sqrt(this.state.highestStage));
  }

  public ascend() {
    if (!this.canAscend()) return;

    const souls = this.getPendingSouls();
    this.state.luckyWorms += souls;
    
    // Reset progress
    this.state.gold = 0;
    this.state.stage = 1;
    this.state.appleHP = 50;
    this.state.maxAppleHP = 50;
    this.state.clickLevel = 0;
    this.state.worms = { ...INITIAL_STATE.worms };
    
    this.audio.playAscension();
    this.saveGame();
  }

  public setMuted(muted: boolean) {
    this.state.settings.muted = muted;
    this.audio.setMuted(muted);
    this.saveGame();
  }

  public setVolume(volume: number) {
    this.state.settings.volume = volume;
    this.audio.setVolume(volume);
    this.saveGame();
  }

  public setLanguage(lang: Language) {
    this.state.settings.language = lang;
    this.localization.setLanguage(lang);
    this.saveGame();
  }

  public activateSkill(skillId: string) {
    if (skillId === 'golden_harvest') {
      this.skills.activateSkill(skillId, 20, 120);
      this.audio.playUpgrade(); // Use upgrade sound for skill activation for now
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

  public exportSave(): string {
    const dataStr = JSON.stringify(this.state);
    
    // Simple checksum for basic anti-cheat
    let checksum = 0;
    for (let i = 0; i < dataStr.length; i++) {
      checksum = ((checksum << 5) - checksum) + dataStr.charCodeAt(i);
      checksum |= 0;
    }
    
    const saveObj = { data: this.state, hash: checksum };
    return btoa(JSON.stringify(saveObj));
  }

  public importSave(saveStr: string): boolean {
    try {
      const decoded = atob(saveStr);
      const saveObj = JSON.parse(decoded);
      
      if (!saveObj.data || saveObj.hash === undefined) return false;
      
      const dataStr = JSON.stringify(saveObj.data);
      let checksum = 0;
      for (let i = 0; i < dataStr.length; i++) {
        checksum = ((checksum << 5) - checksum) + dataStr.charCodeAt(i);
        checksum |= 0;
      }
      
      if (checksum !== saveObj.hash) return false;
      
      // Sanity checks
      const data = saveObj.data;
      if (typeof data.gold !== 'number' || data.gold < 0 || data.gold > 1e100) return false;
      if (typeof data.stage !== 'number' || data.stage < 1 || data.stage > 1000000) return false;
      if (typeof data.totalClicks !== 'number' || data.totalClicks < 0) return false;
      
      this.state = { 
        ...INITIAL_STATE, 
        ...data, 
        worms: { ...INITIAL_STATE.worms, ...(data.worms || {}) },
        skills: { ...INITIAL_STATE.skills, ...(data.skills || {}) },
        settings: { ...INITIAL_STATE.settings, ...(data.settings || {}) } 
      };
      
      this.saveGame();
      return true;
    } catch (e) {
      return false;
    }
  }

  public resetGame() {
    this.state = { ...INITIAL_STATE, settings: this.state.settings };
    this.saveGame();
  }
}
