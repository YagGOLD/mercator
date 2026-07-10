/* ============================================================
   Mercator — Service Worker (cache-first, 100% offline)
   Só é registrado em HTTPS (ver app.js) — etapa de publicação
   no GitHub Pages. Ao mudar qualquer arquivo, incremente a
   versão do cache para forçar atualização.
   ============================================================ */

var CACHE = "mercator-v9";

var FILES = [
  ".",
  "index.html",
  "manifest.json",
  "css/theme.css",
  "css/creator.css",
  "css/shopping.css",
  "js/palettes.js",
  "js/catalog.js",
  "js/parts/base-head.js",
  "js/parts/hair.js",
  "js/parts/eyes.js",
  "js/parts/mouths.js",
  "js/parts/brows.js",
  "js/parts/facial-hair.js",
  "js/parts/glasses.js",
  "js/parts/accessories.js",
  "js/renderer.js",
  "js/expressions.js",
  "js/animator.js",
  "js/storage.js",
  "js/progression.js",
  "js/toast.js",
  "js/particles.js",
  "js/shopping.js",
  "js/missions.js",
  "js/ui-creator.js",
  "js/ui-home.js",
  "js/ui-list.js",
  "js/ui-compare.js",
  "js/app.js",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
