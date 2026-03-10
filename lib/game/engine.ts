import { GameState, Language, WormUpgrade } from './types';
import { INITIAL_STATE, WORM_UPGRADES } from './constants';
import { AudioSystem } from './audio';
import { LocalizationSystem } from './localization';

export class GameEngine {
  private state: GameState;
  private audio: AudioSystem;
  private localization: LocalizationSystem;
  private lastTick: number = Date.now();
  private saveInterval: any;

  constructor() {
    this.state = this.loadGame();
    this.audio = new AudioSystem(this.state.settings.muted, this.state.settings.volume);
    this.localization = new LocalizationSystem(this.state.settings.language);
    
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
        return { ...INITIAL_STATE, ...parsed, settings: { ...INITIAL_STATE.settings, ...parsed.settings } };
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
    const offlineTimeMs = now - this.state.lastSaveTimestamp;
    if (offlineTimeMs < 10000) return; // Less than 10 seconds, ignore

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
    const soulBonus = 1 + (this.state.gardenersSouls * 0.1); // 10% per soul
    return this.state.clickDamage * soulBonus;
  }

  public getTotalDPS(): number {
    let dps = 0;
    WORM_UPGRADES.forEach(upgrade => {
      const count = this.state.worms[upgrade.id] || 0;
      dps += count * upgrade.baseDPS;
    });
    const soulBonus = 1 + (this.state.gardenersSouls * 0.1);
    return dps * soulBonus;
  }

  public getGoldMultiplier(): number {
    return 1 + (this.state.gardenersSouls * 0.05); // 5% per soul
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
    // Cost increases by 15% per level
    return Math.floor(upgrade.baseCost * Math.pow(1.15, count));
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
    this.state.gardenersSouls += souls;
    
    // Reset progress
    this.state.gold = 0;
    this.state.stage = 1;
    this.state.appleHP = 50;
    this.state.maxAppleHP = 50;
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

  public getState(): GameState {
    return this.state;
  }

  public getAudio(): AudioSystem {
    return this.audio;
  }

  public getLocalization(): LocalizationSystem {
    return this.localization;
  }
}
