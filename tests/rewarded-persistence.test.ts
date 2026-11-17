import { describe, expect, it } from 'vitest';
import {
  emptyRewardedState,
  loadRewardedState,
  REWARDED_STORAGE_KEY,
  sanitizeRewardedState,
  saveRewardedState,
  secondsUntil,
} from '@/lib/ads/rewarded-persistence';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

const NOW = 1_700_000_000_000;

describe('rewarded persistence', () => {
  it('salva e carrega (sobrevive ao reload)', () => {
    const storage = memoryStorage();
    const state = emptyRewardedState();
    state.cooldownUntil.gold_boost = NOW + 200_000;
    state.goldBoostUntil = NOW + 40_000;
    saveRewardedState(state, storage);
    expect(storage.data[REWARDED_STORAGE_KEY]).toBeDefined();
    const loaded = loadRewardedState(NOW + 1000, storage);
    expect(loaded.cooldownUntil.gold_boost).toBe(NOW + 200_000);
    expect(loaded.goldBoostUntil).toBe(NOW + 40_000);
    expect(secondsUntil(loaded.cooldownUntil.gold_boost, NOW + 1000)).toBe(199);
  });

  it('descarta valores vencidos, inválidos e JSON corrompido', () => {
    const state = sanitizeRewardedState(
      {
        cooldownUntil: { gold_boost: NOW - 1, instant_harvest: 'x', reset_cooldown: Number.NaN },
        goldBoostUntil: null,
      },
      NOW,
    );
    expect(state).toEqual(emptyRewardedState());
    expect(loadRewardedState(NOW, memoryStorage({ [REWARDED_STORAGE_KEY]: '{oops' }))).toEqual(
      emptyRewardedState(),
    );
    expect(sanitizeRewardedState('lixo', NOW)).toEqual(emptyRewardedState());
  });

  it('limita valores no futuro ao cooldown real (relógio ou storage mexido)', () => {
    const state = sanitizeRewardedState(
      { cooldownUntil: { reset_cooldown: NOW + 10 ** 12 }, goldBoostUntil: NOW + 10 ** 12 },
      NOW,
    );
    expect(state.cooldownUntil.reset_cooldown).toBe(NOW + 180_000);
    expect(state.goldBoostUntil).toBe(NOW + 60_000);
  });

  it('sem storage não quebra', () => {
    expect(loadRewardedState(NOW, null)).toEqual(emptyRewardedState());
    expect(() => saveRewardedState(emptyRewardedState(), null)).not.toThrow();
  });
});
