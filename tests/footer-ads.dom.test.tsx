import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FooterAds from '@/components/game/FooterAds';
import { useAdGuard } from '@/hooks/use-ad-guard';
import { resetAdsRemovedMemoryForTests, writeAdsRemoved } from '@/lib/ads/ads-removed';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SLOT = '1234567890';

class MockIntersectionObserver implements IntersectionObserver {
  static latest: MockIntersectionObserver | null = null;
  readonly root: Element | Document | null = null;
  readonly thresholds: Array<number> = [0];
  readonly rootMargin = '';

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.latest = this;
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): Array<IntersectionObserverEntry> {
    return [];
  }

  intersect(): void {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this);
  }
}

let container: HTMLDivElement;
let root: Root;

function render(node: React.ReactNode) {
  act(() => {
    root.render(node);
  });
}

describe('FooterAds', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    localStorage.clear();
    resetAdsRemovedMemoryForTests();
    // Sessão começou há 1 min: já passou da carência de 30 s.
    sessionStorage.setItem('apple_abyss_session_start', String(Date.now() - 60_000));
    window.adsbygoogle = [];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('não renderiza sem id de bloco válido (slot antigo horizontal-footer)', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_FOOTER_SLOT', 'horizontal-footer');
    render(<FooterAds />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza no fluxo, rotulado, com tamanho fixo e sem position fixed', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_FOOTER_SLOT', SLOT);
    render(<FooterAds />);
    const aside = container.querySelector('aside');
    expect(aside).not.toBeNull();
    expect(aside?.className).not.toMatch(/fixed|sticky/);
    expect(aside?.getAttribute('style') ?? '').not.toMatch(/fixed|sticky/);
    const ins = container.querySelector('ins.adsbygoogle') as HTMLElement;
    expect(ins.getAttribute('data-ad-slot')).toBe(SLOT);
    expect(ins.getAttribute('data-ad-client')).toBe('ca-pub-6735039970151788');
    expect(ins.style.width).toBe('728px');
    expect(ins.style.height).toBe('90px');
  });

  it('só faz push quando chega perto da tela e se recolhe quando vem unfilled', async () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_FOOTER_SLOT', SLOT);
    render(<FooterAds />);
    expect(window.adsbygoogle).toHaveLength(0);
    act(() => MockIntersectionObserver.latest?.intersect());
    expect(window.adsbygoogle).toHaveLength(1);

    const ins = container.querySelector('ins.adsbygoogle') as HTMLElement;
    await act(async () => {
      ins.setAttribute('data-ad-status', 'unfilled');
      await Promise.resolve();
    });
    expect(container.querySelector('aside')).toBeNull();
  });

  it('se recolhe quando o push falha, sem texto de reserva', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_FOOTER_SLOT', SLOT);
    window.adsbygoogle = {
      push: () => {
        throw new Error('adblock');
      },
    } as unknown as Array<unknown>;
    render(<FooterAds />);
    act(() => MockIntersectionObserver.latest?.intersect());
    expect(container.innerHTML).toBe('');
  });

  it('some na hora quando Remove Ads é ligado', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_FOOTER_SLOT', SLOT);
    render(<FooterAds />);
    expect(container.querySelector('aside')).not.toBeNull();
    act(() => writeAdsRemoved(true));
    expect(container.querySelector('aside')).toBeNull();
  });

  it('não aparece durante a carência da sessão', () => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_FOOTER_SLOT', SLOT);
    sessionStorage.setItem('apple_abyss_session_start', String(Date.now()));
    render(<FooterAds />);
    expect(container.innerHTML).toBe('');
  });
});

describe('useAdGuard compartilhado', () => {
  beforeEach(() => {
    localStorage.clear();
    resetAdsRemovedMemoryForTests();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('a troca feita num componente chega aos outros sem recarregar', () => {
    let toggle: () => void = () => {};
    function Settings() {
      const guard = useAdGuard();
      toggle = guard.toggleAdsRemoved;
      return null;
    }
    function FreeRewards() {
      const { adsRemoved } = useAdGuard();
      return adsRemoved ? null : <button type="button">Free Rewards</button>;
    }
    render(
      <>
        <Settings />
        <FreeRewards />
      </>,
    );
    expect(container.textContent).toBe('Free Rewards');
    act(() => toggle());
    expect(container.textContent).toBe('');
    expect(localStorage.getItem('apple_abyss_ads_removed')).toBe('true');
    act(() => toggle());
    expect(container.textContent).toBe('Free Rewards');
  });
});
