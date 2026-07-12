/* ============================================================
   Mercator — Persistência do avatar (localStorage)
   Schema versionado + trilho de migração + saneamento: um id que
   não exista mais no catálogo cai no default da categoria — a
   renderização nunca quebra.

   v1 → v2: troca do avatar procedural (matrizes de pixel, peças
   como "hair_franja" + paletas de cor) pelo pack de pixel-art
   New_Avatar (peças como "hair_01", cores embutidas na arte).
   Os ids antigos não existem mais e o bloco "colors" perdeu a
   função, então o avatar salvo volta para o padrão do pack novo.

   Nome "Store" (não "Storage") para não sombrear a interface
   nativa window.Storage do navegador.
   ============================================================ */

window.Store = (function () {

  var KEY = "mercator.avatar";
  var CURRENT_VERSION = 2;

  var migrations = {
    // Avatar do motor antigo: nenhuma peça é aproveitável (outro
    // estilo, outra grade). Preserva só o meta (createdAt/skipped).
    2: function (v1) {
      return {
        schemaVersion: 2,
        parts: {},                 // sanitize() preenche com os defaults
        meta: v1.meta || {}
      };
    }
  };

  function defaultAvatar() {
    var parts = {};
    AvatarCatalog.CATEGORIES.forEach(function (cat) {
      parts[cat.id] = AvatarCatalog.defaultFor(cat.id);
    });
    return {
      schemaVersion: CURRENT_VERSION,
      parts: parts,
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };
  }

  function sanitize(data) {
    var clean = defaultAvatar();
    if (data.parts) {
      Object.keys(clean.parts).forEach(function (cat) {
        var id = data.parts[cat];
        if (id === null) { clean.parts[cat] = null; return; }   // categoria opcional: "Nenhum"
        clean.parts[cat] = AvatarCatalog.get(id) ? id : AvatarCatalog.defaultFor(cat);
      });
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
