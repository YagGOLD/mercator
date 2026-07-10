/* ============================================================
   Mercator — Motor de renderização do avatar
   Desenha o avatar em camadas num canvas 48x48 (upscale via CSS
   com image-rendering: pixelated). Cada parte é uma matriz de
   caracteres cuja legend aponta para slots semânticos de cor
   ("skin.base", "hair.light"...) resolvidos contra as cores
   escolhidas — é assim que a recolorização funciona.
   ============================================================ */

window.Renderer = (function () {

  var GRID = AvatarCatalog.GRID;

  // Ordem de empilhamento (fase 2 reserva "background" antes e "frame" depois)
  var LAYER_ORDER = [
    "accessoryBack", "hairBack",
    "head", "mouth", "eyes", "brows",
    "mustache", "beard",
    "hairFront", "glasses", "accessory"
  ];

  var thumbCache = {};

  // ===== Resolução de cores =====
  function buildColorMap(state) {
    var P = window.Palettes;
    var skin = P.byId(P.skins, state.colors.skin);
    var hair = P.byId(P.hairColors, state.colors.hair);
    var eye  = P.byId(P.eyeColors, state.colors.eyes);
    return {
      "outline":     P.outline,
      "skin.base":   skin.base,  "skin.shadow": skin.shadow,
      "skin.light":  skin.light, "skin.blush":  skin.blush,
      "hair.base":   hair.base,  "hair.shadow": hair.shadow, "hair.light": hair.light,
      "eye.iris":    eye.base,   "eye.dark":    eye.shadow,  "eye.light":  eye.light,
      "white":       P.fixed.white,
      "mouth.inner": P.fixed.mouth,
      "tongue":      P.fixed.tongue,
      "metal":       P.fixed.metal,
      "metal.shadow": P.fixed.metalShadow
    };
  }

  function resolveColor(slot, colorMap) {
    if (slot.charAt(0) === "#") return slot;   // hex fixo direto na legend
    return colorMap[slot] || "#ff00ff";        // magenta = slot desconhecido (erro visível)
  }

  // ===== Desenho de uma matriz =====
  function drawMatrix(ctx, rows, legend, offset, colorMap, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    for (var y = 0; y < rows.length; y++) {
      var row = rows[y];
      for (var x = 0; x < row.length; x++) {
        var ch = row[x];
        if (ch === ".") continue;
        var slot = legend[ch];
        if (!slot) continue;
        ctx.fillStyle = resolveColor(slot, colorMap);
        ctx.fillRect(offset.x + x + dx, offset.y + y + dy, 1, 1);
      }
    }
  }

  // Escolhe o frame: override → default
  function pickFrame(frames, wanted) {
    if (wanted && frames[wanted]) return frames[wanted];
    return frames.default;
  }

  // ===== Monta a lista de camadas a partir do estado =====
  // partOverrides (opcional): troca temporária de partes p/ expressões
  // do mascote (ex.: { eyes: "eyes_fechados", mouth: "mouth_rindo" })
  function layersFor(state, partOverrides) {
    var effective = {};
    Object.keys(state.parts).forEach(function (k) { effective[k] = state.parts[k]; });
    if (partOverrides) Object.keys(partOverrides).forEach(function (k) { effective[k] = partOverrides[k]; });

    var layers = {}; // layerName → { part, isBack }
    Object.keys(effective).forEach(function (category) {
      var id = effective[category];
      if (!id) return;
      var part = AvatarCatalog.get(id);
      if (!part || part.none) return;
      var front = (category === "hair") ? "hairFront" : category;
      layers[front] = { part: part, isBack: false };
      if (part.back) {
        var backLayer = (category === "hair") ? "hairBack" : category + "Back";
        layers[backLayer] = { part: part, isBack: true };
      }
    });
    // Cabeça sempre presente
    layers.head = { part: AvatarCatalog.get("base_head"), isBack: false };
    return layers;
  }

  /**
   * Desenha o avatar completo.
   * overrides (opcional, usado pelo animator e pelas expressões):
   *   { frames: { eyes: "closed" }, dy: { brows: -1 },
   *     parts: { eyes: "eyes_fechados", mouth: "mouth_rindo" } }
   */
  function draw(canvas, state, overrides) {
    overrides = overrides || {};
    var frameOv = overrides.frames || {};
    var dyOv = overrides.dy || {};
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var colorMap = buildColorMap(state);
    var layers = layersFor(state, overrides.parts);

    LAYER_ORDER.forEach(function (layerName) {
      var entry = layers[layerName];
      if (!entry) return;
      var part = entry.part;
      var source = entry.isBack ? part.back : part;
      // categoria da camada p/ overrides (hairFront → hair)
      var cat = part.category;
      var rows = pickFrame(source.frames, frameOv[cat]);
      drawMatrix(ctx, rows, source === part ? part.legend : part.back.legend,
                 source.offset, colorMap, 0, dyOv[cat] || 0);
    });
  }

  // ===== Thumbnails (cards do carrossel e ícones de categoria) =====
  // Renderiza a parte sobre uma cabeça-base neutra num canvas 48px.
  function neutralState(state) {
    return {
      parts: {
        hair: null, eyes: "eyes_grandes", mouth: "mouth_sorrindo",
        brows: null, beard: null, mustache: null, glasses: null, accessory: null
      },
      colors: {
        skin: state ? state.colors.skin : "skin_02",
        hair: state ? state.colors.hair : "hairc_castanho",
        eyes: state ? state.colors.eyes : "eyec_castanho"
      }
    };
  }

  function thumbnail(partId, state) {
    var key = partId + "|" + state.colors.skin + "|" + state.colors.hair + "|" + state.colors.eyes;
    if (thumbCache[key]) return thumbCache[key];

    var canvas = document.createElement("canvas");
    canvas.width = GRID; canvas.height = GRID;
    var part = AvatarCatalog.get(partId);
    var thumbState = neutralState(state);

    if (part && !part.none) {
      // rosto neutro + a parte em questão (substitui a da mesma categoria)
      thumbState.parts[part.category] = partId;
      // partes de rosto ficam mais legíveis sem cabelo por cima
      if (part.category !== "hair") thumbState.parts.hair = null;
    }
    draw(canvas, thumbState);
    thumbCache[key] = canvas;
    return canvas;
  }

  function clearThumbCache() { thumbCache = {}; }

  // Avatar aleatório (usado na gallery e no botão de sorte)
  function randomState() {
    var P = window.Palettes;
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    var parts = {};
    AvatarCatalog.CATEGORIES.forEach(function (cat) {
      if (cat.swatchOnly) return;
      var items = AvatarCatalog.list(cat.id);
      if (items.length) parts[cat.id] = pick(items).id;
    });
    return {
      parts: parts,
      colors: { skin: pick(P.skins).id, hair: pick(P.hairColors).id, eyes: pick(P.eyeColors).id }
    };
  }

  return {
    GRID: GRID,
    draw: draw,
    thumbnail: thumbnail,
    clearThumbCache: clearThumbCache,
    randomState: randomState
  };
})();
