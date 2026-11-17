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
import { ABYSS_THRESHOLD, Decimal, isFiniteDecimal, percentOf, toDecimal } from '@/lib/game/num';
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

describe('num (camada Decimal)', () => {
  it('toDecimal aceita number, string do JSON e null de Infinity', () => {
    expect(toDecimal(42).toNumber()).toBe(42);
    expect(toDecimal('1e400').exponent).toBe(400);
    expect(toDecimal(null).eq(ABYSS_THRESHOLD)).toBe(true);
    expect(toDecimal(Infinity).eq(ABYSS_THRESHOLD)).toBe(true);
    expect(toDecimal('Infinity').eq(ABYSS_THRESHOLD)).toBe(true);
  });

  it('toDecimal usa o fallback para NaN, negativos e lixo', () => {
    const fb = new Decimal(7);
    expect(toDecimal(Number.NaN, fb).toNumber()).toBe(7);
    expect(toDecimal(-5, fb).toNumber()).toBe(7);
    expect(toDecimal('abc', fb).toNumber()).toBe(7);
    expect(toDecimal({}, fb).toNumber()).toBe(7);
  });

  it('percentOf nunca devolve NaN', () => {
    expect(percentOf(new Decimal(50), new Decimal(200))).toBe(25);
    expect(percentOf(new Decimal(10), new Decimal(0))).toBe(0);
    expect(percentOf(new Decimal('1e500'), new Decimal('2e500'))).toBe(50);
    expect(percentOf(new Decimal(300), new Decimal(100))).toBe(100);
  });

  it('Decimal faz ida e volta pelo JSON como string', () => {
    const json = JSON.stringify({ gold: new Decimal('1.5e400') });
    expect(JSON.parse(json).gold).toBe('1.5e+400');
    expect(toDecimal(JSON.parse(json).gold).eq(new Decimal('1.5e400'))).toBe(true);
  });
});

describe('calculateMaxAppleHP', () => {
  it('nunca vira Infinity, nem no estágio 1742 ou além', () => {
    for (const stage of [1, 82, 373, 560, 1741, 1742, 5000, 1_000_000]) {
      const hp = calculateMaxAppleHP(stage);
      expect(isFiniteDecimal(hp)).toBe(true);
      expect(hp.gt(0)).toBe(true);
    }
  });
});

