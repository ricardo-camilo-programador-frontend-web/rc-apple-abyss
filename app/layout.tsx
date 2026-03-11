import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Apple of the Infinite Abyss',
  description: 'A minimalist incremental idle game where you eat apples with help of worms.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  other: {
    'google-adsense-account': 'ca-pub-6735039970151788'
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6735039970151788"
          crossOrigin="anonymous"
        ></script>
        <Script 
          src="https://cdn.counter.dev/script.js" 
          data-id="f30df6f3-776d-4154-959d-0210ac8a8325" 
          data-utcoffset="-3"
          strategy="afterInteractive"
        />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vtlognmjgs");
          `}
        </Script>
      </head>
      <body suppressHydrationWarning className="bg-stone-100 text-stone-900 font-sans">
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
