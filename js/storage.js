/* ============================================================
   Mercator — Persistência do avatar (localStorage)
   Schema versionado + trilho de migração + saneamento: um id
   que não exista mais no catálogo (após updates futuros) cai
   no default da categoria — a renderização nunca quebra.
   Nome "Store" (não "Storage") para não sombrear a interface
   nativa window.Storage do navegador.
   ============================================================ */

window.Store = (function () {

  var KEY = "mercator.avatar";
  var CURRENT_VERSION = 1;

  // Migrações futuras: migrations[2] = function (dadosV1) { ...retorna dadosV2 }
  var migrations = {};

  function defaultAvatar() {
    var parts = {};
    AvatarCatalog.CATEGORIES.forEach(function (cat) {
      if (cat.swatchOnly) return;
      parts[cat.id] = AvatarCatalog.defaultFor(cat.id);
    });
    return {
      schemaVersion: CURRENT_VERSION,
      parts: parts,
      colors: { skin: "skin_02", hair: "hairc_castanho", eyes: "eyec_castanho" },
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };
  }

  function sanitize(data) {
    var clean = defaultAvatar();
    if (data.parts) {
      Object.keys(clean.parts).forEach(function (cat) {
        var id = data.parts[cat];
        if (id === null) { clean.parts[cat] = null; return; }
        clean.parts[cat] = AvatarCatalog.get(id) ? id : AvatarCatalog.defaultFor(cat);
      });
    }
    if (data.colors) {
      var P = window.Palettes;
      clean.colors.skin = P.byId(P.skins, data.colors.skin).id;
      clean.colors.hair = P.byId(P.hairColors, data.colors.hair).id;
      clean.colors.eyes = P.byId(P.eyeColors, data.colors.eyes).id;
    }
    if (data.meta) clean.meta = data.meta;
    clean.schemaVersion = CURRENT_VERSION;
    return clean;
  }

  function loadAvatar() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      for (var v = data.schemaVersion || 1; v < CURRENT_VERSION; v++) {
        if (migrations[v + 1]) data = migrations[v + 1](data);
      }
      return sanitize(data);
    } catch (e) {
      console.warn("[Store] avatar salvo ilegível, recomeçando", e);
      return null;
    }
  }

  function saveAvatar(state, extraMeta) {
    var data = sanitize(state);
    data.meta.updatedAt = new Date().toISOString();
    if (extraMeta) Object.keys(extraMeta).forEach(function (k) { data.meta[k] = extraMeta[k]; });
    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  }

  return {
    KEY: KEY,
    loadAvatar: loadAvatar,
    saveAvatar: saveAvatar,
    defaultAvatar: defaultAvatar
  };
})();
