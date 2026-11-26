/**
 * Fontes extras de CSP para o AdSense / H5 Games Ads (anúncio com recompensa).
 *
 * O Google só garante a CSP estrita por nonce
 * (https://support.google.com/adsense/answer/16283098); a lista abaixo cobre
 * os hosts que o adsbygoogle.js chama hoje (vistos no site no ar em 17/11/2026:
 * googleads.g.doubleclick.net, www.google.com, ep1/ep2.adtrafficquality.google)
 * e os do player de vídeo do anúncio com recompensa. A política do projeto é
 * Report-Only, então nada é bloqueado: revisar pelos reports/DevTools antes de
 * virar enforcement.
 *
 * Fica fora do array da CSP em `next.config.ts` para não conflitar com mudanças
 * da Adsterra nas mesmas linhas (PR #50).
 */

export const GOOGLE_ADS_CSP_SOURCES: Readonly<Record<string, ReadonlyArray<string>>> = {
  'script-src': [
    'https://*.googlesyndication.com',
    'https://*.doubleclick.net',
    'https://*.adtrafficquality.google',
    'https://www.google.com',
    'https://fundingchoicesmessages.google.com',
    'https://imasdk.googleapis.com',
    'https://www.gstatic.com',
  ],
  'connect-src': [
    'https://*.googlesyndication.com',
    'https://*.doubleclick.net',
    'https://*.adtrafficquality.google',
    'https://www.google.com',
    'https://fundingchoicesmessages.google.com',
    'https://imasdk.googleapis.com',
  ],
  'frame-src': [
    'https://*.doubleclick.net',
    'https://*.adtrafficquality.google',
    'https://www.google.com',
    'https://fundingchoicesmessages.google.com',
    'https://imasdk.googleapis.com',
  ],
  // Vídeo do anúncio com recompensa (sem media-src, valeria o default-src 'self').
  'media-src': ["'self'", 'blob:', 'https:'],
};

/**
 * Acrescenta fontes às diretivas existentes (sem duplicar) e cria as que
 * faltam antes de `upgrade-insecure-requests`.
 */
export function withCspSources(
  directives: ReadonlyArray<string>,
  sources: Readonly<Record<string, ReadonlyArray<string>>>,
): Array<string> {
  const pending = new Map(Object.entries(sources));
  const result = directives.map((directive) => {
    const [name, ...values] = directive.trim().split(/\s+/);
    const extra = pending.get(name);
    if (!extra) return directive;
    pending.delete(name);
    const merged = [...values];
    for (const source of extra) if (!merged.includes(source)) merged.push(source);
    return [name, ...merged].join(' ');
  });
  const created = [...pending.entries()].map(([name, values]) => [name, ...values].join(' '));
  const tail = result.findIndex((d) => d.trim() === 'upgrade-insecure-requests');
  if (tail === -1) return [...result, ...created];
  return [...result.slice(0, tail), ...created, ...result.slice(tail)];
}
