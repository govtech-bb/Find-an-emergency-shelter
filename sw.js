/* Find an emergency shelter — service worker.
 *
 * Caches the start page, guidance page, find page, design system CSS,
 * service CSS, font files and the small crest so the service works
 * offline once visited. Hurricane scenario: internet may go down for
 * days. A user who opened this page during pre-season can still reach
 * it offline.
 *
 * Cache strategy:
 *   - Install: pre-cache the critical assets.
 *   - Fetch: stale-while-revalidate for HTML/CSS/JS. Show cached
 *     content immediately; refresh in the background.
 *   - Activate: clear old caches by version.
 */

const CACHE_VERSION = 'fas-2026-05-27-v1';
const PRECACHE = [
  './',
  './index.html',
  './find.html',
  './guidance.html',
  './dist/styles.css',
  './css/service.css',
  './js/shelters.js',
  './dist/assets/images/govbb-logo.svg',
  './dist/assets/images/govbb-crest-small.svg',
  './dist/assets/images/favicon.ico',
  './dist/assets/fonts/figtree-latin.woff2',
  './dist/assets/fonts/figtree-latin-ext.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GETs. External calls (Google Maps,
  // tel: links etc.) go to the network as normal.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return response;
        })
        .catch(() => cached); // offline: fall back to cache
      return cached || network;
    })
  );
});
