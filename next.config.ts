import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';
import { GOOGLE_ADS_CSP_SOURCES, withCspSources } from './lib/csp-google-ads';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Adsterra Native Banner: script host (env NEXT_PUBLIC_ADSTERRA_NATIVE_HOST) plus
// the domains its invoke.js calls at runtime (seen on 2026-11-17). The ad-serving
// domains rotate per request; review them from CSP reports / DevTools before
// switching this policy to enforcement. Back-button / extra-redirect domains from
// the zone config (mamshirt.com, aqml.org) are intentionally NOT allowed.
const ADSTERRA_SCRIPT_HOSTS = [
  'https://*.effectivegatecpm.com',
  'https://*.profitableratecpmnetwork.com',
  'https://www.highperformanceformat.com',
];
const ADSTERRA_AD_DOMAINS = [
  'https://fizzyacerbitymellow.com',
  'https://sleepoverlimitprofound.com',
  'https://exemplarfederallithe.com',
  'https://furiousexpansion.com',
  'https://consumeririssalary.com',
];
const ADSTERRA_STATS = 'https://protrafficinspector.com';
const ADSTERRA_FRAMES = 'https://cdn.cloudvideosa.com';

const ADSTERRA_SCRIPT_SRC = [...ADSTERRA_SCRIPT_HOSTS, ...ADSTERRA_AD_DOMAINS].join(' ');
const ADSTERRA_CONNECT_SRC = [...ADSTERRA_SCRIPT_HOSTS, ...ADSTERRA_AD_DOMAINS, ADSTERRA_STATS].join(' ');
const ADSTERRA_FRAME_SRC = [...ADSTERRA_SCRIPT_HOSTS, ...ADSTERRA_AD_DOMAINS, ADSTERRA_FRAMES].join(' ');

// Report-Only: evaluates CSP without enforcing, so third-party ad/analytics
// breakage surfaces in the console before we flip to enforcement.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.counter.dev https://www.clarity.ms https://*.clarity.ms ${ADSTERRA_SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://www.google-analytics.com https://*.googletagmanager.com https://*.clarity.ms https://pagead2.googlesyndication.com https://cdn.counter.dev https://*.counter.dev ${ADSTERRA_CONNECT_SRC}`,
  `frame-src 'self' https://googleads.g.doubleclick.net https://td.doubleclick.net https://*.googlesyndication.com ${ADSTERRA_FRAME_SRC}`,
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  // A lockfile above this repo was making Next treat the home directory as the workspace root.
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            // Hosts do Google para o H5 Games Ads entram aqui (lib/csp-google-ads.ts).
            value: withCspSources(CSP_REPORT_ONLY.split('; '), GOOGLE_ADS_CSP_SOURCES).join('; '),
          },
        ],
      },
    ];
  },
  // Allow access to remote image placeholder.
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.reddit.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