describe('migrateSave', () => {
  it('migra save v1 (sem saveVersion) para a versão atual', () => {
    const migrated = migrateSave(legacySave());
    expect(CURRENT_SAVE_VERSION).toBe(4);
    expect(migrated.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(migrated.stage).toBe(373);
    expect(migrated.gold).toBeInstanceOf(Decimal);
    expect(migrated.gold?.toNumber()).toBeCloseTo(4.369228365394481e64, -50);
    expect(migrated.statistics?.totalGoldEarned).toBeInstanceOf(Decimal);
    expect(migrated.settings?.notation).toBe('mixed');
    expect(migrated.settings?.language).toBe('pt');
  });

  it('v1/v2 → v4: recalcula o HP pela curva nova mantendo a porcentagem', () => {
    const migrated = migrateSave(legacySave({ saveVersion: 2 }));
    const max = calculateMaxAppleHP(373);
    expect(migrated.maxAppleHP?.eq(max)).toBe(true);
    const oldRatio = 6.4766238087514286e66 / 1.6029440842264702e67;
    expect(migrated.appleHP?.div(max).toNumber()).toBeCloseTo(oldRatio, 6);
  });

  it('v3 → v4: mantém o HP (já na curva nova) e converte para Decimal', () => {
    const max = calculateMaxAppleHP(373).toNumber();
    const migrated = migrateSave(legacySave({ saveVersion: 3, maxAppleHP: max, appleHP: max / 2 }));
    expect(migrated.maxAppleHP?.toNumber()).toBe(max);
    expect(migrated.appleHP?.toNumber()).toBe(max / 2);
    expect(migrated.abyssDepth).toBeUndefined();
  });

  it('v4: lê os valores gravados como string acima de 1e308', () => {
    const migrated = migrateSave(
      legacySave({
        saveVersion: 4,
        stage: 8000,
        gold: '3.2e400',
        maxAppleHP: calculateMaxAppleHP(8000).toString(),
        appleHP: calculateMaxAppleHP(8000).div(2).toString(),
        abyssDepth: 2,
        statistics: { totalGoldEarned: '1e401' },
      }),
    );
    expect(migrated.gold?.exponent).toBe(400);
    expect(migrated.maxAppleHP?.eq(calculateMaxAppleHP(8000))).toBe(true);
    expect(migrated.abyssDepth).toBe(2);
    expect(migrated.statistics?.totalGoldEarned.exponent).toBe(401);
  });

  it('recupera campos que viraram null (Infinity serializado pelo JSON)', () => {
    const raw = JSON.parse(
      JSON.stringify(legacySave({ gold: Infinity, appleHP: Infinity, maxAppleHP: Infinity })),
    );
    expect(raw.gold).toBeNull();
    const migrated = migrateSave(raw);
    expect(migrated.gold?.eq(ABYSS_THRESHOLD)).toBe(true);
    expect(migrated.maxAppleHP?.eq(calculateMaxAppleHP(373))).toBe(true);
    expect(migrated.appleHP?.eq(migrated.maxAppleHP as Decimal)).toBe(true);
  });

  it('descarta valores inválidos nos worms e nas estatísticas', () => {
    const migrated = migrateSave(
      legacySave({
        worms: { small_worm: -3, hungry_worm: 'x', fat_worm: 2.7 },
        statistics: { totalGoldEarned: 'lixo', totalClicks: 5 },
        stage: 'abc',
        abyssDepth: -1,
      }),
    );
    expect(migrated.worms).toEqual({ small_worm: 0, hungry_worm: 0, fat_worm: 2 });
    expect(migrated.statistics?.totalGoldEarned.toNumber()).toBe(0);
    expect(migrated.statistics?.totalClicks).toBe(5);
    expect(migrated.stage).toBe(1);
    expect(migrated.abyssDepth).toBe(0);
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

  it('carrega um save antigo do localStorage e grava como v4 (strings)', () => {
    mockStorage[SAVE_KEY] = JSON.stringify(legacySave());
    const engine = new GameEngine();
    expect(engine.getState().stage).toBe(373);
    expect(engine.getState().gold).toBeInstanceOf(Decimal);
    expect(engine.getState().abyssDepth).toBe(0);
    expect(engine.getState().settings.notation).toBe('mixed');
    engine.saveGame();
    const saved = JSON.parse(mockStorage[SAVE_KEY]);
    expect(saved.saveVersion).toBe(CURRENT_SAVE_VERSION);
    expect(typeof saved.gold).toBe('string');
  });

  it('carrega um save corrompido por Infinity sem quebrar', () => {
    mockStorage[SAVE_KEY] = JSON.stringify(legacySave({ gold: null, maxAppleHP: null }));
    const engine = new GameEngine();
    expect(isFiniteDecimal(engine.getState().gold)).toBe(true);
    expect(isFiniteDecimal(engine.getState().maxAppleHP)).toBe(true);
  });

  it('exporta e importa saves acima de 1e100 e de 1e308', async () => {
    mockStorage[SAVE_KEY] = JSON.stringify(
      legacySave({ saveVersion: 4, stage: 600, highestStage: 600, gold: '1e450' }),
    );
    const source = new GameEngine();
    const save = await source.exportSave();
    mockStorage = {};
    const target = new GameEngine();
    expect(await target.importSave(save)).toBe(true);
    expect(target.getState().gold.eq('1e450')).toBe(true);
    expect(target.getState().stage).toBe(600);
  });

  it('dano gigante não gera Infinity nem NaN, e o save continua legível', () => {
    mockStorage[SAVE_KEY] = JSON.stringify(
      legacySave({ gold: Number.MAX_VALUE, clickLevel: 5000, stage: 1741, highestStage: 1741 }),
    );
    const engine = new GameEngine();
    for (let i = 0; i < 5; i++) engine.clickApple();
    const s = engine.getState();
    expect(isFiniteDecimal(s.gold)).toBe(true);
    expect(isFiniteDecimal(s.appleHP)).toBe(true);
    expect(isFiniteDecimal(s.maxAppleHP)).toBe(true);
    engine.saveGame();
    const saved = JSON.parse(mockStorage[SAVE_KEY]);
    expect(saved.gold).not.toBeNull();
    expect(saved.maxAppleHP).not.toBeNull();
  });
});

describe('Abismo (1,79e308)', () => {
  beforeEach(() => {
    mockStorage = {};
  });

  it('não deixa mergulhar abaixo de 1,79e308', () => {
    const engine = new GameEngine();
    engine.getState().gold = new Decimal('1e308');
    expect(engine.canDiveAbyss()).toBe(false);
    expect(engine.diveAbyss()).toBe(false);
    expect(engine.getState().abyssDepth).toBe(0);
  });

  it('mergulho: profundidade +1, ×2 permanente, zera corrida e Lucky Worms', () => {
    const engine = new GameEngine();
    const s = engine.getState();
    s.gold = new Decimal(Number.MAX_VALUE);
    s.stage = 7300;
    s.highestStage = 7300;
    s.clickLevel = 900;
    s.luckyWorms = 5000;
    s.worms.small_worm = 50;
    const baseMultiplier = engine.getGoldMultiplier();

    expect(engine.canDiveAbyss()).toBe(true);
    expect(engine.diveAbyss()).toBe(true);

    const after = engine.getState();
    expect(after.abyssDepth).toBe(1);
    expect(engine.getAbyssMultiplier().toNumber()).toBe(2);
    expect(after.gold.toNumber()).toBe(0);
    expect(after.stage).toBe(1);
    expect(after.clickLevel).toBe(0);
    expect(after.luckyWorms).toBe(0);
    expect(after.worms.small_worm).toBe(0);
    expect(after.highestStage).toBe(7300);
    // Sem Lucky Worms, o multiplicador de ouro é só o do Abismo.
    expect(engine.getGoldMultiplier().toNumber()).toBe(2);
    expect(baseMultiplier.gt(2)).toBe(true);
    // Dano do clique base (1) dobra.
    expect(engine.getClickDamage().toNumber()).toBe(2);
  });

  it('a profundidade fica no save', () => {
    const engine = new GameEngine();
    engine.getState().gold = new Decimal('1e309');
    engine.diveAbyss();
    const saved = JSON.parse(mockStorage[SAVE_KEY]);
    expect(saved.abyssDepth).toBe(1);
    const reloaded = new GameEngine();
    expect(reloaded.getState().abyssDepth).toBe(1);
  });
});
