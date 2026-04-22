// Bump this to force all clients to refresh cached assets on the next visit.
const CACHE_NAME = 'imposter-v4';

// Minimal precache for offline boot.
const urlsToCache = ['/', '/index.html', '/favicon.png', '/manifest.json'];

const isAppShellRequest = (request) => {
  if (request.mode === 'navigate') return true;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith('/assets/')) return true;
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
    if (request.method === 'GET' && response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
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

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches and notify clients
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
    }).then(() => self.clients.claim())
      .then(() => {
        // Notify all clients that a new version is active
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_UPDATED' });
          });
        });
      })
  );
});

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    if (isAppShellRequest(event.request)) {
      return networkFirst(event.request);
    }
    if (isStaticAssetRequest(event.request)) {
      return cacheFirst(event.request);
    }
    return networkFirst(event.request);
  })());
});
