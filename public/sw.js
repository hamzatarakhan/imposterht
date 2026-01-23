// Bump this to force all clients to refresh cached assets on the next visit.
const CACHE_NAME = 'imposter-v2';

// Minimal precache for offline boot.
const urlsToCache = ['/', '/index.html', '/favicon.png', '/manifest.json'];

const isAppShellRequest = (request) => {
  // Treat navigation + core app files as "app shell" that should update ASAP.
  if (request.mode === 'navigate') return true;
  const url = new URL(request.url);
  const path = url.pathname;

  // Vite build assets typically live under /assets/ and are JS/CSS.
  if (path.startsWith('/assets/')) return true;

  // Any direct JS/CSS/HTML request should be network-first.
  return (
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.html') ||
    path.endsWith('.mjs')
  );
};

const isStaticAssetRequest = (request) => {
  const url = new URL(request.url);
  const path = url.pathname;
  return (
    request.destination === 'image' ||
    request.destination === 'font' ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.webp') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2')
  );
};

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    // Cache successful GET responses.
    if (request.method === 'GET' && response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Offline fallback for navigations.
    if (request.mode === 'navigate') {
      return cache.match('/');
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (request.method === 'GET' && response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests.
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    // Network-first for app shell (HTML/JS/CSS) so updates show up quickly.
    if (isAppShellRequest(event.request)) {
      return networkFirst(event.request);
    }

    // Cache-first for static assets for fast loads + offline.
    if (isStaticAssetRequest(event.request)) {
      return cacheFirst(event.request);
    }

    // Default: try network, then fall back to cache.
    return networkFirst(event.request);
  })());
});
