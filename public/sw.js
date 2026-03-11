const CACHE_NAME = 'apple-clicker-v2';
const ASSETS = [
  '/',
  '/assets/apples/red-delicious-apple-1.png',
  '/assets/apples/red-delicious-apple-2.png',
  '/assets/apples/red-delicious-apple-3.png',
  '/assets/apples/red-delicious-apple-4.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch to prevent SW installation failure if a resource is missing
      return cache.addAll(ASSETS).catch(err => console.warn('SW cache.addAll error:', err));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Do not cache external requests (AdSense, Adsterra, etc)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
