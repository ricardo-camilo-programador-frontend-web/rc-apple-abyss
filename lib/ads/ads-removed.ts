/**
 * Estado único da preferência "Remove Ads".
 *
 * Antes cada componente lia o `localStorage` uma vez no `useState`, então ligar
 * a opção nas Configurações não chegava ao banner nem ao Free Rewards até
 * recarregar. Aqui o valor fica num só lugar, avisa a mesma aba por evento e as
 * outras abas pelo evento `storage`.
 */

export const ADS_REMOVED_STORAGE_KEY = 'apple_abyss_ads_removed';
export const ADS_REMOVED_EVENT = 'apple-abyss:ads-removed';

// Reserva em memória quando o localStorage está bloqueado (modo privado).
let memoryValue: boolean | null = null;

export function readAdsRemoved(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(ADS_REMOVED_STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // localStorage bloqueado: usa a reserva em memória.
  }
  return memoryValue ?? false;
}

export function writeAdsRemoved(value: boolean): void {
  if (typeof window === 'undefined') return;
  memoryValue = value;
  try {
    window.localStorage.setItem(ADS_REMOVED_STORAGE_KEY, String(value));
  } catch {
    // Sem persistência; a reserva em memória vale até fechar a aba.
  }
  window.dispatchEvent(new CustomEvent<boolean>(ADS_REMOVED_EVENT, { detail: value }));
}

export function subscribeAdsRemoved(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ADS_REMOVED_STORAGE_KEY) onChange();
  };
  window.addEventListener(ADS_REMOVED_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(ADS_REMOVED_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** Só para testes: limpa a reserva em memória. */
export function resetAdsRemovedMemoryForTests(): void {
  memoryValue = null;
}
