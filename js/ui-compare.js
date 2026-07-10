/* ============================================================
   Mercator — Comparador de compras (fase 3)
   Seleciona duas compras concluídas e compara os preços item a
   item (casando pelo nome): "Leite estava R$ 8,00 em 10/07 e
   R$ 8,50 em 11/07 — subiu R$ 0,50". Transparência de preços.
   ============================================================ */

window.UICompare = (function () {

  function $(id) { return document.getElementById(id); }

  function concluded() {
    return Shopping.loadLists()
      .filter(function (l) { return l.status === "concluida"; })
      .sort(function (a, b) {   // mais recente primeiro
        return new Date(b.concludedAt || 0) - new Date(a.concludedAt || 0);
      });
  }

  function label(list) {
    var d = list.concludedAt ? new Date(list.concludedAt) : null;
    var when = d ? " (" + String(d.getDate()).padStart(2, "0") + "/" +
                   String(d.getMonth() + 1).padStart(2, "0") + ")" : "";
    return list.name + when;
  }

  function open() {
    var lists = concluded();
    var box = $("compResults");

    if (lists.length < 2) {
      $("compA").innerHTML = "";
      $("compB").innerHTML = "";
      box.innerHTML = '<div class="empty-hint">Conclua pelo menos duas compras para comparar os preços entre elas.</div>';
      wire();
      return;
    }

    // A = penúltima, B = última (comparação mais natural: antes → agora)
    fillSelect($("compA"), lists, lists[1].id);
    fillSelect($("compB"), lists, lists[0].id);
    render();
    wire();
  }

  function fillSelect(sel, lists, selectedId) {
    sel.innerHTML = "";
    lists.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l.id;
      opt.textContent = label(l);
      if (l.id === selectedId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function render() {
    var a = Shopping.getList($("compA").value);
    var b = Shopping.getList($("compB").value);
    var box = $("compResults");
    box.innerHTML = "";
    if (!a || !b) return;
    if (a.id === b.id) {
      box.innerHTML = '<div class="empty-hint">Escolha duas compras diferentes.</div>';
      return;
    }

    var cmp = Shopping.compare(a, b);

    // Cabeçalho
    var head = document.createElement("div");
    head.className = "comp-row head";
    head.innerHTML = "<span>Item</span><span>A</span><span>B</span><span>Diferença</span>";
    box.appendChild(head);

    cmp.rows.forEach(function (r) {
      var row = document.createElement("div");
      row.className = "comp-row";
      var diffHtml = "—";
      if (r.diff !== null) {
        if (r.diff > 0) diffHtml = '<b class="up">▲ +' + Shopping.fmt(r.diff) + "</b>";
        else if (r.diff < 0) diffHtml = '<b class="down">▼ −' + Shopping.fmt(-r.diff) + "</b>";
        else diffHtml = '<span class="same">=</span>';
      }
      row.innerHTML =
        "<span class='iname'>" + esc(r.name) + "</span>" +
        "<span>" + (r.pa !== null ? Shopping.fmt(r.pa) : "—") + "</span>" +
        "<span>" + (r.pb !== null ? Shopping.fmt(r.pb) : "—") + "</span>" +
        "<span>" + diffHtml + "</span>";
      box.appendChild(row);
    });

    // Totais
    var tot = document.createElement("div");
    tot.className = "comp-row total";
    var d = Math.round((cmp.totalB - cmp.totalA) * 100) / 100;
    var dHtml = d > 0 ? '<b class="up">▲ +' + Shopping.fmt(d) + "</b>"
              : d < 0 ? '<b class="down">▼ −' + Shopping.fmt(-d) + "</b>"
              : '<span class="same">=</span>';
    tot.innerHTML =
      "<span class='iname'>Total gasto</span>" +
      "<span>" + Shopping.fmt(cmp.totalA) + "</span>" +
      "<span>" + Shopping.fmt(cmp.totalB) + "</span>" +
      "<span>" + dHtml + "</span>";
    box.appendChild(tot);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function wire() {
    $("btnCompBack").onclick = function () { App.openHome(); };
    $("compA").onchange = render;
    $("compB").onchange = render;
  }

  return { open: open };
})();
