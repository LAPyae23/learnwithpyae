/* NihongoAcademy service worker — offline support.
 *
 * - App pages: network first, fall back to the last cached copy, then /offline.html.
 * - Next.js static assets (/_next/static): cache first (they are content-hashed).
 * - Flashcard data (GET /api/decks...): network first, fall back to cache so cards can be studied offline.
 * - Everything else (auth, AI, writes): never cached.
 */
const VERSION = 'v1';
const PAGES = `na-pages-${VERSION}`;
const STATIC = `na-static-${VERSION}`;
const DATA = `na-data-${VERSION}`;
const PRECACHE = ['/offline.html', '/dashboard', '/flashcards', '/kanji', '/speak'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      // Pages behind login may redirect when not signed in; cache what succeeds and ignore the rest.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/pwa-icon/')) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  if (url.pathname.startsWith('/api/decks')) {
    event.respondWith(networkFirst(request, DATA));
    return;
  }

  if (url.pathname.startsWith('/api/')) return; // never cache other API calls

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, PAGES).catch(async () => (await caches.match('/offline.html')) || Response.error())
    );
  }
});
