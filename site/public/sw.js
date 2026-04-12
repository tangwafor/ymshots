/**
 * YmShotS Service Worker — Offline-first
 * Caches the landing page + API responses for offline access.
 * The desktop Electron app has its own offline strategy via local filesystem.
 */

const CACHE_NAME = 'ymshots-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls: network-first, fall back to cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/g/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          if (res.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then(r => r || offlineResponse()))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        const clone = res.clone();
        if (res.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});

function offlineResponse() {
  return new Response(
    JSON.stringify({ error: { code: 'OFFLINE', message: 'You are offline. Core editing features still work.' } }),
    { headers: { 'Content-Type': 'application/json' }, status: 503 }
  );
}
