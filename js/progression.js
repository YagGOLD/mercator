/* ============================================================
   Mercator — Progressão (fase 2): nível, XP, gemas, desbloqueios
   Persistido em localStorage separado do avatar. Enquanto o app
   de compras não existe, o XP/gemas vêm do painel de simulação
   da Home; depois virão de compras, economia e missões.
   ============================================================ */

window.Progress = (function () {

  var KEY = "mercator.progress";
  var CURRENT_VERSION = 1;

  function defaultProgress() {
    return { schemaVersion: CURRENT_VERSION, level: 1, xp: 0, gems: 80, unlocked: [] };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultProgress();
      var p = JSON.parse(raw);
      var clean = defaultProgress();
      clean.level = Math.max(1, p.level | 0);
      clean.xp = Math.max(0, p.xp | 0);
      clean.gems = Math.max(0, p.gems | 0);
      clean.unlocked = Array.isArray(p.unlocked) ? p.unlocked : [];
      return clean;
    } catch (e) {
      console.warn("[Progress] progresso ilegível, recomeçando", e);
      return defaultProgress();
    }
  }

  function save(p) { localStorage.setItem(KEY, JSON.stringify(p)); }

  // XP necessário para sair do nível atual
  function xpForNext(level) { return 50 + (level - 1) * 30; }

  // Retorna a lista de níveis alcançados (pode subir mais de um)
  function addXp(p, amount) {
    p.xp += amount;
    var ups = [];
    while (p.xp >= xpForNext(p.level)) {
      p.xp -= xpForNext(p.level);
      p.level++;
      ups.push(p.level);
    }
    save(p);
    return ups;
  }

  function addGems(p, amount) { p.gems += amount; save(p); }

  function isUnlocked(part, p) {
    if (!part || !part.locked) return true;
    if (p.unlocked.indexOf(part.id) !== -1) return true;
    if (part.unlockedBy && part.unlockedBy.type === "level" && p.level >= part.unlockedBy.value) return true;
    return false;
  }

  // Compra com gemas. Retorna { ok, reason: "gems"|"level" }
  function tryBuy(part, p) {
    if (!part.price) return { ok: false, reason: "level" };
    if (p.gems < part.price) return { ok: false, reason: "gems" };
    p.gems -= part.price;
    p.unlocked.push(part.id);
    save(p);
    return { ok: true };
  }

  // Itens que destravam exatamente neste nível (p/ avisar no level up)
  function itemsUnlockedAtLevel(level) {
    var found = [];
    AvatarCatalog.CATEGORIES.forEach(function (cat) {
      AvatarCatalog.list(cat.id).forEach(function (part) {
        if (part.locked && part.unlockedBy &&
            part.unlockedBy.type === "level" && part.unlockedBy.value === level) {
          found.push(part);
        }
      });
    });
    return found;
  }

  // Itens equipados que estão bloqueados ganham "direito adquirido":
  // entram na lista de desbloqueados (roda uma vez no boot — protege
  // avatares salvos antes de um item passar a ser bloqueado).
  function grandfatherEquipped(avatar, p) {
    var changed = false;
    Object.keys(avatar.parts).forEach(function (cat) {
      var part = avatar.parts[cat] && AvatarCatalog.get(avatar.parts[cat]);
      if (part && part.locked && !isUnlocked(part, p)) {
        p.unlocked.push(part.id);
        changed = true;
      }
    });
    if (changed) save(p);
  }

  // Marcos de evolução aplicados como classes CSS no palco
  function applyTiers(el, level) {
    if (!el) return;
    el.classList.toggle("tier-frame", level >= 10);
    el.classList.toggle("tier-glow", level >= 30);
    el.classList.toggle("tier-bg", level >= 50);
  }

  return {
    load: load,
    save: save,
    xpForNext: xpForNext,
    addXp: addXp,
    addGems: addGems,
    isUnlocked: isUnlocked,
    tryBuy: tryBuy,
    itemsUnlockedAtLevel: itemsUnlockedAtLevel,
    grandfatherEquipped: grandfatherEquipped,
    applyTiers: applyTiers
  };
})();
