'use client';

import React from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import AdsterraAd from '@/components/AdsterraAd';
import { AdFormat } from '@/lib/ads/adsterra';

export default function FooterAds() {
  return (
    <>
      <div className="w-full h-[90px] bg-stone-200/30 dark:bg-stone-800/30 flex items-center justify-center border-t border-stone-200/50 dark:border-stone-700/50">
        <AdSenseAd slot="horizontal-footer" format="auto" className="w-full h-full max-w-4xl" />
      </div>
      {/* Desktop density — hidden on small screens */}
      <div className="hidden md:block">
        <AdsterraAd format={AdFormat.NATIVE_BANNER} className="w-full max-w-4xl mx-auto my-4" />
        <AdsterraAd format={AdFormat.DISPLAY_BANNER_468x60} className="w-full max-w-4xl mx-auto my-2" />
      </div>
    </>
  );
}
