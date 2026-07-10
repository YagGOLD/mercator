/* ============================================================
   Mercator — Tela da lista (fase 3)
   Três modos, seguindo o fluxo real de quem faz compras:
   - "aberta"    → PLANEJANDO em casa: produtos e quantidades
                   (preço opcional). Botão: Salvar p/ o mercado.
   - "mercado"   → NO MERCADO: marca itens, digita preços pagos,
                   totais ao vivo. Botão: Concluir compra.
   - "concluida" → CONSULTA: somente leitura, para conferência
                   e comparação com compras futuras.
   ============================================================ */

window.UIList = (function () {

  var list = null;
  var mode = "aberta";

  function $(id) { return document.getElementById(id); }

  function open(listId) {
    list = Shopping.getList(listId);
    if (!list) { App.openHome(); return; }
    mode = list.status;

    $("listTitle").textContent = list.name;
    $("listStatus").textContent =
      mode === "aberta" ? "planejando" : mode === "mercado" ? "no mercado" : "concluída";
    Renderer.draw($("listMascot"), Store.loadAvatar() || Store.defaultAvatar());
    $("summaryOverlay").classList.add("hidden");
    $("addRow").classList.toggle("hidden", mode === "concluida");
    $("btnConclude").classList.toggle("hidden", mode === "concluida");
    $("btnConclude").textContent =
      mode === "aberta" ? "Salvar lista para o mercado" : "Concluir compra";

    renderItems();
    wire();

    if (mode === "mercado") say("Boa compra! Vá marcando o que pegar.");
  }

  function say(text) {
    var b = $("listBubble");
    b.textContent = text;
    b.classList.remove("hidden");
    clearTimeout(say._t);
    say._t = setTimeout(function () { b.classList.add("hidden"); }, 2600);
  }

  function renderItems() {
    var box = $("listItems");
    box.innerHTML = "";

    if (!list.items.length) {
      var empty = document.createElement("div");
      empty.className = "empty-hint";
      empty.textContent = "Adicione os produtos e as quantidades abaixo — os preços podem ficar para o mercado.";
      box.appendChild(empty);
    }

    var readOnly = mode === "concluida";

    list.items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "shop-item" + (item.checked ? " checked" : "");

      var check = document.createElement("button");
      check.className = "check";
      check.innerHTML = item.checked ? "✓" : "";
      check.disabled = readOnly || mode === "aberta";
      if (mode === "aberta") check.classList.add("ghost");
      check.onclick = function () {
        if (readOnly || mode === "aberta") return;
        item.checked = !item.checked;
        Shopping.updateList(list);
        renderItems();
        var t = Shopping.totals(list);
        var left = t.count - t.checked;
        var avatar = Store.loadAvatar() || Store.defaultAvatar();
        if (item.checked && left === 0) {
          say("Tudo pego! Hora de concluir.");
          Expressions.playOn($("listMascot"), avatar, "feliz", 2200);
        } else if (item.checked) {
          if (left === 3) say("Faltam apenas 3 itens da lista!");
          Expressions.playOn($("listMascot"), avatar, "sorrindo", 1500);
        }
      };

      var qtyIn = document.createElement("input");
      qtyIn.type = "number";
      qtyIn.min = "1";
      qtyIn.className = "qty-in";
      qtyIn.value = item.qty;
      qtyIn.title = "Quantidade";
      qtyIn.disabled = readOnly;
      qtyIn.oninput = function () {
        var v = parseInt(qtyIn.value, 10);
        item.qty = isNaN(v) || v < 1 ? 1 : v;
        Shopping.updateList(list);
        updateSum();
        refreshTotals();
      };

      var info = document.createElement("div");
      info.className = "info";
      info.innerHTML = "<strong>" + esc(item.name) + "</strong>" +
        '<span class="line-detail">' + lineDetail(item) + "</span>";

      // Total da linha (preço × qtd) — fica no FIM da linha e
      // recalcula ao vivo a cada edição de valor ou quantidade
      var sum = document.createElement("b");
      sum.className = "line-sum";
      function updateSum() {
        var price = item.paid !== null ? item.paid : item.est;
        if (price) {
          sum.textContent = Shopping.fmt(price * item.qty);
          sum.classList.toggle("saving",
            mode !== "aberta" && !!item.est && item.paid !== null && item.paid < item.est);
          sum.classList.remove("empty");
        } else {
          sum.textContent = "—";
          sum.className = "line-sum empty";
        }
      }
      updateSum();

      row.appendChild(check);
      row.appendChild(qtyIn);
      row.appendChild(info);

      // Campo de preço: no planejamento é opcional ("R$ prev."),
      // no mercado é o preço pago
      {
        var paid = document.createElement("input");
        paid.type = "number";
        paid.step = "0.01";
        paid.min = "0";
        paid.className = "paid";
        paid.placeholder = mode === "aberta" ? "R$ prev." : "pago R$";
        paid.disabled = readOnly;
        if (mode === "aberta") {
          if (item.est !== null) paid.value = item.est;
          paid.oninput = function () {
            var v = parseFloat(paid.value);
            item.est = isNaN(v) ? null : v;
            item.paid = item.est;          // pago nasce igual ao previsto
            Shopping.updateList(list);
            updateSum();
            refreshTotals();
          };
        } else {
          if (item.paid !== null) paid.value = item.paid;
          paid.oninput = function () {
            var v = parseFloat(paid.value);
            item.paid = isNaN(v) ? null : v;
            // Digitou o preço = pegou o item: marca sozinho
            if (!item.checked && item.paid !== null) {
              item.checked = true;
              row.classList.add("checked");
              check.innerHTML = "✓";
            }
            Shopping.updateList(list);
            updateSum();
            refreshTotals();
          };
        }
        row.appendChild(paid);
        row.appendChild(sum);
      }

      if (!readOnly) {
        var del = document.createElement("button");
        del.className = "list-del";
        del.textContent = "×";
        del.onclick = function () {
          Shopping.removeItem(list, item.id);
          renderItems();
        };
        row.appendChild(del);
      }

      box.appendChild(row);
    });

    refreshTotals();
  }

  // Linha de detalhe sob o nome: só o previsto de referência
  // (o total dinâmico agora é o elemento .line-sum no fim da linha)
  function lineDetail(item) {
    if (item.est && mode !== "aberta") return "prev. " + Shopping.fmt(item.est);
    if (!item.est && mode === "aberta") return "preço fica p/ o mercado";
    return "";
  }

  function refreshTotals() {
    var t = Shopping.totals(list);
    $("totEst").textContent = Shopping.fmt(t.listTotal);
    $("totSpent").textContent = Shopping.fmt(t.spent);
    $("totSave").textContent = Shopping.fmt(t.savings);
    $("totSave").parentElement.classList.toggle("has-save", t.savings > 0);
    // Carrinho/Economia só fazem sentido no mercado ou na consulta
    $("totCartWrap").classList.toggle("hidden", mode === "aberta");
    $("totSaveWrap").classList.toggle("hidden", mode === "aberta");

    // O botão nunca desabilita silenciosamente — primaryAction explica
    // o que falta via toast (botão "morto" parece bug para o usuário)
    $("btnConclude").disabled = false;
  }

  function addFromInputs() {
    var name = $("addName").value.trim();
    if (!name) { $("addName").focus(); return; }
    var qty = parseInt($("addQty").value, 10) || 1;
    var est = parseFloat($("addPrice").value);
    Shopping.addItem(list, name, qty, isNaN(est) ? null : est);
    $("addName").value = ""; $("addQty").value = "1"; $("addPrice").value = "";
    $("addName").focus();
    renderItems();
  }

  // Botão principal: depende do modo. Sempre clicável — se faltar
  // algo, explica com toast em vez de ficar mudo.
  function primaryAction() {
    var t = Shopping.totals(list);
    if (t.count === 0) {
      Toast.show("Adicione itens à lista primeiro.", "warn");
      return;
    }
    if (mode === "aberta") {
      Shopping.toMarket(list);
      Toast.show("Lista salva! Abra no mercado para registrar os preços.", "ok");
      App.openHome();
      return;
    }
    if (t.checked === 0) {
      Toast.show("Marque os itens que você pegou (ou digite o preço) antes de concluir.", "warn");
      say("Marque o que já está no carrinho!");
      return;
    }
    concludePurchase();
  }

  function concludePurchase() {
    // Recorde anterior ANTES de gravar esta compra no histórico
    var prevRecord = Shopping.loadHistory().reduce(function (max, c) {
      return Math.max(max, c.savings || 0);
    }, 0);

    var t = Shopping.conclude(list);
    var progress = Progress.load();

    // Recompensas: base + bônus por economia
    var xp = 30 + Math.floor(t.savings) * 2;
    var gems = 10 + Math.floor(t.savings / 5);
    Progress.addGems(progress, gems);
    var ups = Progress.addXp(progress, xp);

    // Frase + expressão do mascote (spec: curta, positiva, útil)
    var phrase, expr;
    if (t.savings > 0 && t.savings > prevRecord) {
      phrase = "Parabéns! Novo recorde de economia: " + Shopping.fmt(t.savings) + "!";
      expr = "rindo";
    } else if (t.savings > 0) {
      phrase = "Você economizou " + Shopping.fmt(t.savings) + " hoje!";
      expr = "feliz";
    } else {
      phrase = "Compra concluída!";
      expr = "sorrindo";
    }

    var avatar = Store.loadAvatar() || Store.defaultAvatar();
    Expressions.playOn($("sumMascot"), avatar, expr);   // sem timer: fica no resumo
    $("sumBubble").textContent = phrase;
    $("sumItems").textContent = t.checked + " de " + t.count + " itens";
    $("sumSpent").textContent = Shopping.fmt(t.spent);
    $("sumReward").textContent = "+" + xp + " XP · ◆ " + gems;
    $("summaryOverlay").classList.remove("hidden");
    Particles.burst($("summaryBox"), null);

    ups.forEach(function (level) {
      Toast.show("Você subiu para o nível " + level + "!", "ok");
      Progress.itemsUnlockedAtLevel(level).forEach(function (part) {
        Toast.show("Novo item desbloqueado: " + part.name + "!", "ok");
      });
    });
    Missions.claimReady(progress).forEach(function (g) {
      Toast.show("Missão cumprida: " + g.def.name + "! +" + g.def.xp + " XP · ◆ " + g.def.gems, "ok");
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function wire() {
    $("btnBack").onclick = function () { App.openHome(); };
    $("btnAddItem").onclick = addFromInputs;
    $("addName").onkeydown = function (e) { if (e.key === "Enter") addFromInputs(); };
    $("addPrice").onkeydown = function (e) { if (e.key === "Enter") addFromInputs(); };
    $("btnConclude").onclick = primaryAction;
    $("btnSummaryClose").onclick = function () { App.openHome(); };
  }

  return { open: open };
})();
