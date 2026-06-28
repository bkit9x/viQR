const CACHE_NAME = "viqr-shell-v6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./gioi-thieu.html",
  "./styles.css",
  "./intro.css",
  "./app.js",
  "./site.webmanifest",
  "./favicon.svg",
  "./favicon.ico",
  "./favicon-16x16.png",
  "./favicon-32x32.png",
  "./apple-touch-icon.png",
  "./android-chrome-192x192.png",
  "./android-chrome-512x512.png",
  "./images/kha.is-a.dev_viQR_trangChu.png",
  "./images/kha.is-a.dev_viQR_themQR.png",
  "./images/kha.is-a.dev_viQR_menu.png",
  "./images/kha.is-a.dev_viQR_nhapDuLieu.png",
  "./images/kha.is-a.dev_viQR_xuatDuLieu.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
