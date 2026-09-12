const CACHE_NAME = 'thimar-shell-v7'
const DATA_CACHE = 'thimar-api-v2'

const SHELL_ASSETS = [
  '/',
  '/login',
  '/signup',
  '/app.html',
  '/student',
  '/teacher',
  '/parent',
  '/islamic-hub.css',
  '/prayer-screen.css',
  '/country-fields.css',
  '/messaging.css',
  '/app-core.js',
  '/offline-runtime.js',
  '/legacy-i18n.js',
  '/islamic-data.js',
  '/country-data.js',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        SHELL_ASSETS.map((url) =>
          fetch(url, { cache: 'no-cache' })
            .then((res) => (res.ok ? cache.put(url, res) : null))
            .catch(() => null)
        )
      )
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 1. Data API Requests: Network-First with Cache Fallback for offline viewing
  if (url.pathname.startsWith('/api/data')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(DATA_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return new Response(
            JSON.stringify({ offline: true, data: null, error: 'offline_mode' }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        })
    )
    return
  }

  // 2. Other API requests: network only with offline JSON error
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ offline: true, error: 'network_offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    )
    return
  }

  // 3. Navigation requests: Stale-While-Revalidate with App Shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          return (await caches.match('/app.html')) || Response.error()
        })
    )
    return
  }

  // 4. Static Assets: Cache-First with Network Revalidation
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Revalidate in background
        fetch(request)
          .then((response) => {
            if (response.ok && response.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response))
            }
          })
          .catch(() => {})
        return cached
      }
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match('/app.html'))
    })
  )
})
