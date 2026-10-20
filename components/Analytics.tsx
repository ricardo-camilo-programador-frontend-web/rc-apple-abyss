import Script from 'next/script';
import { resolveAnalyticsConfig } from '@/lib/analytics/config';

const config = resolveAnalyticsConfig(process.env as Record<string, string | undefined>);

/**
 * Loads all analytics scripts (GA4, optional GTM, Clarity, counter.dev) via
 * next/script afterInteractive so they render in the published HTML.
 * Renders nothing when analytics is disabled via NEXT_PUBLIC_ANALYTICS_ENABLED='false'.
 */
export function Analytics() {
  if (!config.enabled) return null;

  return (
    <>
      {config.loadGa4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${config.ga4Id}');`,
            }}
          />
        </>
      )}
      {config.loadGtm && (
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${config.gtmId}');`,
          }}
        />
      )}
      {/* Clarity — loaded directly (no GTM-managed Clarity in this project). */}
      <Script
        id="ms-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${config.clarityId}");`,
        }}
      />
      {/* counter.dev */}
      <Script
        src="https://cdn.counter.dev/script.js"
        data-id={config.counterId}
        data-utcoffset={config.counterUtcOffset}
        strategy="afterInteractive"
      />
    </>
  );
}
