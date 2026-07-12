'use client';

import React from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import AdsterraAd from '@/components/AdsterraAd';
import { AdFormat } from '@/lib/ads/adsterra';

/** Side ad sidebars — used inside the main flex row. */
export default function AdSidebars() {
  return (
    <>
      {/* Left ad sidebar — visible on extra-large screens */}
      <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-r border-stone-200/50 dark:border-stone-700/50 gap-4 py-4">
        <AdSenseAd slot="vertical-left" format="auto" className="w-full flex-1" />
        <AdsterraAd format={AdFormat.DISPLAY_BANNER_160x300} className="w-full" />
      </div>
      {/* Right ad sidebar — visible on extra-large screens */}
      <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-l border-stone-200/50 dark:border-stone-700/50 gap-4 py-4">
        <AdSenseAd slot="vertical-right" format="auto" className="w-full flex-1" />
        <AdsterraAd format={AdFormat.DISPLAY_BANNER_160x300} className="w-full" />
      </div>
    </>
  );
}
