/* ============================================================
   Mercator — Partículas de comemoração (confete pixelado)
   Explode quadradinhos nas cores da paleta a partir de um ponto
   (o centro do avatar) e chama onDone ao terminar (~1.2s).
   ============================================================ */

window.Particles = (function () {

  var COUNT = 80;
  var DURATION = 1200; // ms

  function burst(originEl, onDone) {
    var fx = document.getElementById("fxCanvas");
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
    fx.classList.remove("hidden");
    var ctx = fx.getContext("2d");

    var rect = originEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var colors = window.Palettes.confetti;

    var parts = [];
    for (var i = 0; i < COUNT; i++) {
      var ang = Math.random() * Math.PI * 2;
      var speed = 3 + Math.random() * 7;
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 4,          // impulso p/ cima
        size: 4 + Math.floor(Math.random() * 4),
        color: colors[i % colors.length],
        spin: Math.random() < .5
      });
    }

    var start = performance.now();
    function frame(now) {
      var t = (now - start) / DURATION;
      ctx.clearRect(0, 0, fx.width, fx.height);
      if (t >= 1) {
        fx.classList.add("hidden");
        if (onDone) onDone();
        return;
      }
      ctx.globalAlpha = 1 - t * t;
      parts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += .35;                             // gravidade
        var s = p.spin ? p.size * (0.5 + Math.abs(Math.sin(now / 90))) : p.size;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(s), Math.round(s));
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  return { burst: burst };
})();
