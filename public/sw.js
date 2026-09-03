/* UNTAMED service worker.
 *
 * Its only job is to make the site installable and to save repeat visitors the
 * re-download of assets that can never change. It deliberately does NOT do
 * offline pages.
 *
 * Only content-hashed, immutable files are cached: /_next/static/** carries a
 * build hash in its path, and the icons are versioned by deploy. HTML, the
 * Supabase API, auth, and storage URLs are never touched — the fetch handler
 * returns without calling respondWith, so the browser does exactly what it
 * would with no worker at all. That is the whole reason an installed copy can
 * never show yesterday's gallery.
 */

const VERSION = "untamed-v1";

const isImmutable = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"));

self.addEventListener("install", (event) => {
  // Nothing is precached; the first request for an asset fills the cache.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== VERSION).map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (!isImmutable(url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(request);
      if (hit) return hit;

      const response = await fetch(request);
      // Opaque and error responses are not worth storing.
      if (response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});

/* The darkroom's "Clear cache" control talks to the worker through this, so a
 * running worker drops its caches before it is unregistered. */
self.addEventListener("message", (event) => {
  if (event.data !== "untamed:purge") return;
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    })(),
  );
});
