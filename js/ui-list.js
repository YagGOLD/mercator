/* ============================================================
   Mercator — Tela da lista (fase 3)
   Três modos, seguindo o fluxo real de quem faz compras:
   - "aberta"    → PLANEJANDO em casa: SÓ produto + quantidade
                   (stepper −/+). Sem preços, sem totais.
   - "mercado"   → NO MERCADO: marca itens, digita preço pago,
                   totais ao vivo. Botão: Concluir compra.
   - "concluida" → CONSULTA: somente leitura.
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
      empty.textContent = mode === "aberta"
        ? "Adicione os produtos da sua compra abaixo — os preços ficam para o mercado."
        : "Lista vazia — adicione produtos abaixo.";
      box.appendChild(empty);
    }

    var readOnly = mode === "concluida";
    list.items.forEach(function (item) { box.appendChild(buildRow(item, readOnly)); });
    refreshTotals();
  }

  function buildRow(item, readOnly) {
    var row = document.createElement("div");
    row.className = "shop-item" + (item.checked ? " checked" : "");

    var sum = null;       // total da linha (só mercado/consulta)
    var qtyVal = null;    // display da quantidade

    // ===== Check (só mercado/consulta) =====
    var check = null;
    if (mode !== "aberta") {
      check = document.createElement("button");
      check.className = "check";
      check.innerHTML = item.checked ? "✓" : "";
      check.disabled = readOnly;
      check.onclick = function () {
        if (readOnly) return;
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
      row.appendChild(check);
    }

    // ===== Quantidade: stepper − / valor / + (nunca abaixo de 1) =====
    var stepper = document.createElement("div");
    stepper.className = "stepper";
    if (readOnly) {
      var qtyStatic = document.createElement("span");
      qtyStatic.className = "step-val";
      qtyStatic.textContent = item.qty + "x";
      stepper.appendChild(qtyStatic);
    } else {
      var minus = document.createElement("button");
      minus.className = "step-btn";
      minus.textContent = "−";
      minus.setAttribute("aria-label", "Diminuir quantidade");

      qtyVal = document.createElement("button");
      qtyVal.className = "step-val";
      qtyVal.title = "Toque para aumentar";
      qtyVal.textContent = item.qty;

      var plus = document.createElement("button");
      plus.className = "step-btn";
      plus.textContent = "+";
      plus.setAttribute("aria-label", "Aumentar quantidade");

      function setQty(q) {
        item.qty = Math.max(1, q);
        qtyVal.textContent = item.qty;
        Shopping.updateList(list);
        if (sum) updateSum();
        refreshTotals();
      }
      minus.onclick = function () { setQty(item.qty - 1); };
      plus.onclick = function () { setQty(item.qty + 1); };
      qtyVal.onclick = function () { setQty(item.qty + 1); };  // tocar no número também soma

      stepper.appendChild(minus);
      stepper.appendChild(qtyVal);
      stepper.appendChild(plus);
    }
    row.appendChild(stepper);

    // ===== Nome =====
    var info = document.createElement("div");
    info.className = "info";
    info.innerHTML = "<strong>" + esc(item.name) + "</strong>";
    row.appendChild(info);

    // ===== Linha de dinheiro (2º andar): previsto · pago · total =====
    // Só no mercado/consulta — no celular o nome fica inteiro em cima
    if (mode !== "aberta") {
      var money = document.createElement("div");
      money.className = "money-row";

      var prev = document.createElement("span");
      prev.className = "line-detail";
      prev.textContent = item.est ? "prev. " + Shopping.fmt(item.est) : "";

      var paid = document.createElement("input");
      paid.type = "number";
      paid.step = "0.01";
      paid.min = "0";
      paid.placeholder = "pago R$";
      paid.className = "paid";
      paid.disabled = readOnly;
      if (item.paid !== null) paid.value = item.paid;

      sum = document.createElement("b");
      sum.className = "line-sum";

      paid.oninput = function () {
        var v = parseFloat(paid.value);
        item.paid = isNaN(v) ? null : v;
        // Digitou o preço = pegou o item: marca sozinho
        if (!item.checked && item.paid !== null) {
          item.checked = true;
          row.classList.add("checked");
          if (check) check.innerHTML = "✓";
        }
        Shopping.updateList(list);
        updateSum();
        refreshTotals();
      };

      money.appendChild(prev);
      money.appendChild(paid);
      money.appendChild(sum);
      row.appendChild(money);
      updateSum();
    }

    function updateSum() {
      if (!sum) return;
      var price = item.paid !== null ? item.paid : item.est;
      if (price) {
        sum.textContent = Shopping.fmt(price * item.qty);
        sum.className = "line-sum" +
          (item.est && item.paid !== null && item.paid < item.est ? " saving" : "");
      } else {
        sum.textContent = "—";
        sum.className = "line-sum empty";
      }
    }

    // ===== Excluir =====
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

    return row;
  }

  function refreshTotals() {
    var t = Shopping.totals(list);
    // No planejamento não há simulação de valor: rodapé some.
    // No mercado: só o Valor Total (carrinho), em destaque e ao vivo.
    $("totLine").classList.toggle("hidden", mode === "aberta");
    if (mode !== "aberta") {
      $("totValue").textContent = Shopping.fmt(t.spent);
    }
    $("btnConclude").disabled = false;
  }

  function addFromInputs() {
    var name = $("addName").value.trim();
    if (!name) { $("addName").focus(); return; }
    Shopping.addItem(list, name, 1, null);   // qtd começa em 1; preço fica p/ o mercado
    $("addName").value = "";
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
    $("btnConclude").onclick = primaryAction;
    $("btnSummaryClose").onclick = function () { App.openHome(); };
  }

  return { open: open };
})();
