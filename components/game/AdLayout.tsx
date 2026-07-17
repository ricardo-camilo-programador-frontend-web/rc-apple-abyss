'use client';

import React from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import { useAdGuard } from '@/hooks/use-ad-guard';

/** Side ad sidebars — used inside the main flex row. */
export default function AdSidebars() {
  const { adsVisible } = useAdGuard();

  if (!adsVisible) return null;

  return (
    <>
      {/* Left ad sidebar — visible on extra-large screens */}
      <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-r border-stone-200/50 dark:border-stone-700/50 gap-4 py-4 flex-shrink-0">
        <AdSenseAd slot="vertical-left" format="auto" className="w-full flex-1" />
      </div>
      {/* Right ad sidebar — visible on extra-large screens */}
      <div className="hidden xl:flex flex-col w-[160px] bg-stone-200/30 dark:bg-stone-800/30 items-center justify-center border-l border-stone-200/50 dark:border-stone-700/50 gap-4 py-4 flex-shrink-0">
        <AdSenseAd slot="vertical-right" format="auto" className="w-full flex-1" />
      </div>
    </>
  );
}
