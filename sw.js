/* さくらマッチ: 静的アセットのオフライン閲覧用 Service Worker */
const CACHE_NAME = "sakura-site-v2";
const CORE_ASSETS = [
  "./index.html",
  "./goals.html",
  "./analytics.html",
  "./style.css",
  "./site-nav.css",
  "./offline.css",
  "./trash-panel.css",
  "./goal-notice-overlay.css",
  "./script.js",
  "./offline-sync-core.js",
  "./offline-ui.js",
  "./trash-core.js",
  "./trash-ui.js",
  "./accordion.js",
  "./site-nav.js",
  "./notify-core.js",
  "./goal-notice-overlay.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
          return Promise.resolve();
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          if (res.ok && res.type === "basic") {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
