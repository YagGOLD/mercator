/* ============================================================
   Mercator — Animações idle do avatar
   Um único requestAnimationFrame com agendador por timestamp e
   dirty flag: só redesenha quando algum estado visual muda.
   - Piscar: frame "closed" dos olhos por ~130ms a cada 3–7s
   - Sobrancelha: camada sobe 1px por ~400ms a cada ~12s
   - Sorriso: frame "smile" (se a boca tiver) por 1.5s a cada 15–30s
   - Head-bob: CSS puro no wrapper (não passa por aqui)
   Respeita prefers-reduced-motion.
   ============================================================ */

window.Animator = (function () {

  var canvas = null;
  var getState = null;
  var running = false;
  var session = 0;    // invalida loops antigos quando attach() é chamado de novo
  var dirty = false;
  var overrides = { frames: {}, dy: {} };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var next = { blink: 0, blinkEnd: 0, brow: 0, browEnd: 0, smile: 0, smileEnd: 0 };

  function rand(min, max) { return min + Math.random() * (max - min); }

  function schedule(now) {
    next.blink = now + rand(3000, 7000);
    next.brow = now + rand(9000, 15000);
    next.smile = now + rand(15000, 30000);
  }

  function makeTick(mySession) {
    return function tick(now) {
      if (!running || mySession !== session) return;
      step(now);
      requestAnimationFrame(makeTick(mySession));
    };
  }

  function step(now) {

    if (!reduced) {
      // Piscar
      if (next.blinkEnd && now >= next.blinkEnd) {
        delete overrides.frames.eyes; next.blinkEnd = 0;
        next.blink = now + rand(3000, 7000); dirty = true;
      } else if (now >= next.blink && !next.blinkEnd) {
        overrides.frames.eyes = "closed";
        next.blinkEnd = now + 130; dirty = true;
      }
      // Sobrancelha
      if (next.browEnd && now >= next.browEnd) {
        delete overrides.dy.brows; next.browEnd = 0;
        next.brow = now + rand(9000, 15000); dirty = true;
      } else if (now >= next.brow && !next.browEnd) {
        overrides.dy.brows = -1;
        next.browEnd = now + 400; dirty = true;
      }
      // Sorriso ocasional (só se a boca atual tiver frame "smile")
      if (next.smileEnd && now >= next.smileEnd) {
        delete overrides.frames.mouth; next.smileEnd = 0;
        next.smile = now + rand(15000, 30000); dirty = true;
      } else if (now >= next.smile && !next.smileEnd) {
        var state = getState();
        var mouth = state.parts.mouth && AvatarCatalog.get(state.parts.mouth);
        if (mouth && !mouth.none && mouth.frames.smile) {
          overrides.frames.mouth = "smile";
          next.smileEnd = now + 1500;
          dirty = true;
        } else {
          next.smile = now + rand(15000, 30000);
        }
      }
    }

    if (dirty) {
      Renderer.draw(canvas, getState(), overrides);
      dirty = false;
    }
  }

  return {
    // Liga o animator a um canvas + fonte de estado
    attach: function (targetCanvas, stateGetter) {
      canvas = targetCanvas;
      getState = stateGetter;
      running = true;
      session++;
      dirty = true;
      overrides = { frames: {}, dy: {} };
      schedule(performance.now());
      requestAnimationFrame(makeTick(session));
    },
    detach: function () { running = false; },
    // A UI chama após qualquer mudança de estado
    redraw: function () { dirty = true; },
    // Expressão temporária no palco do criador (presets do Expressions)
    playExpression: function (name, ms) {
      var ov = Expressions.overridesFor(name);
      if (!ov) return;
      overrides.parts = ov.parts;
      dirty = true;
      clearTimeout(this._exprTimer);
      var self = this;
      this._exprTimer = setTimeout(function () {
        delete overrides.parts;
        dirty = true;
      }, ms || 1800);
    },

    // Reações do mascote: vibração + balão de fala curto
    playReaction: function (name, text) {
      var wrap = document.getElementById("avatarWrap");
      var bubble = document.getElementById("speechBubble");
      if (wrap) {
        wrap.classList.remove("react-shake");
        void wrap.offsetWidth;          // reinicia a animação CSS
        wrap.classList.add("react-shake");
      }
      if (text && bubble) {
        bubble.textContent = text;
        bubble.classList.remove("hidden");
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(function () { bubble.classList.add("hidden"); }, 2200);
      }
    }
  };
})();
