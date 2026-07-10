/* ============================================================
   Mercator — Catálogo central de partes do avatar
   Cada parte é registrada pelos arquivos em js/parts/ via
   AvatarCatalog.register({...}). O catálogo valida os dados no
   load (ids duplicados, caractere sem legend, linhas tortas)
   para pegar erro de autoria imediatamente no console.

   Schema de uma parte:
   {
     id: "hair_franja",
     category: "hair" | "eyes" | "mouth" | "brows" | "beard"
             | "mustache" | "glasses" | "accessory",
     name: "Franja",
     colorable: "skin" | "hair" | "eyes" | null,
     offset: { x, y },                  // posição na grade 48x48
     legend: { "1": "hair.base", ... }, // char → slot semântico ou "#hex"
     frames: { default: [...], closed?, smile?, raised? },
     back: null | { offset, legend, frames },   // camada atrás da cabeça
     none: true,          // item "Nenhum" (categorias opcionais)
     locked: false,       // fase 2
     unlockedBy: null,    // fase 2: { type: "level"|"mission"|"event", value }
     price: null,         // fase 2: custo em gemas (badge no card)
     since: 1             // versão do catálogo em que entrou
   }
   ============================================================ */

window.AvatarCatalog = (function () {

  var GRID = 48;

  var CATEGORIES = [
    { id: "hair",      name: "Cabelo",      colorable: "hair", optional: false },
    { id: "eyes",      name: "Olhos",       colorable: "eyes", optional: false },
    { id: "mouth",     name: "Boca",        colorable: null,   optional: false },
    { id: "brows",     name: "Sobrancelha", colorable: null,   optional: false },
    { id: "skin",      name: "Pele",        colorable: "skin", optional: false, swatchOnly: true },
    { id: "beard",     name: "Barba",       colorable: null,   optional: true },
    { id: "mustache",  name: "Bigode",      colorable: null,   optional: true },
    { id: "glasses",   name: "Óculos",      colorable: null,   optional: true },
    { id: "accessory", name: "Acessórios",  colorable: null,   optional: true }
  ];

  var parts = {};        // id → parte
  var byCategory = {};   // categoria → [partes na ordem de registro]

  function warn(msg, part) {
    console.warn("[AvatarCatalog] " + msg, part ? "(" + part.id + ")" : "");
  }

  function validateFrames(part, frames, offset) {
    Object.keys(frames).forEach(function (frameName) {
      var rows = frames[frameName];
      var width = rows[0] ? rows[0].length : 0;
      rows.forEach(function (row, i) {
        if (row.length !== width) warn("linha " + i + " do frame '" + frameName + "' tem largura diferente", part);
        for (var c = 0; c < row.length; c++) {
          var ch = row[c];
          if (ch !== "." && !part._legendFor(frames)[ch]) warn("caractere '" + ch + "' sem legend no frame '" + frameName + "'", part);
        }
      });
      if (offset.x < 0 || offset.y < 0 || offset.x + width > GRID || offset.y + rows.length > GRID) {
        warn("frame '" + frameName + "' sai da grade " + GRID + "x" + GRID, part);
      }
    });
  }

  function register(part) {
    if (parts[part.id]) { warn("id duplicado", part); return; }
    if (part.locked === undefined) part.locked = false;
    if (part.unlockedBy === undefined) part.unlockedBy = null;
    if (part.price === undefined) part.price = null;
    if (part.since === undefined) part.since = 1;

    if (!part.none) {
      // _legendFor: frames da frente usam part.legend; os de trás, back.legend
      part._legendFor = function (frames) {
        return (part.back && frames === part.back.frames) ? part.back.legend : part.legend;
      };
      validateFrames(part, part.frames, part.offset);
      if (part.back) validateFrames(part, part.back.frames, part.back.offset);
    }

    parts[part.id] = part;
    (byCategory[part.category] = byCategory[part.category] || []).push(part);
  }

  function get(id) { return parts[id] || null; }
  function list(category) { return byCategory[category] || []; }

  // Primeiro item "de verdade" da categoria (pula o "Nenhum")
  function defaultFor(category) {
    var items = list(category);
    var cat = CATEGORIES.find(function (c) { return c.id === category; });
    if (cat && cat.optional) return items[0] ? items[0].id : null; // opcionais: default = "Nenhum"
    var real = items.find(function (p) { return !p.none; });
    return real ? real.id : null;
  }

  return {
    GRID: GRID,
    CATEGORIES: CATEGORIES,
    register: register,
    get: get,
    list: list,
    defaultFor: defaultFor
  };
})();
