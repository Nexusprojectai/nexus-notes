/* ══════════════════════════════════════════════════════════
   Nexus Notes — Service Worker
   Caches all app assets for full offline support.
   ══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'nexus-notes-v1';

const PRECACHE_URLS = [
  '/nexus-notes/',
  '/nexus-notes/index.html',
  '/nexus-notes/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/nexus-notes/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
