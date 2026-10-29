import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { Analytics } from '@/components/Analytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://click-on-the-malus-domestica-ide.netlify.app'),
  title: 'Apple of the Infinite Abyss',
  description:
    'A minimalist incremental idle game where you eat apples with help of worms. Features goals, daily rewards, onboarding, and skill activation.',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Apple of the Infinite Abyss',
    title: 'Apple of the Infinite Abyss',
    description:
      'A minimalist incremental idle game where you eat apples with help of worms. Features goals, daily rewards, onboarding, and skill activation.',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Apple of the Infinite Abyss' }],
  },
  twitter: {
    card: 'summary',
    title: 'Apple of the Infinite Abyss',
    description:
      'A minimalist incremental idle game where you eat apples with help of worms. Features goals, daily rewards, onboarding, and skill activation.',
    images: ['/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    'google-adsense-account': 'ca-pub-6735039970151788',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Anti-FOUC theme script — runs before paint to set dark class */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'system';
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (theme === 'system' && prefersDark)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `,
          }}
        />
        {/* AdSense */}
        <Script
          id="adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6735039970151788"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Analytics (GA4, optional GTM, Clarity, counter.dev) — see lib/analytics/config.ts */}
        <Analytics />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-sans`}
      >
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `,
          }}
        />
        <Script src="/rc-study-modal.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
