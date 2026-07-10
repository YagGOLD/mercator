/* ============================================================
   Mercator — Missões (fase 3)
   O progresso é sempre recalculado a partir do histórico de
   compras (stateless); só o "resgatado" é persistido. Missões
   completas são resgatadas automaticamente com toast + XP/gemas.
   ============================================================ */

window.Missions = (function () {

  var KEY = "mercator.missions";

  var DEFS = [
    { id: "m_primeira", name: "Primeira compra", desc: "Conclua sua primeira compra",
      target: 1, xp: 50, gems: 20,
      calc: function (h) { return h.length; } },
    { id: "m_frequente", name: "Comprador frequente", desc: "Conclua 3 compras",
      target: 3, xp: 60, gems: 25,
      calc: function (h) { return h.length; } },
    { id: "m_economizador", name: "Economizador", desc: "Economize R$ 20 no total",
      target: 20, xp: 40, gems: 15,
      calc: function (h) {
        return h.reduce(function (s, c) { return s + (c.savings || 0); }, 0);
      } },
    { id: "m_lista_cheia", name: "Lista cheia", desc: "Conclua uma compra com 10+ itens",
      target: 1, xp: 30, gems: 10,
      calc: function (h) {
        return h.filter(function (c) { return c.itemCount >= 10; }).length;
      } }
  ];

  function loadClaimed() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function saveClaimed(ids) { localStorage.setItem(KEY, JSON.stringify(ids)); }

  // Status de todas as missões p/ exibição
  function status() {
    var h = Shopping.loadHistory();
    var claimed = loadClaimed();
    return DEFS.map(function (d) {
      var value = d.calc(h);
      return {
        def: d,
        value: Math.min(value, d.target),
        done: value >= d.target,
        claimed: claimed.indexOf(d.id) !== -1
      };
    });
  }

  // Resgata tudo que estiver completo e não resgatado.
  // Devolve a lista de missões resgatadas (rewards já aplicados).
  function claimReady(progress) {
    var claimed = loadClaimed();
    var granted = [];
    status().forEach(function (m) {
      if (m.done && !m.claimed) {
        claimed.push(m.def.id);
        Progress.addGems(progress, m.def.gems);
        granted.push({ def: m.def, ups: Progress.addXp(progress, m.def.xp) });
      }
    });
    if (granted.length) saveClaimed(claimed);
    return granted;
  }

  return { status: status, claimReady: claimReady };
})();
