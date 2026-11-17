import { describe, expect, it } from 'vitest';
import { footerAdSize, parseAdSenseSlot, readAdSenseStatus } from '@/lib/ads/adsense';

describe('parseAdSenseSlot', () => {
  it('aceita id numérico de bloco', () => {
    expect(parseAdSenseSlot('1234567890')).toBe('1234567890');
    expect(parseAdSenseSlot(' 1234567890 ')).toBe('1234567890');
  });

  it('recusa o slot antigo, vazio e valores que não são id', () => {
    expect(parseAdSenseSlot('horizontal-footer')).toBeNull();
    expect(parseAdSenseSlot('')).toBeNull();
    expect(parseAdSenseSlot(undefined)).toBeNull();
    expect(parseAdSenseSlot(null)).toBeNull();
    expect(parseAdSenseSlot('12345')).toBeNull();
    expect(parseAdSenseSlot('12345abc90')).toBeNull();
  });
});

describe('readAdSenseStatus', () => {
  it('lê filled e unfilled e ignora o resto', () => {
    const ins = document.createElement('ins');
    expect(readAdSenseStatus(ins)).toBeNull();
    ins.setAttribute('data-ad-status', 'unfilled');
    expect(readAdSenseStatus(ins)).toBe('unfilled');
    ins.setAttribute('data-ad-status', 'filled');
    expect(readAdSenseStatus(ins)).toBe('filled');
    ins.setAttribute('data-ad-status', 'outro');
    expect(readAdSenseStatus(ins)).toBeNull();
    expect(readAdSenseStatus(null)).toBeNull();
  });
});

describe('footerAdSize', () => {
  it('usa 728×90 no desktop e 320×50 no mobile', () => {
    expect(footerAdSize(1366)).toEqual({ width: 728, height: 90 });
    expect(footerAdSize(768)).toEqual({ width: 728, height: 90 });
    expect(footerAdSize(767)).toEqual({ width: 320, height: 50 });
    expect(footerAdSize(390)).toEqual({ width: 320, height: 50 });
  });
});
