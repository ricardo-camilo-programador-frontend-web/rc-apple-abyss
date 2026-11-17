/**
 * AdSense: publisher id e validação do id de bloco.
 *
 * O id de bloco (`data-ad-slot`) é o número que o painel do AdSense mostra em
 * Anúncios → Por bloco de anúncios. Um texto como `horizontal-footer` não é id
 * de bloco: o AdSense não preenche e o espaço fica vazio. Sem id válido, o
 * bloco não é renderizado.
 */

export const ADSENSE_CLIENT = 'ca-pub-6735039970151788';

const SLOT_PATTERN = /^\d{6,20}$/;

export function parseAdSenseSlot(value: string | undefined | null): string | null {
  const slot = value?.trim();
  if (!slot || !SLOT_PATTERN.test(slot)) return null;
  return slot;
}

/** Status que o AdSense grava em `ins.adsbygoogle[data-ad-status]`. */
export type AdSenseStatus = 'filled' | 'unfilled' | null;

export function readAdSenseStatus(element: Element | null | undefined): AdSenseStatus {
  const status = element?.getAttribute('data-ad-status');
  if (status === 'filled' || status === 'unfilled') return status;
  return null;
}

export type AdSenseSize = { width: number; height: number };

export const ADSENSE_DESKTOP_MIN_WIDTH = 768;

/** Tamanho fixo do bloco do rodapé: 728×90 a partir de 768 px, 320×50 abaixo. */
export function footerAdSize(viewportWidth: number): AdSenseSize {
  if (viewportWidth >= ADSENSE_DESKTOP_MIN_WIDTH) return { width: 728, height: 90 };
  return { width: 320, height: 50 };
}
