// Service Worker v13 - Cache-first + background update
// Opens instantly from cache. Checks for updates in background.
// New version takes effect next time app opens.
var CACHE = 'family-budget-v15';
var ASSETS = [
  './', './index.html', './app.js', './storage.js',
  './firebase-config.js', './manifest.webmanifest',
  './icon-192.png', './icon-512.png',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(ASSETS).catch(function() {});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Firebase/Google: always network, never cache
  if (url.hostname.includes('firestore') || url.hostname.includes('firebaseio') ||
      url.hostname.includes('googleapis') || url.hostname.includes('firebase') ||
      url.hostname.includes('gstatic')) {
    return;
  }

  // Everything else: cache-first, then stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      // Background fetch to update cache (don't block response)
      var fetchPromise = fetch(e.request).then(function(resp) {
        if (resp.ok && e.request.method === 'GET') {
          caches.open(CACHE).then(function(c) { c.put(e.request, resp.clone()); });
        }
        return resp;
      }).catch(function() { return cached; });

      // Return cached immediately if available, otherwise wait for network
      return cached || fetchPromise;
    })
  );
});
