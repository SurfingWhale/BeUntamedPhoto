/* BeUntamed service worker.
 *
 * Its only job is to make the site installable and to save repeat visitors the
 * re-download of assets that can never change. It deliberately does NOT do
 * offline pages.
 *
 * Only content-hashed, immutable files are cached: /_next/static/** carries a
 * build hash in its path. HTML, the Supabase API, auth, and storage URLs are
 * never touched — the fetch handler returns without calling respondWith, so
 * the browser does exactly what it would with no worker at all. That is the
 * whole reason an installed copy can never show yesterday's gallery.
 *
 * The /icons/ prefix used to be in here, and it was the one path in this file
 * that is not content-hashed. `/icons/icon-192.png` is a fixed address whose bytes
 * change whenever scripts/build-icons.mjs runs — which is exactly what
 * happened when the mark became the BeUntamed wordmark. A cache-first entry
 * under a stable name is a file kept forever, and nothing here would ever have
 * evicted it: `activate` deletes caches whose name is not VERSION, and VERSION
 * was a constant nobody had touched since the worker was written. So anyone
 * with the site installed would have gone on seeing the old home-screen icon
 * for as long as they kept it installed, and no deploy could have reached them.
 *
 * They are out of the cache rather than fixed in it. Three icons fetched once
 * per install is not a saving worth a permanent staleness risk, and the
 * browser's own HTTP cache handles them perfectly well.
 *
 * VERSION is bumped with this change, which is what drops the icons anybody is
 * already holding. **Bump it whenever what may be cached changes** — it is the
 * only eviction this worker has.
 */

const VERSION = "beuntamed-v2";

const isImmutable = (url) =>
  url.origin === self.location.origin && url.pathname.startsWith("/_next/static/");

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
 * running worker drops its caches before it is unregistered. The message name
 * is a wire format shared with components/pwa.tsx, so it is left as it was:
 * renaming it would leave a new page unable to talk to an installed worker. */
self.addEventListener("message", (event) => {
  if (event.data !== "untamed:purge") return;
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    })(),
  );
});
