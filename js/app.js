/* ============================================================
   Mercator — Boot e roteamento entre telas
   1º acesso (sem avatar salvo) → Criador de Avatar.
   Depois → Home (listas + missões). Lista aberta → modo compra.
   ============================================================ */

window.App = (function () {

  var screens = {
    creator: document.getElementById("screenCreator"),
    home: document.getElementById("screenHome"),
    list: document.getElementById("screenList"),
    compare: document.getElementById("screenCompare"),
    donate: document.getElementById("screenDonate")
  };

  function show(name) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle("hidden", k !== name);
    });
  }

  function openCreator(state) {
    show("creator");
    // Editando um mascote existente? "Pular" vira "Cancelar" e NÃO
    // toca no avatar salvo — só no 1º acesso é que salva um default.
    var hasAvatar = !!Store.loadAvatar();
    document.getElementById("btnSkip").textContent =
      hasAvatar ? "Cancelar" : "Pular por enquanto";

    UICreator.init(state, {
      onSave: function (finalState) {
        Store.saveAvatar(finalState);
        openHome();
      },
      onSkip: function () {
        if (!hasAvatar) {
          // 1º acesso: salva default marcado como "pulado" — o criador
          // não reaparece no boot, mas dá p/ reoferecer depois
          Store.saveAvatar(Store.defaultAvatar(), { skipped: true });
        }
        openHome();
      }
    });
  }

  function openHome() {
    show("home");
    Animator.detach();
    UIHome.render();
  }

  function openList(listId) {
    show("list");
    Animator.detach();
    UIList.open(listId);
  }

  function openCompare() {
    show("compare");
    Animator.detach();
    UICompare.open();
  }

  function openDonate(next) {
    show("donate");
    Animator.detach();
    Donation.open(next);
  }

  // ===== Boot =====
  // O avatar é composto por PNGs e o Renderer desenha de forma
  // síncrona (inclusive dentro do requestAnimationFrame do Animator),
  // então o app só entra depois que os assets estão em memória.
  Assets.preload(function () {
    var saved = Store.loadAvatar();
    // Itens equipados antes de virarem bloqueados ficam liberados
    if (saved) Progress.grandfatherEquipped(saved, Progress.load());

    function enter() {
      if (!saved) { openCreator(Store.defaultAvatar()); return; }
      // Deep-links: #lista/<id> abre a lista; #comparador abre o comparador
      var deepLink = location.hash.match(/^#lista\/(.+)$/);
      if (deepLink && Shopping.getList(deepLink[1])) openList(deepLink[1]);
      else if (location.hash === "#comparador") openCompare();
      else openHome();
    }

    // 1º acesso: convite de contribuição (opcional, nunca bloqueia)
    if (!Donation.wasSeen()) openDonate(enter);
    else enter();
  });

  // Service worker: só em HTTPS (GitHub Pages, etapa E7). Em file://
  // e IP local o app já é 100% offline por não depender de rede.
  if (location.protocol === "https:" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  return { openCreator: openCreator, openHome: openHome, openList: openList,
           openCompare: openCompare, openDonate: openDonate };
})();
