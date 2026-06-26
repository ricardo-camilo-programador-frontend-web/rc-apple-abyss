'use client';

import React, { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  slot: string;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
}

export default function AdSenseAd({ slot, className = '', format = 'auto', responsive = true }: AdSenseAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);
  const [hasError, setHasError] = React.useState(false);

  useEffect(() => {
    // Only run on client and if not already loaded
    if (typeof window === 'undefined' || isLoaded.current) return;

    let retryCount = 0;
    const loadAd = () => {
      if (!containerRef.current) return;

      // Check dimensions to ensure the ad has space
      const rect = containerRef.current.getBoundingClientRect();
      const insElement = containerRef.current.querySelector('ins');
      const insRect = insElement ? insElement.getBoundingClientRect() : { width: 0, height: 0 };

      if (rect.width === 0 || insRect.width === 0) {
        retryCount++;
        if (retryCount > 10) {
          setHasError(true);
          return;
        }
        setTimeout(loadAd, 500);
        return;
      }

      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('AdSense error:', err);
        }
        setHasError(true);
      }
    };

    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(() => loadAd());
            } else {
              setTimeout(loadAd, 1);
            }
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  if (hasError) {
      return (
        <div className={`ad-fallback min-h-[90px] ${className}`} aria-hidden="true">
          Advertisement
        </div>
      );
  }

  return (
    <div className={`adsense-container min-h-[90px] ${className}`} ref={containerRef}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6735039970151788"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
