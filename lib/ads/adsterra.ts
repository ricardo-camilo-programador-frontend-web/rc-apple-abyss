/**
 * Adsterra Monetization Module
 * 
 * Publisher ID: 5657606
 * 
 * How to change the ID:
 * Update the NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID environment variable in your .env file
 * or change the DEFAULT_PUBLISHER_ID constant below.
 * 
 * How to disable ads:
 * Set NEXT_PUBLIC_ENABLE_ADSTERRA=false in your .env file
 * or change the ENABLE_ADS constant below.
 * 
 * How to add new placements:
 * Add a new format to the AdFormat enum and handle it in the AdsterraAd component.
 */

export const DEFAULT_PUBLISHER_ID = '5657606';
export const ENABLE_ADS = process.env.NEXT_PUBLIC_ENABLE_ADSTERRA !== 'false';

export enum AdFormat {
  POPUNDER = 'popunder',
  SOCIAL_BAR = 'social_bar',
  NATIVE_BANNER = 'native_banner',
  DISPLAY_BANNER = 'display_banner',
  SMARTLINK = 'smartlink',
  INTERSTITIAL = 'interstitial'
}

/**
 * Loads the Adsterra script asynchronously.
 * Ensures it only runs on the client-side and doesn't block rendering.
 */
export const loadAdsterraScript = (format: AdFormat, containerId?: string) => {
  if (!ENABLE_ADS || typeof window === 'undefined') return;

  const publisherId = process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID || DEFAULT_PUBLISHER_ID;

  try {
    // Check if script is already loaded for this format to avoid duplication
    const scriptId = `adsterra-script-${format}`;
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.async = true;
    
    // Generic placeholder URL for Adsterra scripts.
    // In a real-world scenario, Adsterra provides specific URLs for each zone/format.
    script.src = `https://pl${publisherId}.adsterra.com/invoke.js?format=${format}`;
    
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(script);
      }
    } else {
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error('Failed to load Adsterra script:', error);
  }
};
