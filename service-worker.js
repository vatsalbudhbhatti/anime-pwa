// service-worker.js
const CACHE_NAME = 'anime-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event with different caching strategies
self.addEventListener('fetch', event => {
  // Strategy 1: Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );

  /* Strategy 2: Network First, Cache Fallback
  event.respondWith(
      fetch(event.request)
          .catch(() => caches.match(event.request))
  );
  */

  /* Strategy 3: Stale While Revalidate
  event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request).then(cachedResponse => {
              const fetchedResponse = fetch(event.request).then(networkResponse => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
              });
              return cachedResponse || fetchedResponse;
          });
      })
  );
  */

  /* Strategy 4: Cache Only
  event.respondWith(
      caches.match(event.request)
  );
  */

  /* Strategy 5: Network Only
  event.respondWith(
      fetch(event.request)
  );
  */
});