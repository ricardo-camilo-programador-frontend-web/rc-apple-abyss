'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import { useAdGuard } from '@/hooks/use-ad-guard';
import { footerAdSize, parseAdSenseSlot } from '@/lib/ads/adsense';

function subscribeViewport(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

const viewportWidth = () => window.innerWidth;

/**
 * Bloco AdSense do rodapé do jogo: fixo no fluxo da página, rotulado e sem
 * caixa flutuante (a política do AdSense proíbe "floating box script").
 *
 * Não renderiza quando:
 * - `NEXT_PUBLIC_ADSENSE_FOOTER_SLOT` não é um id numérico de bloco;
 * - ainda está no período de carência da sessão ou "Remove Ads" está ligado;
 * - o AdSense não preencheu (`data-ad-status="unfilled"`) ou falhou.
 */
export default function FooterAds() {
  const slot = parseAdSenseSlot(process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT);
  const { adsVisible } = useAdGuard();
  const [empty, setEmpty] = useState(false);
  const width = useSyncExternalStore(subscribeViewport, viewportWidth, () => 0);
  const handleEmpty = useCallback(() => setEmpty(true), []);

  if (!slot || !adsVisible || empty || width === 0) return null;

  const size = footerAdSize(width);
  const label =
    typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('pt')
      ? 'Publicidade'
      : 'Advertisement';

  return (
    <aside aria-label={label} className="abyss-ad abyss-ad-footer" data-testid="footer-ad">
      <p className="abyss-ad-label">{label}</p>
      <div className="abyss-ad-frame" style={{ maxWidth: size.width, minHeight: size.height }}>
        <AdSenseAd
          key={`${size.width}x${size.height}`}
          slot={slot}
          size={size}
          onEmpty={handleEmpty}
        />
      </div>
    </aside>
  );
}
