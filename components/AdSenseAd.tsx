'use client';

import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CLIENT, type AdSenseSize, readAdSenseStatus } from '@/lib/ads/adsense';

declare global {
  interface Window {
    adsbygoogle?: Array<unknown>;
  }
}

interface AdSenseAdProps {
  /** Id numérico do bloco (validado por `parseAdSenseSlot` antes de chegar aqui). */
  slot: string;
  /** Tamanho fixo do bloco. */
  size: AdSenseSize;
  className?: string;
  /** Chamado quando o AdSense não preenche (`data-ad-status="unfilled"`) ou falha. */
  onEmpty?: () => void;
}

/**
 * Um bloco AdSense de tamanho fixo, no fluxo da página.
 *
 * Só chama `adsbygoogle.push` quando o bloco chega perto da tela. Observa
 * `data-ad-status`: se vier `unfilled`, ou se o push falhar, o bloco some
 * (sem texto de reserva) e avisa o pai por `onEmpty`.
 */
export default function AdSenseAd({ slot, size, className = '', onEmpty }: AdSenseAdProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [empty, setEmpty] = useState(false);
  const onEmptyRef = useRef(onEmpty);

  useEffect(() => {
    onEmptyRef.current = onEmpty;
  }, [onEmpty]);

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return;

    const markEmpty = () => {
      setEmpty(true);
      onEmptyRef.current?.();
    };

    const statusObserver = new MutationObserver(() => {
      if (readAdSenseStatus(ins) === 'unfilled') {
        statusObserver.disconnect();
        markEmpty();
      }
    });
    statusObserver.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });

    const push = () => {
      if (pushed.current) return;
      pushed.current = true;
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('AdSense error:', err);
        }
        statusObserver.disconnect();
        markEmpty();
      }
    };

    let viewObserver: IntersectionObserver | undefined;
    if (typeof window.IntersectionObserver === 'function') {
      viewObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          viewObserver?.disconnect();
          push();
        },
        { rootMargin: '200px' },
      );
      viewObserver.observe(ins);
    } else {
      push();
    }

    return () => {
      statusObserver.disconnect();
      viewObserver?.disconnect();
    };
  }, []);

  if (empty) return null;

  return (
    <div className={`adsense-container ${className}`.trim()}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: size.width, height: size.height }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
      />
    </div>
  );
}
