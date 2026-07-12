/* ============================================================
   Mercator — Home (fase 3): stats, listas de compras, missões,
   mascote com mensagens curtas e painel de simulação (dev).
   ============================================================ */

window.UIHome = (function () {

  function $(id) { return document.getElementById(id); }

  // Carrinho — usado no card da lista e nas linhas do "Copiar lista salva"
  var CART_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
      '<path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.9a2 2 0 0 0 2-1.6L21 8H6" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="10" cy="21" r="1.4" fill="currentColor"/>' +
      '<circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>';

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
    // Mascote VIVO na Home: pisca, mexe a sobrancelha e sorri sozinho
    Animator.attach($("homeAvatarCanvas"), function () { return avatar; });
    $("homeGreeting").innerHTML = greeting();
    startPhraseRotation();

    // Painel de simulação: só em desenvolvimento (file:// ou localhost)
    // ou forçando com ?dev=1 — nunca para usuários da versão publicada
    var isDev = location.protocol !== "https:" ||
                location.hostname === "localhost" ||
                location.search.indexOf("dev=1") !== -1;
    document.querySelector(".dev-panel").classList.toggle("hidden", !isDev);

    // A Home sempre entra limpa (nenhum diálogo aberto, aviso recolhido)
    $("copyOverlay").classList.add("hidden");
    $("importOverlay").classList.add("hidden");
    $("dataHint").classList.add("hidden");
    $("btnDataInfo").setAttribute("aria-expanded", "false");

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

  // Frases divertidas do mascote (sorteadas quando não há nada
  // contextual para dizer) — sugeridas pelo usuário
  var FUN_PHRASES = [
    "Não esquece o café! ☕",
    "Bora fechar essa lista?",
    "Tá quase lá! 🚀",
    "Sua geladeira agradece.",
    "Hoje tem economia!",
    "Partiu mercado?",
    "Lista pronta = sucesso.",
    "Missão quase completa!",
    "Você compra. Eu lembro."
  ];

  // A frase do mascote troca sozinha a cada 10s enquanto a Home
  // estiver visível (fade suave; para quando sai da tela)
  var phraseTimer = null;
  function startPhraseRotation() {
    clearInterval(phraseTimer);
    phraseTimer = setInterval(function () {
      if (document.getElementById("screenHome").classList.contains("hidden")) return;
      var el = $("homeGreeting");
      el.style.opacity = "0";
      setTimeout(function () {
        el.innerHTML = greeting();
        el.style.opacity = "1";
      }, 250);
    }, 10000);
  }

  // Mensagens curtas e positivas (spec: nunca invasivas).
  // Contextual primeiro; sem contexto, sorteia uma frase divertida.
  // Retorna HTML controlado — números/valores em destaque teal.
  function greeting() {
    var lists = Shopping.loadLists().filter(function (l) {
      return l.status === "aberta" || l.status === "mercado";
    });
    for (var i = 0; i < lists.length; i++) {
      var t = Shopping.totals(lists[i]);
      var left = t.count - t.checked;
      if (t.count > 0 && left > 0 && lists[i].status === "mercado") {
        return left === 1 ? "Falta <b>1 item</b> na lista!"
                          : "Faltam <b>" + left + " itens</b> na lista!";
      }
    }
    var h = Shopping.loadHistory();
    if (h.length && h[0].savings > 0 && Math.random() < .5) {
      return "Você economizou <b>" + Shopping.fmt(h[0].savings) + "</b> na última compra!";
    }
    if (!lists.length && !h.length) return "Que tal criar uma lista?";
    return FUN_PHRASES[Math.floor(Math.random() * FUN_PHRASES.length)];
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

      var when = "";
      var d = new Date(list.concludedAt || list.createdAt);
      if (!isNaN(d)) {
        when = " · " + (list.status === "concluida" ? "" : "criada ") +
               String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
      }

      var detail;
      if (list.status === "aberta") {
        detail = t.count + (t.count === 1 ? " item" : " itens") + when;
      } else if (list.status === "mercado") {
        detail = t.checked + "/" + t.count + " no carrinho" +
                 (t.listTotal ? " · " + Shopping.fmt(t.listTotal) : "");
      } else {
        detail = "gasto " + Shopping.fmt(t.spent) +
                 (t.savings > 0 ? ' · <em class="save">economizou ' + Shopping.fmt(t.savings) + "</em>" : when);
      }

      el.innerHTML =
        '<span class="cart-ico">' + CART_SVG + '</span>' +
        '<div class="list-card-main">' +
          '<strong>' + esc(list.name) +
            ' <span class="status-badge ' + list.status + '">' + statusLabel + '</span></strong>' +
          '<span>' + detail + '</span>' +
        '</div><span class="go">›</span>';
      el.onclick = function () { App.openList(list.id); };

      // Renomear a compra sem abri-la (só o nome muda)
      var edit = document.createElement("button");
      edit.className = "list-edit";
      edit.title = "Renomear compra";
      edit.setAttribute("aria-label", "Renomear compra");
      edit.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none">' +
        '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      edit.onclick = function (e) {
        e.stopPropagation();
        var name = prompt("Novo nome da compra:", list.name);
        if (name === null) return;                    // cancelou
        if (!Shopping.renameList(list.id, name)) {
          Toast.show("O nome não pode ficar vazio.", "warn");
          return;
        }
        renderLists();          // card atualiza na hora
        Toast.show("Compra renomeada.", "ok");
      };
      el.appendChild(edit);

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

  // Missões no estilo "hábitos": ícone colorido + barra + progresso
  var MISSION_ICONS = {
    m_primeira: { tint: "blue", svg: '<path d="M6 7h12l-1.2 12.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7zM9 7a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>' },
    m_frequente: { tint: "violet", svg: '<path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>' },
    m_economizador: { tint: "amber", svg: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.7-5.2 2.7 1-5.9L3.5 9.2l5.9-.9L12 3z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/>' },
    m_lista_cheia: { tint: "red", svg: '<path d="M12 20.5s-7.5-4.6-9.3-9A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 9.3 4.9c-1.8 4.4-9.3 9-9.3 9z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>' }
  };

  function renderMissions() {
    var box = $("missionsBox");
    box.innerHTML = "";
    Missions.status().forEach(function (m) {
      var row = document.createElement("div");
      row.className = "mission-sm" + (m.claimed ? " claimed" : "");
      row.title = m.def.desc + " — recompensa: +" + m.def.xp + " XP · ◆ " + m.def.gems;
      var pct = Math.min(100, m.value / m.def.target * 100);
      var ico = MISSION_ICONS[m.def.id] || MISSION_ICONS.m_primeira;
      var progressLabel = m.claimed ? "✓" :
        (m.def.target > 1 || m.def.id === "m_economizador"
          ? Math.floor(m.value) + "/" + m.def.target
          : (m.done ? "1/1" : "0/1"));
      row.innerHTML =
        '<span class="eco-ico ' + ico.tint + '"><svg width="17" height="17" viewBox="0 0 24 24" fill="none">' + ico.svg + '</svg></span>' +
        '<span class="mission-body">' +
          '<span class="mname">' + esc(m.def.name) + '</span>' +
          '<span class="mbar"><span class="mfill" style="width:' + pct + '%"></span></span>' +
        '</span>' +
        '<span class="mprog">' + progressLabel + '<em>◆ ' + m.def.gems + '</em></span>';
      box.appendChild(row);
    });
  }

  // ===== Copiar lista salva =====
  // O botão abre a escolha da compra de origem (antes era um <select>
  // de largura cheia na Home). Copiar mantém o comportamento de sempre:
  // os itens vêm junto e o previsto de cada um vira o PAGO da compra
  // escolhida (Shopping.createFrom).
  function openCopyPicker() {
    var lists = Shopping.loadLists();
    if (!lists.length) {
      Toast.show("Você ainda não tem nenhuma lista salva para copiar.", "warn");
      return;
    }

    var box = $("copyList");
    box.innerHTML = "";
    lists.forEach(function (l) {
      var t = Shopping.totals(l);
      var d = new Date(l.concludedAt || l.createdAt);
      var when = isNaN(d) ? "" :
        " · " + String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");

      var row = document.createElement("button");
      row.className = "copy-row";
      row.innerHTML =
        '<span class="cart-ico">' + CART_SVG + '</span>' +
        '<span class="copy-row-main">' +
          '<strong>' + esc(l.name) + '</strong>' +
          '<span>' + t.count + (t.count === 1 ? " item" : " itens") + when + '</span>' +
        '</span><span class="go">›</span>';
      row.onclick = function () { copyFrom(l); };
      box.appendChild(row);
    });

    $("copyOverlay").classList.remove("hidden");
  }

  function closeCopyPicker() { $("copyOverlay").classList.add("hidden"); }

  // Sem nome digitado, a cópia nasce como "Cópia de <origem>"
  function copyFrom(source) {
    var typed = $("newListName").value.trim();
    var name = (typed || "Cópia de " + source.name).slice(0, 40);
    var list = Shopping.createFrom(name, source.id);
    $("newListName").value = "";
    closeCopyPicker();
    Toast.show("Itens copiados! Previsto = preço da compra anterior.", "ok");
    App.openList(list.id);
  }

  // ===== Exportar / Importar (backup) =====
  var pendingImport = null;   // backup lido, aguardando o "Sim, importar"

  function doExport() {
    Backup.exportData().then(function (via) {
      if (via === "cancel") return;
      Toast.show(via === "share"
        ? "Backup pronto — escolha onde salvar ou enviar."
        : "Backup salvo na pasta de downloads.", "ok");
    });
  }

  function onFileChosen(e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = "";                 // permite reescolher o MESMO arquivo depois
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function () {
      var r = Backup.parse(String(reader.result));
      if (!r.ok) { Toast.show(r.erro, "warn"); return; }

      pendingImport = r.payload;
      var s = r.resumo;
      var quando = new Date(s.data);
      $("importSummary").innerHTML =
        '<div class="imp-line"><span>Feito em</span><b>' +
          (isNaN(quando) ? "—" : quando.toLocaleDateString("pt-BR")) + '</b></div>' +
        '<div class="imp-line"><span>Listas</span><b>' + s.listas + '</b></div>' +
        '<div class="imp-line"><span>Compras no histórico</span><b>' + s.compras + '</b></div>' +
        '<div class="imp-line"><span>Progresso</span><b>Nível ' + s.nivel +
          ' · ◆ ' + s.gemas + '</b></div>';
      $("importOverlay").classList.remove("hidden");
    };
    reader.onerror = function () { Toast.show("Não consegui ler o arquivo.", "warn"); };
    reader.readAsText(file);
  }

  function closeImport() {
    $("importOverlay").classList.add("hidden");
    pendingImport = null;
  }

  function doImport() {
    if (!pendingImport) return;
    Backup.restore(pendingImport);
    pendingImport = null;
    // Recarrega: o boot relê avatar, progresso e listas do zero, sem
    // sobrar nada do estado antigo em memória.
    location.reload();
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
    $("btnHistory").onclick = function () { App.openHistory(); };

    // "Importante": o aviso de que os dados vivem só neste aparelho fica
    // recolhido — quem quiser entender por que exportar, abre.
    $("btnDataInfo").onclick = function () {
      var hint = $("dataHint");
      var aberto = hint.classList.toggle("hidden") === false;
      $("btnDataInfo").setAttribute("aria-expanded", String(aberto));
    };

    // Backup: exportar baixa/compartilha o .json; importar SUBSTITUI tudo
    $("btnExport").onclick = doExport;
    $("btnImport").onclick = function () { $("importFile").click(); };
    $("importFile").onchange = onFileChosen;
    $("btnImportCancel").onclick = closeImport;
    $("btnImportOk").onclick = doImport;
    $("importOverlay").onclick = function (e) {
      if (e.target === $("importOverlay")) closeImport();
    };
    $("btnDonate").onclick = function () { App.openDonate(function () { App.openHome(); }); };

    // A linha de criação fica sempre visível; o botão foca o campo
    $("btnNewList").onclick = function () {
      $("newListName").focus();
      $("newListName").scrollIntoView({ block: "center", behavior: "smooth" });
    };
    $("btnCreateList").onclick = createFromInput;
    $("newListName").onkeydown = function (e) { if (e.key === "Enter") createFromInput(); };

    // Copiar lista salva: botão abre o seletor; clicar fora ou Cancelar fecha
    $("btnCopyList").onclick = openCopyPicker;
    $("btnCopyCancel").onclick = closeCopyPicker;
    $("copyOverlay").onclick = function (e) {
      if (e.target === $("copyOverlay")) closeCopyPicker();
    };


    // "Criar" abre uma lista em branco. Copiar de outra compra é o
    // caminho do botão "Copiar lista salva" (openCopyPicker).
    function createFromInput() {
      var name = $("newListName").value.trim() || "Compras";
      var list = Shopping.createList(name);
      $("newListName").value = "";
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
