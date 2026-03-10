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
export const loadAdsterra = (zoneScript: string, containerId?: string) => {
  if (!ENABLE_ADS || typeof window === 'undefined') return;

  try {
    // Check if script is already loaded to avoid duplication
    // We hash the URL to create a unique ID
    const scriptId = `adsterra-script-${btoa(zoneScript).replace(/[^a-zA-Z0-9]/g, '')}`;
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.async = true;
    script.src = zoneScript;
    
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(script);
      }
    } else {
      document.body.appendChild(script);
    }
  } catch (error) {
    console.error('Failed to load Adsterra script:', error);
  }
};
