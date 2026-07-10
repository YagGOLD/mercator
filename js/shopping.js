/* ============================================================
   Mercator — Listas de compras (fase 3)
   Sheets de dados em localStorage:
   - mercator.lists   → listas abertas/concluídas com itens
   - mercator.history → resumo das compras concluídas (p/ missões,
     sequência e comparação de economia)
   Economia = soma de (previsto − pago) × qtd quando positivo.
   ============================================================ */

window.Shopping = (function () {

  var KEY = "mercator.lists";
  var HKEY = "mercator.history";

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function loadLists() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function saveLists(lists) { localStorage.setItem(KEY, JSON.stringify(lists)); }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HKEY)) || []; }
    catch (e) { return []; }
  }
  function saveHistory(h) { localStorage.setItem(HKEY, JSON.stringify(h)); }

  function getList(id) {
    return loadLists().find(function (l) { return l.id === id; }) || null;
  }

  function updateList(list) {
    var lists = loadLists();
    var i = lists.findIndex(function (l) { return l.id === list.id; });
    if (i === -1) lists.unshift(list); else lists[i] = list;
    saveLists(lists);
  }

  function createList(name) {
    var list = {
      id: uid(),
      name: name || "Compras",
      status: "aberta",
      createdAt: new Date().toISOString(),
      items: []
    };
    updateList(list);
    return list;
  }

  function removeList(id) {
    saveLists(loadLists().filter(function (l) { return l.id !== id; }));
  }

  function addItem(list, name, qty, est) {
    list.items.push({
      id: uid(),
      name: name,
      qty: Math.max(1, qty | 0),
      est: est > 0 ? est : null,           // preço previsto (R$)
      paid: est > 0 ? est : null,          // pago já nasce = previsto; ajuste só se diferir
      checked: false
    });
    updateList(list);
  }

  function removeItem(list, itemId) {
    list.items = list.items.filter(function (i) { return i.id !== itemId; });
    updateList(list);
  }

  // Totais da lista: total geral (todos os itens, pago||previsto),
  // carrinho (só marcados), previsto, economia e progresso.
  // Qualquer edição de qtd/valor recalcula tudo.
  function totals(list) {
    var est = 0, listTotal = 0, spent = 0, savings = 0, checked = 0;
    list.items.forEach(function (i) {
      var price = (i.paid !== null ? i.paid : i.est);
      if (i.est) est += i.est * i.qty;
      if (price) listTotal += price * i.qty;
      if (i.checked && price) spent += price * i.qty;
      if (i.checked && i.est && i.paid !== null && i.paid < i.est) {
        savings += (i.est - i.paid) * i.qty;
      }
      if (i.checked) checked++;
    });
    return { est: est, listTotal: listTotal, spent: spent, savings: savings,
             checked: checked, count: list.items.length };
  }

  // Lista pronta: sai do planejamento e vai para o modo mercado
  function toMarket(list) {
    list.status = "mercado";
    updateList(list);
  }

  // ===== Comparador de compras =====
  function normName(s) { return String(s).trim().toLowerCase(); }
  function unitPrice(i) { return i.paid !== null ? i.paid : i.est; }

  // Compara duas listas concluídas item a item (casando pelo nome).
  // diff = preço B − preço A (positivo = ficou mais caro).
  function compare(listA, listB) {
    var mapB = {};
    listB.items.forEach(function (i) { mapB[normName(i.name)] = i; });
    var seen = {};
    var rows = [];

    listA.items.forEach(function (ia) {
      var key = normName(ia.name);
      seen[key] = true;
      var ib = mapB[key] || null;
      var pa = unitPrice(ia), pb = ib ? unitPrice(ib) : null;
      rows.push({
        name: ia.name,
        pa: pa, pb: pb,
        qa: ia.qty, qb: ib ? ib.qty : null,
        diff: (pa !== null && pb !== null) ? Math.round((pb - pa) * 100) / 100 : null
      });
    });
    listB.items.forEach(function (ib) {
      var key = normName(ib.name);
      if (seen[key]) return;
      rows.push({ name: ib.name, pa: null, pb: unitPrice(ib), qa: null, qb: ib.qty, diff: null });
    });

    // Itens com diferença primeiro (aumentos no topo — transparência)
    rows.sort(function (a, b) {
      var da = a.diff === null ? -Infinity : Math.abs(a.diff);
      var db = b.diff === null ? -Infinity : Math.abs(b.diff);
      return db - da;
    });

    return { rows: rows, totalA: totals(listA).spent, totalB: totals(listB).spent };
  }

  // Conclui a compra: grava histórico e devolve o resumo
  function conclude(list) {
    var t = totals(list);
    list.status = "concluida";
    list.concludedAt = new Date().toISOString();
    updateList(list);
    var h = loadHistory();
    h.unshift({
      date: list.concludedAt,
      name: list.name,
      spent: Math.round(t.spent * 100) / 100,
      savings: Math.round(t.savings * 100) / 100,
      itemCount: t.count
    });
    saveHistory(h);
    return t;
  }

  // Delta de mercado entre as DUAS últimas compras concluídas:
  // quanto foi "perdido" para aumentos de preço (diff > 0 × qtd
  // comprada) e quanto os preços caíram. Alimenta o painel
  // "Total de despesa" da Home.
  function marketDelta() {
    var done = loadLists()
      .filter(function (l) { return l.status === "concluida"; })
      .sort(function (a, b) { return new Date(b.concludedAt || 0) - new Date(a.concludedAt || 0); });
    if (done.length < 2) return null;

    var cmp = compare(done[1], done[0]);   // A = anterior, B = mais recente
    var lost = 0, dropped = 0;
    cmp.rows.forEach(function (r) {
      if (r.diff === null) return;
      var qty = r.qb || 1;
      if (r.diff > 0) lost += r.diff * qty;
      else if (r.diff < 0) dropped += (-r.diff) * qty;
    });
    return {
      lost: Math.round(lost * 100) / 100,
      dropped: Math.round(dropped * 100) / 100
    };
  }

  // Garante que toda lista concluída tenha entrada no histórico
  // (cura dados de versões antigas e mantém as duas fontes iguais —
  // o Comparador lê as listas; os painéis de economia, o histórico)
  function syncHistory() {
    var h = loadHistory();
    var have = {};
    h.forEach(function (c) { have[c.date] = true; });
    var changed = false;
    loadLists().forEach(function (l) {
      if (l.status !== "concluida" || !l.concludedAt || have[l.concludedAt]) return;
      var t = totals(l);
      h.push({
        date: l.concludedAt,
        name: l.name,
        spent: Math.round(t.spent * 100) / 100,
        savings: Math.round(t.savings * 100) / 100,
        itemCount: t.count
      });
      changed = true;
    });
    if (changed) {
      h.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      saveHistory(h);
    }
    return h;
  }

  function fmt(n) {
    return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return {
    loadLists: loadLists,
    loadHistory: loadHistory,
    getList: getList,
    updateList: updateList,
    createList: createList,
    removeList: removeList,
    addItem: addItem,
    removeItem: removeItem,
    totals: totals,
    toMarket: toMarket,
    compare: compare,
    marketDelta: marketDelta,
    conclude: conclude,
    syncHistory: syncHistory,
    fmt: fmt
  };
})();
