import { describe, expect, it } from 'vitest';
import { ANALYTICS_DEFAULTS, resolveAnalyticsConfig } from '@/lib/analytics/config';

describe('resolveAnalyticsConfig', () => {
  it('returns defaults for an empty env', () => {
    const config = resolveAnalyticsConfig({});
    expect(config).toMatchObject({
      enabled: true,
      clarityId: ANALYTICS_DEFAULTS.clarityId,
      ga4Id: ANALYTICS_DEFAULTS.ga4Id,
      loadGa4: true,
      loadGtm: false,
      counterId: ANALYTICS_DEFAULTS.counterId,
      counterUtcOffset: ANALYTICS_DEFAULTS.counterUtcOffset,
    });
  });

  it('prefers env values over defaults and trims whitespace', () => {
    const config = resolveAnalyticsConfig({
      NEXT_PUBLIC_CLARITY_ID: ' otherclarity ',
      NEXT_PUBLIC_GA4_ID: 'G-TEST123',
      NEXT_PUBLIC_COUNTER_ID: '11111111-2222-3333-4444-555555555555',
      NEXT_PUBLIC_COUNTER_UTCOFFSET: '2',
    });
    expect(config.clarityId).toBe('otherclarity');
    expect(config.ga4Id).toBe('G-TEST123');
    expect(config.counterId).toBe('11111111-2222-3333-4444-555555555555');
    expect(config.counterUtcOffset).toBe('2');
  });

  it('new env name wins over legacy fallback', () => {
    const config = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA4_ID: 'G-NEW',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-LEGACY',
      NEXT_PUBLIC_COUNTER_ID: 'counter-new',
      NEXT_PUBLIC_COUNTER_DEV_ID: 'counter-legacy',
    });
    expect(config.ga4Id).toBe('G-NEW');
    expect(config.counterId).toBe('counter-new');
  });

  it('legacy name is used when the new name is absent', () => {
    const config = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-LEGACY',
      NEXT_PUBLIC_COUNTER_DEV_ID: 'counter-legacy',
    });
    expect(config.ga4Id).toBe('G-LEGACY');
    expect(config.counterId).toBe('counter-legacy');
  });

  it('ignores empty and placeholder ids', () => {
    const config = resolveAnalyticsConfig({
      NEXT_PUBLIC_GA4_ID: '  ',
      NEXT_PUBLIC_GTM_ID: 'GTM-XXXXXXX',
    });
    expect(config.ga4Id).toBe(ANALYTICS_DEFAULTS.ga4Id);
    expect(config.gtmId).toBe('');
    expect(config.loadGtm).toBe(false);
  });

  it('does not load gtag when GTM tracks the same GA4 id', () => {
    const config = resolveAnalyticsConfig({
      NEXT_PUBLIC_GTM_ENABLED: 'true',
      NEXT_PUBLIC_GTM_ID: 'GTM-ABC123',
      NEXT_PUBLIC_GTM_GA4_ID: 'G-SAME',
      NEXT_PUBLIC_GA4_ID: 'G-SAME',
    });
    expect(config.loadGtm).toBe(true);
    expect(config.loadGa4).toBe(false);
  });

  it('loads gtag when GTM is disabled or tracks a different GA4 id', () => {
    const gtmOff = resolveAnalyticsConfig({
      NEXT_PUBLIC_GTM_ENABLED: 'true',
      NEXT_PUBLIC_GTM_ID: 'GTM-ABC123',
      NEXT_PUBLIC_GTM_GA4_ID: ANALYTICS_DEFAULTS.ga4Id,
    });
    expect(gtmOff.loadGtm).toBe(true);
    expect(gtmOff.loadGa4).toBe(false);

    const gtmDifferentGa4 = resolveAnalyticsConfig({
      NEXT_PUBLIC_GTM_ENABLED: 'true',
      NEXT_PUBLIC_GTM_ID: 'GTM-ABC123',
      NEXT_PUBLIC_GTM_GA4_ID: 'G-OTHER',
    });
    expect(gtmDifferentGa4.loadGtm).toBe(true);
    expect(gtmDifferentGa4.loadGa4).toBe(true);
  });

  it('does not load GTM without an id even when enabled', () => {
    const config = resolveAnalyticsConfig({ NEXT_PUBLIC_GTM_ENABLED: 'true' });
    expect(config.loadGtm).toBe(false);
  });

  it('kill switch disables everything', () => {
    const config = resolveAnalyticsConfig({
      NEXT_PUBLIC_ANALYTICS_ENABLED: 'false',
      NEXT_PUBLIC_GTM_ENABLED: 'true',
      NEXT_PUBLIC_GTM_ID: 'GTM-ABC123',
    });
    expect(config.enabled).toBe(false);
  });
});
