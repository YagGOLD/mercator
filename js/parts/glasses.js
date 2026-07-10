/* ============================================================
   Mercator — Óculos (camada glasses, acima da franja)
   Zona: y19..23, x14..33 (lentes alinhadas aos olhos)
   Chars: m=metal  o=contorno  x=lente escura (hex fixo)
   Categoria opcional: o primeiro item é sempre "Nenhum".
   ============================================================ */

// Lote D — 3 modelos

AvatarCatalog.register({ id: "glasses_none", category: "glasses", name: "Nenhum", none: true });

AvatarCatalog.register({
  id: "glasses_redondos",
  category: "glasses",
  name: "Redondos",
  colorable: null,
  offset: { x: 14, y: 19 },
  legend: { "m": "metal" },
  frames: {
    default: [
      ".mmmmmmm....mmmmmmm.",
      "m.......m..m.......m",
      "m.......mmmm.......m",
      "m.......m..m.......m",
      ".mmmmmmm....mmmmmmm."
    ]
  }
});

AvatarCatalog.register({
  id: "glasses_quadrados",
  category: "glasses",
  name: "Quadrados",
  colorable: null,
  offset: { x: 14, y: 19 },
  legend: { "o": "outline" },
  frames: {
    default: [
      "oooooooo....oooooooo",
      "o......oooooo......o",
      "o......o....o......o",
      "oooooooo....oooooooo"
    ]
  }
});

AvatarCatalog.register({
  id: "glasses_sol",
  locked: true, price: 45,
  category: "glasses",
  name: "De sol",
  colorable: null,
  offset: { x: 14, y: 19 },
  legend: { "o": "outline", "x": "#1c2226" },
  frames: {
    default: [
      "oooooooo....oooooooo",
      "oxxxxxxooooooxxxxxxo",
      "oxxxxxxo....oxxxxxxo",
      ".oooooo......oooooo."
    ]
  }
});
