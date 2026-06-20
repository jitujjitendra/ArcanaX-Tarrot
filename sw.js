/**
 * ArcanaX Service Worker v1.0.0
 * Caches static assets with cache-first strategy and HTML with network-first.
 */

const CACHE_NAME = 'arcanax-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/tarot-deck.json',
  '/assets/tarot-engine.js',
  '/assets/styles-USFaJe2v.css',
  '/js/card-art-generator.js',
  '/css/arcanax-pages.css',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install: precache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch: network-first for HTML, cache-first for other assets
self.addEventListener('fetch', function (event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  var url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  var isHTMLRequest = request.headers.get('Accept') &&
    request.headers.get('Accept').includes('text/html');
  var isTarotPage = url.pathname.startsWith('/tarot/');

  if (isHTMLRequest || isTarotPage) {
    // Network-first for HTML pages
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (cached) {
          return cached || caches.match('/index.html');
        });
      })
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request).then(function (cached) {
        if (cached) {
          return cached;
        }
        return fetch(request).then(function (response) {
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});
