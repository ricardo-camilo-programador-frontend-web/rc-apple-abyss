import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ADS_REMOVED_EVENT,
  ADS_REMOVED_STORAGE_KEY,
  readAdsRemoved,
  resetAdsRemovedMemoryForTests,
  subscribeAdsRemoved,
  writeAdsRemoved,
} from '@/lib/ads/ads-removed';

describe('ads-removed store', () => {
  beforeEach(() => {
    localStorage.clear();
    resetAdsRemovedMemoryForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('começa desligado', () => {
    expect(readAdsRemoved()).toBe(false);
  });

  it('lê o valor salvo pela versão anterior (mesma chave)', () => {
    localStorage.setItem(ADS_REMOVED_STORAGE_KEY, 'true');
    expect(readAdsRemoved()).toBe(true);
  });

  it('grava, persiste e avisa a mesma aba', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAdsRemoved(listener);
    writeAdsRemoved(true);
    expect(localStorage.getItem(ADS_REMOVED_STORAGE_KEY)).toBe('true');
    expect(readAdsRemoved()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    writeAdsRemoved(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('reage ao evento storage de outra aba só para a própria chave', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAdsRemoved(listener);
    window.dispatchEvent(new StorageEvent('storage', { key: 'outra_chave' }));
    expect(listener).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent('storage', { key: ADS_REMOVED_STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('usa a reserva em memória quando o localStorage está bloqueado', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const listener = vi.fn();
    window.addEventListener(ADS_REMOVED_EVENT, listener);
    writeAdsRemoved(true);
    expect(readAdsRemoved()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(ADS_REMOVED_EVENT, listener);
  });
});
