import type {Metadata, Viewport} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import {ToastProvider} from '@/components/Toast';
import {ErrorBoundary} from '@/components/ErrorBoundary';
import {ThemeProvider} from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Apple of the Infinite Abyss',
  description: 'A minimalist incremental idle game where you eat apples with help of worms.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {url: '/favicon.ico', sizes: 'any'},
      {url: '/icon-192.png', sizes: '192x192', type: 'image/png'},
      {url: '/icon-512.png', sizes: '512x512', type: 'image/png'},
    ],
    apple: [
      {url: '/apple-icon.png', sizes: '180x180', type: 'image/png'},
    ],
  },
  other: {
    'google-adsense-account': 'ca-pub-6735039970151788',
  },
};

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#fafaf9'},
    {media: '(prefers-color-scheme: dark)', color: '#1c1917'},
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Anti-FOUC theme script — runs before paint to set dark class */}
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'system';
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (theme === 'system' && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
        {/* AdSense */}
        <Script
          id="adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6735039970151788"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Analytics: counter.dev */}
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
      <body suppressHydrationWarning className={`${inter.variable} bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-sans`}>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
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
