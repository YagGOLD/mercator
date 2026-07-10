/* ============================================================
   Mercator — Expressões do mascote
   Presets que combinam olhos + boca + sobrancelha do catálogo.
   O mascote "interage" trocando de expressão quando o usuário
   usa o app (marcar item, concluir compra, desbloquear...).
   ============================================================ */

window.Expressions = (function () {

  var PRESETS = {
    neutro:      { eyes: "eyes_grandes",     mouth: "mouth_neutra",   brows: "brows_reta" },
    sorrindo:    { eyes: "eyes_sorrindo",    mouth: "mouth_sorrindo", brows: "brows_reta" },
    feliz:       { eyes: "eyes_felizes",     mouth: "mouth_feliz",    brows: "brows_arqueada" },
    surpreso:    { eyes: "eyes_redondos",    mouth: "mouth_surpresa", brows: "brows_preocupada" },
    rindo:       { eyes: "eyes_fechados",    mouth: "mouth_rindo",    brows: "brows_arqueada" },
    determinado: { eyes: "eyes_determinado", mouth: "mouth_neutra",   brows: "brows_brava" }
  };

  function overridesFor(name) {
    return PRESETS[name] ? { parts: PRESETS[name] } : null;
  }

  // Toca uma expressão num canvas estático (lista, resumo, home).
  // ms = duração; omitido → expressão fica (ex.: resumo da compra).
  var timers = {};
  function playOn(canvas, state, name, ms) {
    var ov = overridesFor(name);
    if (!ov || !canvas) return;
    Renderer.draw(canvas, state, ov);
    var key = canvas.id || "_";
    clearTimeout(timers[key]);
    if (ms) {
      timers[key] = setTimeout(function () { Renderer.draw(canvas, state); }, ms);
    }
  }

  return { PRESETS: PRESETS, overridesFor: overridesFor, playOn: playOn };
})();
