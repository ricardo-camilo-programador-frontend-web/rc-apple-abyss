import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage — always returns null to force fresh state
let mockStorage: Record<string, string> = {};

Object.defineProperty(globalThis, 'window', {
  value: {
    matchMedia: vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  get: () => ({
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      mockStorage = {};
    },
  }),
  configurable: true,
});

// Mock AudioSystem
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

// Mock crypto.subtle for SHA-256 in save system
const mockCryptoSubtle = {
  digest: async (algorithm: string, data: Uint8Array): Promise<ArrayBuffer> => {
    // Simple mock hash — just XOR all bytes for testing (not real SHA-256)
    const result = new ArrayBuffer(32);
    const view = new Uint8Array(result);
    const dataBytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    for (let i = 0; i < dataBytes.length; i++) {
      view[i % 32] ^= dataBytes[i];
    }
    return result;
  },
};

Object.defineProperty(globalThis, 'crypto', {
  value: { subtle: mockCryptoSubtle },
  writable: true,
  configurable: true,
});

// Mock TextEncoder
Object.defineProperty(globalThis, 'TextEncoder', {
  value: class MockTextEncoder {
    encode(str: string): Uint8Array {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i) & 0xff;
      }
      return arr;
    }
  },
  writable: true,
  configurable: true,
});
// Mock setInterval to prevent auto-save interference
global.setInterval = vi.fn(() => 1) as unknown as typeof setInterval;

import { calculateMaxAppleHP } from '@/lib/game/balance';
import { GameEngine } from '@/lib/game/engine';
import { clampFinite, safePercent } from '@/lib/game/safe-number';
import { CURRENT_SAVE_VERSION, migrateSave } from '@/lib/game/save-migration';

const SAVE_KEY = 'apple_clicker_save';

/** Save no formato da v0.2.1 (sem saveVersion e sem settings.notation). */
function legacySave(overrides: Record<string, unknown> = {}) {
  return {
    gold: 4.369228365394481e64,
    stage: 373,
    appleHP: 6.4766238087514286e66,
    maxAppleHP: 1.6029440842264702e67,
    clickDamage: 1,
    clickLevel: 516,
    totalClicks: 98765,
    totalApplesEaten: 372,
    luckyWorms: 1,
    highestStage: 373,
    lastSaveTimestamp: Date.now(),
    worms: { small_worm: 42, infinite_worm: 145 },
    skills: { golden_harvest: { isActive: false, remainingDuration: 0, cooldownRemaining: 0 } },
    statistics: { totalClicks: 98765, totalApplesEaten: 372, totalGoldEarned: 9.9e64 },
    settings: { language: 'pt', muted: true, volume: 0.5 },
    ...overrides,
  };
}

describe('safe-number', () => {
  it('limita Infinity ao maior number finito e NaN ao fallback', () => {
    expect(clampFinite(Infinity)).toBe(Number.MAX_VALUE);
    expect(clampFinite(-Infinity)).toBe(-Number.MAX_VALUE);
    expect(clampFinite(Number.NaN, 7)).toBe(7);
    expect(clampFinite(42)).toBe(42);
  });

  it('calcula porcentagem segura', () => {
    expect(safePercent(50, 200)).toBe(25);
    expect(safePercent(Number.NaN, 10)).toBe(0);
    expect(safePercent(10, 0)).toBe(0);
    expect(safePercent(Infinity, Infinity)).toBe(100);
    expect(safePercent(300, 100)).toBe(100);
  });
});

describe('calculateMaxAppleHP', () => {
  it('nunca vira Infinity, nem no estágio 1742 ou além', () => {
    for (const stage of [1, 82, 373, 560, 1741, 1742, 5000, 1_000_000]) {
      const hp = calculateMaxAppleHP(stage);
      expect(Number.isFinite(hp)).toBe(true);
      expect(hp).toBeGreaterThan(0);
    }
  });
});

