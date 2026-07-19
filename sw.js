const CACHE_NAME = 'grocery-erp-v1';
const ASSETS = [
  '/grocery_erp/',
  '/grocery_erp/grocery_erp.html',
  '/grocery_erp/manifest.json',
  '/grocery_erp/icon-192.png',
  '/grocery_erp/icon-512.png'
];

// Install - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).catch(() => {
      // If some assets fail, continue anyway
      return Promise.resolve();
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then(networkResponse => {
        // Cache new requests
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.mode === 'navigate') {
        return caches.match('/grocery_erp/grocery_erp.html');
      }
    })
  );
});
