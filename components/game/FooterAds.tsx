'use client';

import React from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import { useAdGuard } from '@/hooks/use-ad-guard';

export default function FooterAds() {
  const { adsVisible } = useAdGuard();

  if (!adsVisible) return null;

  return (
    <div className="w-full h-[90px] bg-stone-200/30 dark:bg-stone-800/30 flex items-center justify-center border-t border-stone-200/50 dark:border-stone-700/50 flex-shrink-0">
      <AdSenseAd slot="horizontal-footer" format="auto" className="w-full h-full max-w-4xl" />
    </div>
  );
}
