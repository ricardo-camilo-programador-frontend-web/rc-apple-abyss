import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage — always returns null to force fresh state
let mockStorage: Record<string, string> = {};

Object.defineProperty(globalThis, 'window', {
  value: {
    matchMedia: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  get: () => ({
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; },
  }),
  configurable: true,
});

// Mock AudioSystem
vi.mock('@/lib/game/audio', () => ({
  AudioSystem: vi.fn().mockImplementation(() => ({
    playClick: vi.fn(),
    playBreak: vi.fn(),
    playUpgrade: vi.fn(),
    playAscension: vi.fn(),
    setMuted: vi.fn(),
    setVolume: vi.fn(),
    destroy: vi.fn(),
  })),
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
        arr[i] = str.charCodeAt(i) & 0xFF;
      }
      return arr;
    }
  },
  writable: true,
  configurable: true,
});
// Mock setInterval to prevent auto-save interference
global.setInterval = vi.fn(() => 1 as any) as any;
global.clearInterval = vi.fn() as any;

import { GameEngine } from '@/lib/game/engine';
import { GAME_CONFIG } from '@/lib/game/constants';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    mockStorage = {};
    engine = new GameEngine();
  });

  describe('Initial State', () => {
    it('should start with 0 gold', () => {
      expect(engine.getState().gold).toBe(0);
    });

    it('should start at stage 1', () => {
      expect(engine.getState().stage).toBe(1);
    });

    it('should have initial apple HP from GAME_CONFIG', () => {
      expect(engine.getState().appleHP).toBe(GAME_CONFIG.INITIAL_HP);
      expect(engine.getState().maxAppleHP).toBe(GAME_CONFIG.INITIAL_HP);
    });

    it('should start with 0 lucky worms', () => {
      expect(engine.getState().luckyWorms).toBe(0);
    });

    it('should start with 0 total clicks', () => {
      expect(engine.getState().totalClicks).toBe(0);
    });

    it('should have 0 worms of each type', () => {
      const worms = engine.getState().worms;
      for (const count of Object.values(worms)) {
        expect(count).toBe(0);
      }
    });
  });

  describe('Click Mechanics', () => {
    it('should increment totalClicks on clickApple', () => {
      engine.clickApple();
      expect(engine.getState().totalClicks).toBe(1);
    });

    it('should deal damage to apple on click', () => {
      const initialHP = engine.getState().appleHP;
      engine.clickApple();
      expect(engine.getState().appleHP).toBeLessThan(initialHP);
    });

    it('should earn gold on click', () => {
      engine.clickApple();
      expect(engine.getState().gold).toBeGreaterThan(0);
    });

    it('should increase click damage after buying upgrade', () => {
      const baseDamage = engine.getClickDamage();
      engine.getState().gold = 1000;
      engine.buyClickUpgrade();
      expect(engine.getClickDamage()).toBeGreaterThan(baseDamage);
    });

    it('should not buy click upgrade without enough gold', () => {
      // Ensure fresh state with 0 gold
      expect(engine.getState().gold).toBe(0);
      const result = engine.buyClickUpgrade();
      expect(result).toBe(false);
      expect(engine.getState().clickLevel).toBe(0);
    });
  });

  describe('Upgrade System', () => {
    it('should buy upgrade when enough gold', () => {
      engine.getState().gold = 100;
      engine.buyUpgrade('small_worm');
      expect(engine.getState().worms.small_worm).toBe(1);
    });

    it('should deduct gold on purchase', () => {
      engine.getState().gold = 100;
      const cost = engine.getUpgradeCost('small_worm');
      engine.buyUpgrade('small_worm');
      expect(engine.getState().gold).toBe(100 - cost);
    });

    it('should not buy upgrade without enough gold', () => {
      // Verify fresh state
      expect(engine.getState().gold).toBe(0);
      expect(engine.getState().worms.small_worm).toBe(0);
      engine.buyUpgrade('small_worm');
      expect(engine.getState().worms.small_worm).toBe(0);
    });

    it('should increase cost after each purchase', () => {
      // Get cost at count=0
      const cost0 = engine.getUpgradeCost('small_worm');
      // Manually set count and get cost at count=1
      engine.getState().worms.small_worm = 1;
      const cost1 = engine.getUpgradeCost('small_worm');
      expect(cost1).toBeGreaterThan(cost0);
    });

    it('should calculate worm DPS correctly', () => {
      engine.getState().worms.small_worm = 1;
      const dps = engine.getWormDPS('small_worm');
      expect(dps).toBeGreaterThan(0);
    });

    it('should return 0 DPS for unpurchased worms', () => {
      expect(engine.getWormDPS('small_worm')).toBe(0);
    });
  });

  describe('Stage Progression', () => {
    it('should advance stage when apple HP reaches 0', () => {
      engine.getState().appleHP = 1;
      engine.clickApple();
      expect(engine.getState().stage).toBe(2);
    });

    it('should increase max HP on stage advance', () => {
      const initialMaxHP = engine.getState().maxAppleHP;
      engine.getState().appleHP = 1;
      engine.clickApple();
      expect(engine.getState().maxAppleHP).toBeGreaterThan(initialMaxHP);
    });

    it('should track highest stage', () => {
      engine.getState().appleHP = 1;
      engine.clickApple();
      expect(engine.getState().highestStage).toBe(2);
    });

    it('should reset apple HP to new max on advance', () => {
      engine.getState().appleHP = 1;
      engine.clickApple();
      expect(engine.getState().appleHP).toBe(engine.getState().maxAppleHP);
    });
  });

  describe('Ascension', () => {
    it('should not allow ascension below configured stage', () => {
      expect(engine.canAscend()).toBe(false);
    });

    it('should allow ascension at configured stage', () => {
      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE;
      expect(engine.canAscend()).toBe(true);
    });

    it('should grant lucky worms on ascension', () => {
      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE;
      engine.getState().highestStage = 100;
      const pendingWorms = engine.getPendingLuckyWorms();
      engine.ascend();
      expect(engine.getState().luckyWorms).toBe(pendingWorms);
    });

    it('should reset progress on ascension', () => {
      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE;
      engine.getState().gold = 99999;
      engine.ascend();
      expect(engine.getState().gold).toBe(0);
      expect(engine.getState().stage).toBe(1);
      expect(engine.getState().clickLevel).toBe(0);
    });

    it('should preserve lucky worms across ascensions', () => {
      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE;
      engine.getState().highestStage = 100;
      engine.ascend();
      const firstWorms = engine.getState().luckyWorms;

      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE;
      engine.getState().highestStage = 200;
      engine.ascend();
      expect(engine.getState().luckyWorms).toBeGreaterThan(firstWorms);
    });
  });

  describe('Gold Multiplier', () => {
    it('should have base multiplier of 1 with 0 lucky worms', () => {
      // Ensure no lucky worms
      engine.getState().luckyWorms = 0;
      expect(engine.getGoldMultiplier()).toBe(1);
    });

    it('should increase gold multiplier with lucky worms', () => {
      engine.getState().luckyWorms = 0;
      const baseMultiplier = engine.getGoldMultiplier();
      engine.getState().luckyWorms = 10;
      expect(engine.getGoldMultiplier()).toBeGreaterThan(baseMultiplier);
    });

    it('should give 5% bonus per lucky worm', () => {
      engine.getState().luckyWorms = 10;
      // 1 + (10 * 0.05) = 1.5
      expect(engine.getGoldMultiplier()).toBeCloseTo(1.5, 5);
    });
  });

  describe('Save System', () => {
    it('should export save as a base64 string', async () => {
      const save = await engine.exportSave();
      expect(typeof save).toBe('string');
      expect(save.length).toBeGreaterThan(0);
    });

    it('should import a valid save', async () => {
      engine.getState().gold = 5000;
      engine.getState().stage = 10;
      const save = await engine.exportSave();

      // Clear and create fresh engine
      mockStorage = {};
      const engine2 = new GameEngine();
      const result = await engine2.importSave(save);

      expect(result).toBe(true);
      expect(engine2.getState().gold).toBe(5000);
      expect(engine2.getState().stage).toBe(10);
    });

    it('should reject corrupted save data', async () => {
      const result = await engine.importSave('!!!invalid-base64!!!');
      expect(result).toBe(false);
    });

    it('should reject save with mismatched checksum', async () => {
      const save = await engine.exportSave();
      const tampered = save.slice(0, -5) + 'XXXXX';
      const result = await engine.importSave(tampered);
      expect(result).toBe(false);
    });
  });

  describe('GAME_CONFIG Integration', () => {
    it('should use GAME_CONFIG.INITIAL_HP for starting HP', () => {
      expect(engine.getState().appleHP).toBe(GAME_CONFIG.INITIAL_HP);
    });

    it('should use GAME_CONFIG.HP_GROWTH for stage scaling', () => {
      // Calculate expected HP at stage 2
      const expectedHP = Math.floor(GAME_CONFIG.INITIAL_HP * Math.pow(GAME_CONFIG.HP_GROWTH, 1));
      // Force stage advance
      engine.getState().appleHP = 1;
      engine.clickApple();
      expect(engine.getState().maxAppleHP).toBe(expectedHP);
    });

    it('should use GAME_CONFIG.CLICK_UPGRADE_BASE_COST for first upgrade', () => {
      const cost = engine.getClickUpgradeCost();
      expect(cost).toBe(GAME_CONFIG.CLICK_UPGRADE_BASE_COST);
    });

    it('should use GAME_CONFIG.ASCENSION_STAGE threshold', () => {
      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE - 1;
      expect(engine.canAscend()).toBe(false);
      engine.getState().stage = GAME_CONFIG.ASCENSION_STAGE;
      expect(engine.canAscend()).toBe(true);
    });
  });

  describe('resetGame', () => {
    it('should reset gold to 0', () => {
      engine.getState().gold = 5000;
      engine.resetGame();
      expect(engine.getState().gold).toBe(0);
    });

    it('should reset stage to 1', () => {
      engine.getState().stage = 100;
      engine.resetGame();
      expect(engine.getState().stage).toBe(1);
    });

    it('should reset worms to 0', () => {
      engine.getState().worms.small_worm = 10;
      engine.resetGame();
      expect(engine.getState().worms.small_worm).toBe(0);
    });

    it('should NOT mutate INITIAL_STATE (shared reference bug regression)', () => {
      engine.getState().worms.small_worm = 99;
      engine.getState().gold = 9999;
      engine.resetGame();
      // Create a second engine — it should NOT have the mutated values
      mockStorage = {};
      const engine2 = new GameEngine();
      expect(engine2.getState().worms.small_worm).toBe(0);
      expect(engine2.getState().gold).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should clean up without errors', () => {
      expect(() => engine.destroy()).not.toThrow();
    });
  });
});
