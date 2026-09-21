const CACHE_NAME = 'thimar-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => console.warn('PWA Cache item failed:', asset, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clientsClaim();
});

self.addEventListener('fetch', (event) => {
  // Never intercept or cache non-GET requests (POST, PUT, DELETE, PATCH)
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Bypass service worker for audio files, PDFs, range requests, and external media CDNs
  // This allows native browser HTTP 206 streaming and avoids buffering huge media in memory
  if (
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.wav') ||
    url.pathname.endsWith('.ogg') ||
    url.pathname.endsWith('.m4a') ||
    url.pathname.endsWith('.pdf') ||
    url.hostname.includes('everyayah.com') ||
    url.hostname.includes('archive.org') ||
    url.hostname.includes('alquran.cloud') ||
    url.hostname.includes('aladhan.com')
  ) {
    return;
  }

  // API calls: Network-First with safe offline fallback (never cache mutation requests)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open('api-cache');
        const cached = await cache.match(event.request);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'offline', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Static assets and pages: Cache-First with network fallback
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        // Cache successful static responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