describe('migrateSave', () => {
  it('migra save antigo sem saveVersion mantendo os valores', () => {
    const migrated = migrateSave(legacySave());
    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.stage).toBe(373);
    expect(migrated.gold).toBeCloseTo(4.369228365394481e64, -50);
    expect(migrated.settings?.notation).toBe('mixed');
    expect(migrated.settings?.language).toBe('pt');
  });

  it('recupera campos que viraram null (Infinity serializado pelo JSON)', () => {
    const raw = JSON.parse(
      JSON.stringify(legacySave({ gold: Infinity, appleHP: Infinity, maxAppleHP: Infinity })),
    );
    expect(raw.gold).toBeNull();
    const migrated = migrateSave(raw);
    expect(migrated.gold).toBe(Number.MAX_VALUE);
    expect(Number.isFinite(migrated.maxAppleHP)).toBe(true);
    expect(migrated.appleHP).toBe(migrated.maxAppleHP);
  });

  it('descarta valores inválidos nos worms e nas estatísticas', () => {
    const migrated = migrateSave(
      legacySave({
        worms: { small_worm: -3, hungry_worm: 'x', fat_worm: 2.7 },
        statistics: { totalGoldEarned: null, totalClicks: 5 },
        stage: 'abc',
      }),
    );
    expect(migrated.worms).toEqual({ small_worm: 0, hungry_worm: 0, fat_worm: 2 });
    expect(migrated.statistics?.totalGoldEarned).toBe(Number.MAX_VALUE);
    expect(migrated.statistics?.totalClicks).toBe(5);
    expect(migrated.stage).toBe(1);
  });

  it('ignora entradas que não são objeto', () => {
    expect(migrateSave(null).saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrateSave('lixo').saveVersion).toBe(CURRENT_SAVE_VERSION);
  });
});

describe('GameEngine com saves grandes', () => {
  beforeEach(() => {
    mockStorage = {};
  });

  it('carrega um save antigo do localStorage e grava com saveVersion', () => {
    mockStorage[SAVE_KEY] = JSON.stringify(legacySave());
    const engine = new GameEngine();
    expect(engine.getState().stage).toBe(373);
    expect(engine.getState().settings.notation).toBe('mixed');
    engine.saveGame();
    const saved = JSON.parse(mockStorage[SAVE_KEY]);
    expect(saved.saveVersion).toBe(CURRENT_SAVE_VERSION);
  });

  it('carrega um save corrompido por Infinity sem quebrar', () => {
    mockStorage[SAVE_KEY] = JSON.stringify(legacySave({ gold: null, maxAppleHP: null }));
    const engine = new GameEngine();
    expect(Number.isFinite(engine.getState().gold)).toBe(true);
    expect(Number.isFinite(engine.getState().maxAppleHP)).toBe(true);
  });

  it('importa saves acima de 1e100 (antigo teto do import)', async () => {
    mockStorage[SAVE_KEY] = JSON.stringify(
      legacySave({ stage: 600, highestStage: 600, gold: 1e110, appleHP: 1e106, maxAppleHP: 1e107 }),
    );
    const source = new GameEngine();
    const save = await source.exportSave();
    mockStorage = {};
    const target = new GameEngine();
    expect(await target.importSave(save)).toBe(true);
    expect(target.getState().gold).toBe(1e110);
    expect(target.getState().stage).toBe(600);
  });

  it('não deixa ouro nem HP virarem Infinity ou NaN com dano gigante', () => {
    mockStorage[SAVE_KEY] = JSON.stringify(
      legacySave({ gold: Number.MAX_VALUE, clickLevel: 5000, stage: 1741, highestStage: 1741 }),
    );
    const engine = new GameEngine();
    for (let i = 0; i < 5; i++) engine.clickApple();
    const s = engine.getState();
    expect(Number.isFinite(s.gold)).toBe(true);
    expect(Number.isFinite(s.appleHP)).toBe(true);
    expect(Number.isFinite(s.maxAppleHP)).toBe(true);
    expect(Number.isNaN(s.appleHP)).toBe(false);
    engine.saveGame();
    const saved = JSON.parse(mockStorage[SAVE_KEY]);
    expect(saved.gold).not.toBeNull();
    expect(saved.maxAppleHP).not.toBeNull();
  });
});
