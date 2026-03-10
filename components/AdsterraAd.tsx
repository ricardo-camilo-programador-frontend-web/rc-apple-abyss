'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AdFormat, loadAdsterraScript, ENABLE_ADS } from '@/lib/ads/adsterra';

interface AdsterraAdProps {
  format: AdFormat;
  className?: string;
  zoneId?: string; // Specific zone ID provided by Adsterra dashboard
}

export default function AdsterraAd({ format, className = '', zoneId }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Unique ID for the container to inject the script into
  const [containerId] = useState(() => `adsterra-${format}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!ENABLE_ADS) return;

    try {
      // Formats that don't need a specific container (injected into head/body)
      if (
        format === AdFormat.POPUNDER || 
        format === AdFormat.SOCIAL_BAR || 
        format === AdFormat.INTERSTITIAL
      ) {
        loadAdsterraScript(format);
      } else {
        // Banner formats that need to be injected into a specific container
        loadAdsterraScript(format, containerId);
      }
      
      const timer = setTimeout(() => setIsLoaded(true), 0);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Adsterra load error:', error);
      const timer = setTimeout(() => setHasError(true), 0);
      return () => clearTimeout(timer);
    }
  }, [format, containerId]);

  if (!ENABLE_ADS) return null;

  // Formats that are hidden and don't render a visible container
  if (
    format === AdFormat.POPUNDER || 
    format === AdFormat.SOCIAL_BAR || 
    format === AdFormat.INTERSTITIAL
  ) {
    return null;
  }

  // Fallback for Smartlink or if script fails to load
  if (hasError || format === AdFormat.SMARTLINK) {
    return (
      <div className={`flex flex-col items-center justify-center bg-stone-100 border border-stone-200 text-stone-400 text-xs p-4 rounded-lg min-h-[90px] ${className}`}>
        <span className="uppercase tracking-widest mb-1 opacity-50">Advertisement</span>
        <a 
          href={`https://www.highperformancecpm.com/${zoneId || 'default'}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-stone-600 transition-colors underline decoration-stone-300 underline-offset-4"
        >
          Click here to support the site
        </a>
      </div>
    );
  }

  return (
    <div className={`adsterra-wrapper relative overflow-hidden ${className}`}>
      <span className="absolute top-0 left-0 w-full text-center text-[10px] uppercase tracking-widest text-stone-400 opacity-50 pointer-events-none">
        Advertisement
      </span>
      <div 
        id={containerId} 
        ref={containerRef}
        className="adsterra-container flex items-center justify-center min-h-[90px] bg-stone-50 rounded-lg overflow-hidden mt-4"
        aria-hidden="true"
      >
        {!isLoaded && (
          <div className="animate-pulse bg-stone-200/50 w-full h-full min-h-[90px] rounded-lg"></div>
        )}
      </div>
    </div>
  );
}
