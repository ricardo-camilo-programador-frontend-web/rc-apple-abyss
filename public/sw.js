const CACHE_NAME = 'apple-clicker-v3';
const ASSETS_CACHE_NAME = 'game-assets';

const CORE_ASSETS = [
  '/'
];

const IMAGE_ASSETS = [
  '/assets/apples/red-delicious-apple-1.webp',
  '/assets/apples/red-delicious-apple-2.webp',
  '/assets/apples/red-delicious-apple-3.webp',
  '/assets/apples/red-delicious-apple-4.webp'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CORE_ASSETS).catch(err => console.warn('SW core cache error:', err));
      }),
      caches.open(ASSETS_CACHE_NAME).then((cache) => {
        return cache.addAll(IMAGE_ASSETS).catch(err => console.warn('SW assets cache error:', err));
      })
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not cache external requests (AdSense, Adsterra, etc)
  if (!url.origin.startsWith(self.location.origin)) {
    return;
  }

  // Bypass Next.js image optimization requests to prevent broken images
  if (url.pathname.startsWith('/_next/image')) {
    return;
  }

  // Handle image assets
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    // Network First strategy for assets to ensure they are never broken
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        // Cache the valid response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(ASSETS_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request);
      })
    );
    return;
  }

  // Handle navigation requests (HTML pages) — stale-while-revalidate
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Handle other requests (stale-while-revalidate, fallback to network)
  event.respondWith(
    caches.match(event.request).then((response) => {
      const networkFetch = fetch(event.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => response);
      return response || networkFetch;
    })
  );
});
