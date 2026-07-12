/* ============================================================
   Mercator — Service Worker (cache-first, 100% offline)
   Só é registrado em HTTPS (ver app.js) — etapa de publicação
   no GitHub Pages. Ao mudar qualquer arquivo, incremente a
   versão do cache para forçar atualização.
   ============================================================ */

var CACHE = "mercator-v28";

var FILES = [
  ".",
  "index.html",
  "manifest.json",
  "css/theme.css",
  "css/creator.css",
  "css/shopping.css",
  "js/palettes.js",
  "js/catalog.js",
  "js/parts/new-avatar.js",
  "js/assets.js",
  "js/renderer.js",
  "js/expressions.js",
  "js/animator.js",
  "js/storage.js",
  "js/progression.js",
  "js/toast.js",
  "js/particles.js",
  "js/shopping.js",
  "js/backup.js",
  "js/missions.js",
  "js/donation.js",
  "js/ui-creator.js",
  "js/ui-home.js",
  "js/ui-list.js",
  "js/ui-compare.js",
  "js/ui-history.js",
  "js/app.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/favicon.png",
  "icons/pix-qr.png",

  // ===== Assets do avatar (pack New_Avatar) =====
  // Ao adicionar uma variante nova (ex.: HAIR_02.png), inclua o
  // arquivo aqui E incremente a versão do CACHE acima — senão ela
  // não fica disponível offline.
  "New_Avatar/SKIN/SKIN_01.png",
  "New_Avatar/HAIR/HAIR_01.png",
  "New_Avatar/EYES/EYES_01.png",
  "New_Avatar/EYEBROWS/EYEBROWN_01.png",
  "New_Avatar/NOSE/NOSE_01.png",
  "New_Avatar/MOUTH/MOUTH_01.png",
  "New_Avatar/CLOTH/CLOTH_01.png"
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
