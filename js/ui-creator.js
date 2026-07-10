/* ============================================================
   Mercator — UI do Criador de Avatar
   Categorias em botões com thumbnail, carrossel de itens com
   scroll-snap, swatches de cor. Toda mudança redesenha o avatar
   na hora (sem confirmação), conforme a spec.
   ============================================================ */

window.UICreator = (function () {

  var state = null;         // avatar em edição
  var progress = null;      // progressão (nível/gemas/desbloqueios)
  var activeCat = "hair";
  var onSave = null;
  var onSkip = null;

  var els = {};

  function $(id) { return document.getElementById(id); }

  function updateChips() {
    $("statLevel").textContent = progress.level;
    $("statGems").textContent = progress.gems;
  }

  function init(initialState, callbacks) {
    state = initialState;
    progress = Progress.load();
    onSave = callbacks.onSave;
    onSkip = callbacks.onSkip;
    els = {
      canvas: $("avatarCanvas"),
      catRow: $("catRow"),
      catLabel: $("catLabel"),
      itemRow: $("itemRow"),
      swatchRow: $("swatchRow"),
      btnSave: $("btnSave"),
      btnSkip: $("btnSkip")
    };

    Animator.attach(els.canvas, function () { return state; });

    updateChips();
    Progress.applyTiers($("avatarWrap"), progress.level);
    buildCategoryBar();
    selectCategory(activeCat);

    els.btnSave.onclick = function () {
      els.btnSave.disabled = true;
      Particles.burst(els.canvas, function () {
        els.btnSave.disabled = false;
        onSave(state);
      });
    };
    els.btnSkip.onclick = function () { onSkip(); };
  }

  function getState() { return state; }
  function setState(newState) {
    state = newState;
    Animator.redraw();
    buildCategoryBar();
    selectCategory(activeCat);
  }

  // ===== Barra de categorias =====
  function buildCategoryBar() {
    els.catRow.innerHTML = "";
    AvatarCatalog.CATEGORIES.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.className = "cat-btn" + (cat.id === activeCat ? " active" : "");
      btn.title = cat.name;
      btn.setAttribute("aria-label", cat.name);

      if (cat.swatchOnly) {
        // Pele: bolinha com o tom atual
        var dot = document.createElement("span");
        dot.className = "swatch-icon";
        dot.style.background = Palettes.byId(Palettes.skins, state.colors.skin).base;
        btn.appendChild(dot);
      } else {
        var iconId = state.parts[cat.id] || AvatarCatalog.defaultFor(cat.id);
        var src = Renderer.thumbnail(iconId || "base_head", state);
        btn.appendChild(cloneCanvas(src));
      }

      btn.onclick = function () { selectCategory(cat.id); };
      els.catRow.appendChild(btn);
    });
  }

  function cloneCanvas(src) {
    var c = document.createElement("canvas");
    c.width = src.width; c.height = src.height;
    c.getContext("2d").drawImage(src, 0, 0);
    return c;
  }

  // ===== Seleção de categoria =====
  function selectCategory(catId) {
    activeCat = catId;
    var cat = AvatarCatalog.CATEGORIES.find(function (c) { return c.id === catId; });
    els.catLabel.textContent = cat.name;

    Array.prototype.forEach.call(els.catRow.children, function (btn, i) {
      btn.classList.toggle("active", AvatarCatalog.CATEGORIES[i].id === catId);
    });

    buildItems(cat);
    buildSwatches(cat);
  }

  // ===== Carrossel de itens =====
  function buildItems(cat) {
    els.itemRow.innerHTML = "";
    if (cat.swatchOnly) { els.itemRow.classList.add("hidden"); return; }
    els.itemRow.classList.remove("hidden");

    AvatarCatalog.list(cat.id).forEach(function (part) {
      var card = document.createElement("button");
      var isSelected = state.parts[cat.id] === part.id ||
                       (part.none && state.parts[cat.id] === null);
      var unlocked = Progress.isUnlocked(part, progress);
      card.className = "item-card" + (isSelected ? " selected" : "") + (unlocked ? "" : " locked");

      if (part.none) {
        var icon = document.createElement("span");
        icon.className = "none-icon";
        icon.textContent = "×";
        card.appendChild(icon);
      } else {
        card.appendChild(cloneCanvas(Renderer.thumbnail(part.id, state)));
      }

      var name = document.createElement("span");
      name.className = "item-name";
      name.textContent = part.name;
      card.appendChild(name);

      // Badge de desbloqueio: preço em gemas ou nível exigido
      if (!unlocked) {
        var badge = document.createElement("span");
        badge.className = "price";
        badge.textContent = part.price ? "◆ " + part.price : "Nv " + part.unlockedBy.value;
        card.appendChild(badge);
      }

      card.onclick = function () {
        if (!Progress.isUnlocked(part, progress)) {
          if (part.price) {
            var result = Progress.tryBuy(part, progress);
            if (!result.ok) {
              Toast.show("Faltam " + (part.price - progress.gems) + " gemas para " + part.name, "warn");
              return;
            }
            updateChips();
            Particles.burst(card, null);
            Animator.playExpression("surpreso", 1800);
            Animator.playReaction("unlock", "Novo item desbloqueado!");
            Toast.show(part.name + " desbloqueado por ◆ " + part.price + "!", "ok");
          } else {
            Toast.show(part.name + " desbloqueia no nível " + part.unlockedBy.value, "warn");
            return;
          }
        }
        state.parts[cat.id] = part.none ? null : part.id;
        Animator.redraw();
        buildItems(cat);        // atualiza seleção
        buildCategoryBar();     // atualiza ícone da categoria
      };
      els.itemRow.appendChild(card);
    });
  }

  // ===== Swatches de cor =====
  function buildSwatches(cat) {
    var group = cat.colorable; // "skin" | "hair" | "eyes" | null
    if (!group) { els.swatchRow.classList.add("hidden"); return; }

    var lists = { skin: Palettes.skins, hair: Palettes.hairColors, eyes: Palettes.eyeColors };
    els.swatchRow.classList.remove("hidden");
    els.swatchRow.innerHTML = "";

    lists[group].forEach(function (color) {
      var sw = document.createElement("button");
      sw.className = "swatch" + (state.colors[group] === color.id ? " selected" : "");
      sw.style.background = color.base;
      sw.title = color.name;
      sw.setAttribute("aria-label", color.name);
      sw.onclick = function () {
        state.colors[group] = color.id;
        Animator.redraw();
        buildSwatches(cat);
        buildItems(cat);        // thumbnails na cor nova
        buildCategoryBar();
      };
      els.swatchRow.appendChild(sw);
    });
  }

  return { init: init, getState: getState, setState: setState };
})();
