'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AdFormat, loadAdsterra, ENABLE_ADS, ADSTERRA_ZONE_IDS } from '@/lib/ads/adsterra';

interface AdsterraAdProps {
  format: AdFormat;
  className?: string;
  zoneId?: string; // Specific zone ID provided by Adsterra dashboard
  zoneScript?: string; // The full script URL from Adsterra dashboard
  containerId?: string; // Specific container ID from Adsterra (for native banners)
}

export default function AdsterraAd({ format, className = '', zoneId, zoneScript }: AdsterraAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Unique ID for the container to inject the script into
  const [containerId] = useState(() => `adsterra-${format}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!ENABLE_ADS) return;

    const loadScript = () => {
      try {
        const zoneConfig = ADSTERRA_ZONE_IDS[format];
        const scriptUrl = zoneScript || zoneConfig?.scriptUrl || `//pl${process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID || '5657606'}.highrevenuegate.com/invoke.js`;
        const actualZoneId = zoneId || zoneConfig?.zoneId || `native-${format}`;
        const specificContainerId = containerId || zoneConfig?.containerId || actualZoneId;

        // Set HPF options if available (High Performance Format)
        if (zoneConfig?.hpfOptions && typeof (window as any).atOptions !== 'undefined') {
          (window as any).atOptions = zoneConfig.hpfOptions;
        }

        // Direct link (Smartlink) - just create a link and trigger it
        if (zoneConfig?.isDirectLink || format === AdFormat.SMARTLINK) {
          const triggerSmartlink = () => {
            const link = document.createElement('a') as HTMLAnchorElement;
            link.href = scriptUrl;
            link.target = '_blank';
            link.rel = 'nofollow';
            link.className = 'hidden';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (link.parentNode) {
                document.body.removeChild(link);
              }
            }, 100);
          };

          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            triggerSmartlink();
          } else {
            const handleLoad = () => {
              triggerSmartlink();
            };
            window.addEventListener('DOMContentLoaded', handleLoad);
            return () => window.removeEventListener('DOMContentLoaded', handleLoad);
          }

          const timer = setTimeout(() => setIsLoaded(true), 0);
          return () => clearTimeout(timer);
        }

        // Formats that don't need a specific container (injected into head/body)
        if (
          format === AdFormat.POPUNDER ||
          format === AdFormat.SOCIAL_BAR ||
          format === AdFormat.INTERSTITIAL
        ) {
          loadAdsterra(scriptUrl);
        } else {
          // Banner formats that need to be injected into a specific container
          loadAdsterra(scriptUrl, specificContainerId);
        }

        const timer = setTimeout(() => setIsLoaded(true), 0);
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Adsterra load error:', error);
        const timer = setTimeout(() => setHasError(true), 0);
        return () => clearTimeout(timer);
      }
    };

    // Use IntersectionObserver for lazy loading banner ads
    if (
      format !== AdFormat.POPUNDER &&
      format !== AdFormat.SOCIAL_BAR &&
      format !== AdFormat.INTERSTITIAL &&
      format !== AdFormat.SMARTLINK &&
      containerRef.current
    ) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(() => loadScript());
            } else {
              setTimeout(loadScript, 1);
            }
            observer.disconnect();
          }
        },
        { rootMargin: '200px' } // Load slightly before it comes into view
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      // For global formats, load after DOMContentLoaded or idle
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => loadScript());
        } else {
          setTimeout(loadScript, 1);
        }
      } else {
        const handleLoad = () => {
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => loadScript());
          } else {
            setTimeout(loadScript, 1);
          }
        };
        window.addEventListener('DOMContentLoaded', handleLoad);
        return () => window.removeEventListener('DOMContentLoaded', handleLoad);
      }
    }
  }, [format, containerId, zoneScript]);

  if (!ENABLE_ADS) return null;

  // Formats that are hidden and don't render a visible container
  if (
    format === AdFormat.POPUNDER || 
    format === AdFormat.SOCIAL_BAR || 
    format === AdFormat.INTERSTITIAL ||
    format === AdFormat.SMARTLINK
  ) {
    return null;
  }

  // Fallback if script fails to load
  if (hasError) {
    // Hide empty container if script fails, or show fallback if dev wants
    if (process.env.NODE_ENV === 'development') {
      console.log(`Adsterra fallback rendered for format: ${format}`);
    }
    return null; // Hide empty container
  }

  return (
    <div className={`adsterra-wrapper relative overflow-hidden ${className}`} ref={containerRef}>
      <span className="absolute top-0 left-0 w-full text-center text-[10px] uppercase tracking-widest text-stone-400 opacity-50 pointer-events-none">
        Advertisement
      </span>
      <div 
        id={containerId} 
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
