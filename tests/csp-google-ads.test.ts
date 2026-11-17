import { describe, expect, it } from 'vitest';
import { GOOGLE_ADS_CSP_SOURCES, withCspSources } from '@/lib/csp-google-ads';
import nextConfig from '@/next.config';

describe('withCspSources', () => {
  it('acrescenta sem duplicar e cria diretivas que faltam antes de upgrade-insecure-requests', () => {
    const result = withCspSources(
      ["default-src 'self'", "script-src 'self' https://a.com", 'upgrade-insecure-requests'],
      { 'script-src': ['https://a.com', 'https://b.com'], 'media-src': ["'self'", 'https:'] },
    );
    expect(result).toEqual([
      "default-src 'self'",
      "script-src 'self' https://a.com https://b.com",
      "media-src 'self' https:",
      'upgrade-insecure-requests',
    ]);
  });
});

describe('CSP do next.config', () => {
  it('mantém Adsterra/analytics e inclui os hosts do H5 Games Ads', async () => {
    const groups = await nextConfig.headers?.();
    const header = groups
      ?.flatMap((g) => g.headers)
      .find((h) => h.key === 'Content-Security-Policy-Report-Only');
    expect(header).toBeDefined();
    const csp = header?.value ?? '';
    for (const host of [
      'https://pagead2.googlesyndication.com',
      'https://*.profitableratecpmnetwork.com',
      'https://www.clarity.ms',
      'https://cdn.counter.dev',
      ...GOOGLE_ADS_CSP_SOURCES['script-src'],
    ]) {
      expect(csp).toContain(host);
    }
    expect(csp).toMatch(/media-src 'self' blob: https:/);
    expect(csp.match(/script-src/g)).toHaveLength(1);
    expect(csp.trim().endsWith('upgrade-insecure-requests')).toBe(true);
  });
});
