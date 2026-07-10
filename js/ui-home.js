/* ============================================================
   Mercator — Home (fase 3): stats, listas de compras, missões,
   mascote com mensagens curtas e painel de simulação (dev).
   ============================================================ */

window.UIHome = (function () {

  function $(id) { return document.getElementById(id); }

  function render() {
    var progress = Progress.load();
    var avatar = Store.loadAvatar() || Store.defaultAvatar();

    // Missões completas são resgatadas automaticamente ao entrar
    var claims = Missions.claimReady(progress);
    claims.forEach(function (g) {
      Toast.show("Missão cumprida: " + g.def.name + "! +" + g.def.xp + " XP · ◆ " + g.def.gems, "ok");
      g.ups.forEach(function (level) { Toast.show("Você subiu para o nível " + level + "!", "ok"); });
    });
    if (claims.length) {
      Expressions.playOn($("homeAvatarCanvas"), avatar, "rindo", 2400);
    }

    refreshStats(progress);
    Renderer.draw($("homeAvatarCanvas"), avatar);
    $("homeGreeting").textContent = greeting();

    // Painel de simulação: só em desenvolvimento (file:// ou localhost)
    // ou forçando com ?dev=1 — nunca para usuários da versão publicada
    var isDev = location.protocol !== "https:" ||
                location.hostname === "localhost" ||
                location.search.indexOf("dev=1") !== -1;
    document.querySelector(".dev-panel").classList.toggle("hidden", !isDev);

    renderEconomy();
    renderLists();
    renderMissions();
    wire(progress);
  }

  function refreshStats(progress) {
    $("homeLevel").textContent = progress.level;
    $("homeGems").textContent = progress.gems;
    var need = Progress.xpForNext(progress.level);
    $("xpFill").style.width = Math.min(100, progress.xp / need * 100) + "%";
    $("xpLabel").textContent = progress.xp + " / " + need + " XP";
  }

  // Mensagens curtas e positivas (spec: nunca invasivas)
  function greeting() {
    var open = Shopping.loadLists().filter(function (l) { return l.status === "aberta"; });
    for (var i = 0; i < open.length; i++) {
      var t = Shopping.totals(open[i]);
      var left = t.count - t.checked;
      if (t.count > 0 && left > 0) {
        return left === 1 ? "Falta 1 item na lista!" : "Faltam " + left + " itens na lista!";
      }
    }
    var h = Shopping.loadHistory();
    if (h.length && h[0].savings > 0) return "Você economizou " + Shopping.fmt(h[0].savings) + " na última compra!";
    if (!open.length) return "Que tal criar uma lista?";
    return "Olá!";
  }

  function renderLists() {
    var box = $("listsBox");
    box.innerHTML = "";
    var lists = Shopping.loadLists();
    var planning = lists.filter(function (l) { return l.status === "aberta"; });
    var market = lists.filter(function (l) { return l.status === "mercado"; });
    var done = lists.filter(function (l) { return l.status === "concluida"; }).slice(0, 5);

    if (!lists.length) {
      var empty = document.createElement("div");
      empty.className = "empty-hint";
      empty.textContent = "Nenhuma lista ainda — crie a primeira!";
      box.appendChild(empty);
    }

    // Ordem: no mercado (ação imediata) → planejando → concluídas (consulta)
    market.forEach(function (list) { box.appendChild(card(list, "no mercado")); });
    planning.forEach(function (list) { box.appendChild(card(list, "planejando")); });
    done.forEach(function (list) { box.appendChild(card(list, "concluída")); });

    function card(list, statusLabel) {
      var t = Shopping.totals(list);
      var el = document.createElement("button");
      el.className = "list-card" + (list.status === "concluida" ? " done" : "");

      var detail;
      if (list.status === "aberta") {
        detail = t.count + (t.count === 1 ? " item" : " itens") +
                 (t.listTotal ? " · previsto " + Shopping.fmt(t.listTotal) : "");
      } else if (list.status === "mercado") {
        detail = t.checked + "/" + t.count + " itens no carrinho" +
                 (t.listTotal ? " · " + Shopping.fmt(t.listTotal) : "");
      } else {
        detail = "gasto " + Shopping.fmt(t.spent) +
                 (t.savings > 0 ? ' · <em class="save">economizou ' + Shopping.fmt(t.savings) + "</em>" : "");
      }

      el.innerHTML =
        '<div class="list-card-main">' +
          '<strong>' + esc(list.name) +
            ' <span class="status-badge ' + list.status + '">' + statusLabel + '</span></strong>' +
          '<span>' + detail + '</span>' +
        '</div><span class="go">›</span>';
      el.onclick = function () { App.openList(list.id); };

      var del = document.createElement("button");
      del.className = "list-del";
      del.textContent = "×";
      del.title = "Excluir lista";
      del.onclick = function (e) {
        e.stopPropagation();
        if (list.status === "concluida" && !confirm("Excluir esta compra do histórico de consulta? (os totais já registrados permanecem)")) return;
        Shopping.removeList(list.id);
        renderLists();
      };
      el.appendChild(del);
      return el;
    }
  }

  // Economia é o foco do app — seção em destaque.
  // syncHistory() garante que toda compra concluída conte aqui.
  function renderEconomy() {
    var h = Shopping.syncHistory();
    var total = h.reduce(function (s, c) { return s + (c.savings || 0); }, 0);
    var spent = h.reduce(function (s, c) { return s + (c.spent || 0); }, 0);
    $("ecoTotal").textContent = Shopping.fmt(total);
    // Última compra = o que foi GASTO nela (economia dela aparece no card)
    $("ecoLast").textContent = h.length ? Shopping.fmt(h[0].spent || 0) : "—";
    $("ecoSpent").textContent = h.length ? Shopping.fmt(spent) : "—";

    // Aviso de aumento do mercado (comparador das 2 últimas compras):
    // quanto você perdeu para preços que subiram
    var delta = Shopping.marketDelta();
    var el = $("ecoDelta");
    el.className = "eco-delta";
    if (!delta || (delta.lost === 0 && delta.dropped === 0)) {
      el.textContent = "";
    } else if (delta.lost > delta.dropped) {
      el.textContent = "▲ perdeu " + Shopping.fmt(delta.lost) + " p/ aumentos";
      el.classList.add("up");
    } else {
      el.textContent = "▼ preços caíram " + Shopping.fmt(delta.dropped);
      el.classList.add("down");
    }
  }

  // Missões compactas: uma linha cada (o foco do app é a economia)
  function renderMissions() {
    var box = $("missionsBox");
    box.innerHTML = "";
    Missions.status().forEach(function (m) {
      var row = document.createElement("div");
      row.className = "mission-sm" + (m.claimed ? " claimed" : "");
      row.title = m.def.desc + " — recompensa: +" + m.def.xp + " XP · ◆ " + m.def.gems;
      var pct = Math.min(100, m.value / m.def.target * 100);
      row.innerHTML =
        '<span class="mname">' + (m.claimed ? "✓ " : "") + esc(m.def.name) + '</span>' +
        '<span class="mbar"><span class="mfill" style="width:' + pct + '%"></span></span>' +
        '<span class="mreward">◆ ' + m.def.gems + '</span>';
      box.appendChild(row);
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function wire(progress) {
    $("btnEditAvatar").onclick = function () {
      App.openCreator(Store.loadAvatar() || Store.defaultAvatar());
    };
    $("btnCompare").onclick = function () { App.openCompare(); };
    $("btnDonate").onclick = function () { App.openDonate(function () { App.openHome(); }); };

    $("btnNewList").onclick = function () {
      $("newListRow").classList.toggle("hidden");
      fillCopyOptions();
      $("newListName").focus();
    };
    $("btnCreateList").onclick = createFromInput;
    $("newListName").onkeydown = function (e) { if (e.key === "Enter") createFromInput(); };

    // Opções do "Copiar itens de..." — todas as listas, recentes primeiro
    function fillCopyOptions() {
      var sel = $("newListCopy");
      sel.innerHTML = '<option value="">Começar em branco</option>';
      Shopping.loadLists().forEach(function (l) {
        var opt = document.createElement("option");
        opt.value = l.id;
        var t = Shopping.totals(l);
        opt.textContent = "Copiar de: " + l.name + " (" + t.count + " itens)";
        sel.appendChild(opt);
      });
    }

    function createFromInput() {
      var name = $("newListName").value.trim() || "Compras";
      var sourceId = $("newListCopy").value;
      var list = sourceId ? Shopping.createFrom(name, sourceId)
                          : Shopping.createList(name);
      $("newListName").value = "";
      $("newListCopy").value = "";
      $("newListRow").classList.add("hidden");
      if (sourceId) Toast.show("Itens copiados! Previsto = preço da compra anterior.", "ok");
      App.openList(list.id);
    }

    // ===== Painel de simulação (dev) =====
    $("btnSimXp").onclick = function () {
      var ups = Progress.addXp(progress, 40);
      refreshStats(progress);
      ups.forEach(function (level) {
        Toast.show("Você subiu para o nível " + level + "!", "ok");
        Progress.itemsUnlockedAtLevel(level).forEach(function (part) {
          Toast.show("Novo item desbloqueado: " + part.name + "!", "ok");
        });
      });
      if (ups.length) {
        Particles.burst($("homeAvatarCanvas"), null);
        Expressions.playOn($("homeAvatarCanvas"), Store.loadAvatar() || Store.defaultAvatar(), "feliz", 2200);
      }
    };
    $("btnSimGems").onclick = function () {
      Progress.addGems(progress, 25);
      refreshStats(progress);
      Toast.show("+25 gemas!", "ok");
    };
    $("btnSimReset").onclick = function () {
      localStorage.removeItem("mercator.progress");
      localStorage.removeItem("mercator.missions");
      progress = Progress.load();
      refreshStats(progress);
      Toast.show("Progresso zerado", "warn");
    };
  }

  return { render: render };
})();
