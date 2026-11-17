import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { REWARDED_CONFIG } from '@/lib/game/constants';
import { GameEngine } from '@/lib/game/engine';

vi.mock('@/lib/game/audio', () => ({
  AudioSystem: class MockAudioSystem {
    playClick = vi.fn();
    playBreak = vi.fn();
    playUpgrade = vi.fn();
    playAscension = vi.fn();
    setMuted = vi.fn();
    setVolume = vi.fn();
    destroy = vi.fn();
  },
}));

describe('2x Gold Boost no motor', () => {
  let engine: GameEngine;

  beforeEach(() => {
    localStorage.clear();
    engine = new GameEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  it('dura REWARDED_CONFIG.goldBoostDurationSeconds (60 s) e dobra o gold', () => {
    const now = 1_000_000;
    const until = engine.activateGoldBoost(now);
    expect(until - now).toBe(REWARDED_CONFIG.goldBoostDurationSeconds * 1000);
    expect(REWARDED_CONFIG.goldBoostDurationSeconds).toBe(60);
    expect(engine.getGoldBoostMultiplier(now)).toBe(2);
    expect(engine.getGoldBoostMultiplier(until - 1)).toBe(2);
    expect(engine.getGoldBoostMultiplier(until)).toBe(1);
    expect(engine.getGoldBoostRemainingSeconds(now)).toBe(60);
    expect(engine.getGoldBoostRemainingSeconds(until + 5)).toBe(0);
  });

  it('um clique com boost rende o dobro de gold de um clique sem boost', () => {
    const before = engine.getState().gold;
    engine.clickApple();
    const normal = engine.getState().gold.sub(before);
    expect(normal.gt(0)).toBe(true);

    engine.activateGoldBoost();
    const mid = engine.getState().gold;
    engine.clickApple();
    const boosted = engine.getState().gold.sub(mid);
    expect(boosted.eq(normal.mul(2))).toBe(true);
  });

  it('não entra no multiplicador usado por offline e Instant Harvest', () => {
    const base = engine.getGoldMultiplier();
    engine.activateGoldBoost();
    expect(engine.getGoldMultiplier().eq(base)).toBe(true);
  });

  it('setGoldBoostUntil restaura o boost salvo e ignora valores inválidos', () => {
    const now = Date.now();
    engine.setGoldBoostUntil(now + 30_000);
    expect(engine.getGoldBoostMultiplier(now)).toBe(2);
    engine.setGoldBoostUntil(Number.NaN);
    expect(engine.getGoldBoostMultiplier(now)).toBe(1);
    engine.setGoldBoostUntil(-5);
    expect(engine.getGoldBoostMultiplier(now)).toBe(1);
  });
});
