import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type AdConfigOptions,
  H5_ADS_SCRIPT_CLIENT,
  h5ScriptAttributes,
  type RewardPlacementConfig,
  requestRewardedAd,
  resolveH5AdsConfig,
} from '@/lib/ads/h5-games';

const CLIENT = H5_ADS_SCRIPT_CLIENT;

describe('resolveH5AdsConfig', () => {
  it('fica desligado sem env', () => {
    expect(resolveH5AdsConfig({})).toMatchObject({ enabled: false, reason: 'disabled' });
    expect(resolveH5AdsConfig({ enabled: 'false', client: CLIENT }).enabled).toBe(false);
  });

  it('exige client válido e igual ao do script AdSense', () => {
    expect(resolveH5AdsConfig({ enabled: 'true' }).reason).toBe('missing-client');
    expect(resolveH5AdsConfig({ enabled: 'true', client: 'pub-123' }).reason).toBe(
      'invalid-client',
    );
    expect(resolveH5AdsConfig({ enabled: 'true', client: 'ca-pub-1234567890123456' }).reason).toBe(
      'client-mismatch',
    );
  });

  it('liga com enabled=true e o client do site; test só com flag', () => {
    expect(resolveH5AdsConfig({ enabled: 'true', client: CLIENT })).toEqual({
      enabled: true,
      client: CLIENT,
      test: false,
      reason: null,
    });
    expect(resolveH5AdsConfig({ enabled: 'true', client: CLIENT, test: 'on' }).test).toBe(true);
  });
});

describe('h5ScriptAttributes', () => {
  it('só põe data-adbreak-test com o modo de teste ligado', () => {
    expect(h5ScriptAttributes(resolveH5AdsConfig({}))).toEqual({});
    expect(h5ScriptAttributes(resolveH5AdsConfig({ enabled: 'true', client: CLIENT }))).toEqual({});
    expect(
      h5ScriptAttributes(resolveH5AdsConfig({ enabled: 'true', client: CLIENT, test: 'on' })),
    ).toEqual({ 'data-adbreak-test': 'on' });
    // Teste sem ENABLED não liga nada.
    expect(h5ScriptAttributes(resolveH5AdsConfig({ test: 'on' }))).toEqual({});
  });
});

function capture() {
  const pushed: Array<RewardPlacementConfig | AdConfigOptions> = [];
  const push = (config: RewardPlacementConfig | AdConfigOptions) => {
    pushed.push(config);
  };
  const placement = () => pushed[0] as RewardPlacementConfig;
  return { push, pushed, placement };
}

function handlers() {
  return {
    onReady: vi.fn(),
    onViewed: vi.fn(),
    onDone: vi.fn(),
    onBeforeAd: vi.fn(),
    onAfterAd: vi.fn(),
  };
}

describe('requestRewardedAd', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('envia um adBreak do tipo reward com todos os callbacks', () => {
    const { push, placement } = capture();
    requestRewardedAd('free_rewards_gold_boost', handlers(), { push });
    const p = placement();
    expect(p.type).toBe('reward');
    expect(p.name).toBe('free_rewards_gold_boost');
    for (const fn of [
      'beforeAd',
      'afterAd',
      'beforeReward',
      'adDismissed',
      'adViewed',
      'adBreakDone',
    ] as const) {
      expect(typeof p[fn]).toBe('function');
    }
  });

  it('fluxo completo: convite, clique, anúncio assistido → recompensa uma vez', () => {
    const { push, placement } = capture();
    const h = handlers();
    requestRewardedAd('x', h, { push });
    const showAdFn = vi.fn();
    placement().beforeReward(showAdFn);
    expect(h.onReady).toHaveBeenCalledTimes(1);
    expect(h.onViewed).not.toHaveBeenCalled();

    const showAd = h.onReady.mock.calls[0][0] as () => void;
    showAd();
    expect(showAdFn).toHaveBeenCalledTimes(1);

    placement().beforeAd();
    placement().adViewed();
    placement().adViewed();
    placement().afterAd();
    placement().adBreakDone({ breakStatus: 'viewed' });
    expect(h.onBeforeAd).toHaveBeenCalledTimes(1);
    expect(h.onViewed).toHaveBeenCalledTimes(1);
    expect(h.onAfterAd).toHaveBeenCalledTimes(1);
    expect(h.onDone).toHaveBeenCalledWith('viewed', 'viewed');
  });

  it('fechar antes do fim não dá recompensa', () => {
    const { push, placement } = capture();
    const h = handlers();
    requestRewardedAd('x', h, { push });
    placement().beforeReward(vi.fn());
    placement().adDismissed();
    placement().adBreakDone({ breakStatus: 'dismissed' });
    expect(h.onViewed).not.toHaveBeenCalled();
    expect(h.onDone).toHaveBeenCalledWith('dismissed', 'dismissed');
  });

  it.each(['notReady', 'frequencyCapped', 'noAdPreloaded', 'error', 'other'])(
    'sem anúncio (%s) → unavailable, sem recompensa',
    (status) => {
      const { push, placement } = capture();
      const h = handlers();
      requestRewardedAd('x', h, { push });
      placement().adBreakDone({ breakStatus: status });
      expect(h.onReady).not.toHaveBeenCalled();
      expect(h.onViewed).not.toHaveBeenCalled();
      expect(h.onDone).toHaveBeenCalledWith('unavailable', status);
    },
  );

  it('breakStatus viewed sem adViewed não entrega recompensa', () => {
    const { push, placement } = capture();
    const h = handlers();
    requestRewardedAd('x', h, { push });
    placement().adBreakDone({ breakStatus: 'viewed' });
    expect(h.onViewed).not.toHaveBeenCalled();
    expect(h.onDone).toHaveBeenCalledWith('unavailable', 'viewed');
  });

  it('sem resposta do Google (script bloqueado) → unavailable por timeout', () => {
    vi.useFakeTimers();
    const { push, placement } = capture();
    const h = handlers();
    requestRewardedAd('x', h, { push, timeoutMs: 1000 });
    vi.advanceTimersByTime(999);
    expect(h.onDone).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(h.onDone).toHaveBeenCalledWith('unavailable', 'timeout');
    // Convite atrasado é ignorado.
    placement().beforeReward(vi.fn());
    expect(h.onReady).not.toHaveBeenCalled();
  });

  it('push que falha → unavailable', () => {
    const h = handlers();
    requestRewardedAd('x', h, {
      push: () => {
        throw new Error('blocked');
      },
    });
    expect(h.onDone).toHaveBeenCalledWith('unavailable', 'error');
    expect(h.onViewed).not.toHaveBeenCalled();
  });

  it('cancel ignora callbacks posteriores', () => {
    const { push, placement } = capture();
    const h = handlers();
    const session = requestRewardedAd('x', h, { push });
    session.cancel();
    const showAdFn = vi.fn();
    placement().beforeReward(showAdFn);
    placement().adViewed();
    placement().adBreakDone({ breakStatus: 'viewed' });
    expect(h.onReady).not.toHaveBeenCalled();
    expect(h.onViewed).not.toHaveBeenCalled();
    expect(h.onDone).not.toHaveBeenCalled();
  });
});
