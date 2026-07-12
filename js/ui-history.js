/* ============================================================
   Mercator — Tela de Histórico de compras
   Lista as compras concluídas (mais recentes primeiro, ou por maior
   gasto) com gasto, economia e nº de itens. Dá para apagar UMA compra
   ou TODAS — sempre com confirmação, porque não há como desfazer.

   Cuidado importante: as listas CONCLUÍDAS são a fonte da verdade do
   histórico (Shopping.syncHistory recria as linhas a partir delas a
   cada render). Por isso apagar aqui apaga também a lista concluída
   correspondente — senão a compra reapareceria sozinha.
   ============================================================ */

window.UIHistory = (function () {

  var sort = "recent";      // "recent" | "spent"
  var pending = null;       // ação aguardando o "Sim, apagar"

  function $(id) { return document.getElementById(id); }

  function open() {
    $("histConfirm").classList.add("hidden");
    pending = null;
    wire();
    // Passa pelo setSort (e não por "sort = ..." direto) para que os chips
    // voltem a refletir a ordenação real — senão o chip fica aceso em
    // "Maior gasto" enquanto a lista já voltou para a ordem por data.
    setSort("recent");
  }

  // Ordem decrescente: por data (padrão) ou por valor gasto
  function entries() {
    var h = Shopping.syncHistory().slice();
    h.sort(sort === "spent"
      ? function (a, b) { return (b.spent || 0) - (a.spent || 0); }
      : function (a, b) { return new Date(b.date) - new Date(a.date); });
    return h;
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return String(d.getDate()).padStart(2, "0") + "/" +
           String(d.getMonth() + 1).padStart(2, "0") + "/" +
           d.getFullYear();
  }

  function render() {
    var h = entries();

    // Resumo do topo
    var spent = h.reduce(function (s, c) { return s + (c.spent || 0); }, 0);
    var saved = h.reduce(function (s, c) { return s + (c.savings || 0); }, 0);
    $("histTotals").innerHTML =
      '<div class="hist-tot"><span>Compras</span><b>' + h.length + '</b></div>' +
      '<div class="hist-tot"><span>Total gasto</span><b>' + Shopping.fmt(spent) + '</b></div>' +
      '<div class="hist-tot"><span>Total economizado</span><b class="save">' +
        Shopping.fmt(saved) + '</b></div>';

    $("btnHistClearAll").disabled = !h.length;

    var box = $("histList");
    box.innerHTML = "";

    if (!h.length) {
      var empty = document.createElement("div");
      empty.className = "empty-hint";
      empty.textContent = "Nenhuma compra concluída ainda — o histórico aparece aqui depois da sua primeira compra.";
      box.appendChild(empty);
      return;
    }

    // A compra mais cara ganha destaque em vermelho — vale em qualquer
    // ordenação (só faz sentido comparar quando há mais de uma compra;
    // se todas estiverem zeradas, não há "maior" para destacar).
    var maxSpent = h.reduce(function (m, c) { return Math.max(m, c.spent || 0); }, 0);
    var destacar = h.length > 1 && maxSpent > 0;

    h.forEach(function (c) {
      var row = document.createElement("div");
      row.className = "hist-row";

      var detail = fmtDate(c.date) + " · " + c.itemCount +
                   (c.itemCount === 1 ? " item" : " itens");
      if (c.savings > 0) {
        detail += ' · <em class="save">economizou ' + Shopping.fmt(c.savings) + "</em>";
      }

      var isTop = destacar && (c.spent || 0) === maxSpent;

      row.innerHTML =
        '<div class="hist-main">' +
          '<strong>' + esc(c.name) + '</strong>' +
          '<span>' + detail + '</span>' +
        '</div>' +
        '<b class="hist-spent' + (isTop ? " top" : "") + '">' +
          Shopping.fmt(c.spent) +
          (isTop ? '<em>maior gasto</em>' : "") +
        '</b>';

      var del = document.createElement("button");
      del.className = "hist-del";
      del.textContent = "×";
      del.title = "Apagar esta compra do histórico";
      del.setAttribute("aria-label", "Apagar " + c.name + " do histórico");
      del.onclick = function () { askRemoveOne(c); };
      row.appendChild(del);

      box.appendChild(row);
    });
  }

  // ===== Confirmação =====
  function askRemoveOne(entry) {
    pending = { type: "one", entry: entry };
    $("histConfirmTitle").textContent = "Apagar esta compra?";
    $("histConfirmText").innerHTML =
      "<b>" + esc(entry.name) + "</b> (" + Shopping.fmt(entry.spent) + ") sai do " +
      "histórico, dos painéis de economia e do Comparador.";
    $("histConfirm").classList.remove("hidden");
  }

  function askClearAll() {
    var n = Shopping.loadHistory().length;
    if (!n) return;
    pending = { type: "all" };
    $("histConfirmTitle").textContent = "Limpar todo o histórico?";
    $("histConfirmText").innerHTML =
      "Isso apaga <b>" + (n === 1 ? "1 compra concluída" : n + " compras concluídas") +
      "</b> e tudo que vem delas: os painéis de economia, os cards das compras " +
      "concluídas e os dados do Comparador.";
    $("histConfirm").classList.remove("hidden");
  }

  function closeConfirm() {
    $("histConfirm").classList.add("hidden");
    pending = null;
  }

  function confirmAction() {
    if (!pending) return;

    if (pending.type === "all") {
      var n = Shopping.clearHistory();
      Toast.show(n === 1 ? "Histórico limpo — 1 compra apagada."
                         : "Histórico limpo — " + n + " compras apagadas.", "ok");
    } else {
      Shopping.removeHistoryEntry(pending.entry.date);
      Toast.show("Compra apagada do histórico.", "ok");
    }

    closeConfirm();
    render();
  }

  // ===== Ordenação =====
  function setSort(mode) {
    sort = mode;
    $("sortRecent").classList.toggle("active", mode === "recent");
    $("sortSpent").classList.toggle("active", mode === "spent");
    render();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function wire() {
    $("btnHistBack").onclick = function () { App.openHome(); };
    $("sortRecent").onclick = function () { setSort("recent"); };
    $("sortSpent").onclick = function () { setSort("spent"); };
    $("btnHistClearAll").onclick = askClearAll;
    $("btnHistCancel").onclick = closeConfirm;
    $("btnHistOk").onclick = confirmAction;
    $("histConfirm").onclick = function (e) {
      if (e.target === $("histConfirm")) closeConfirm();
    };
  }

  return { open: open };
})();
