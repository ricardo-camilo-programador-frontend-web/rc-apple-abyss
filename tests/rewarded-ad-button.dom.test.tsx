import { Coins } from 'lucide-react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RewardedAdButton, { type RewardedAdButtonProps } from '@/components/RewardedAdButton';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function render(props: Partial<RewardedAdButtonProps> = {}) {
  const all: RewardedAdButtonProps = {
    label: '2x Gold Boost',
    description: 'Double gold',
    icon: Coins,
    cooldownRemaining: 0,
    status: 'idle',
    retryIn: 0,
    onRequest: vi.fn(),
    onWatch: vi.fn(),
    ...props,
  };
  act(() => root.render(<RewardedAdButton {...all} />));
  return all;
}

const buttons = () => [...container.querySelectorAll('button')];

describe('RewardedAdButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it('o clique só pede o anúncio; não existe timer que entregue bônus', () => {
    const props = render();
    act(() => buttons()[0].click());
    expect(props.onRequest).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(props.onWatch).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Watching ad');
  });

  it('com anúncio pronto mostra "Watch ad", que chama onWatch', () => {
    const props = render({ status: 'ready' });
    const watch = buttons().find((b) => b.textContent?.includes('Watch ad'));
    expect(watch).toBeDefined();
    act(() => watch?.click());
    expect(props.onWatch).toHaveBeenCalledTimes(1);
    expect(buttons()[0].disabled).toBe(true);
  });

  it('sem anúncio mostra o aviso e bloqueia até a nova tentativa', () => {
    render({ status: 'unavailable', retryIn: 25 });
    expect(container.textContent).toContain('No ad available right now. Try again in 25s.');
    expect(buttons()[0].disabled).toBe(true);
    expect(buttons()).toHaveLength(1);
  });

  it('em cooldown fica travado e mostra o tempo', () => {
    render({ cooldownRemaining: 120 });
    expect(buttons()[0].disabled).toBe(true);
    expect(container.textContent).toContain('120s');
  });

  it('carregando e anúncio na tela ficam ocupados', () => {
    render({ status: 'checking' });
    expect(container.textContent).toContain('Looking for an ad...');
    expect(buttons()[0].getAttribute('aria-busy')).toBe('true');
    render({ status: 'dismissed' });
    expect(container.textContent).toContain('No reward this time.');
    expect(buttons()[0].disabled).toBe(false);
  });
});
