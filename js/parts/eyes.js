/* ============================================================
   Mercator — Olhos (camada eyes)
   Zona: y19..25, x15..32 (matriz combinada 18 de largura;
   olho esquerdo ~cols 0-6, direito ~cols 11-17)
   Estilo: borda no tom escuro da íris (eye.dark), não no
   contorno marrom — evita cara de óculos. Brilho branco no
   canto superior esquerdo (fonte de luz única).
   Chars: o=contorno  I=eye.iris  D=eye.dark  w=branco (brilho)
   Todo olho ABERTO deve ter frame "closed" (piscar).
   ============================================================ */

// Lote A — 8 estilos

// Estilo v2 (referência): olhos menores, mais afastados,
// brilho branco 2x2 dominante no topo — carisma "cozy"
AvatarCatalog.register({
  id: "eyes_grandes",
  category: "eyes",
  name: "Grandes",
  colorable: "eyes",
  offset: { x: 15, y: 20 },
  legend: { "o": "outline", "I": "eye.iris", "D": "eye.dark", "w": "white" },
  frames: {
    default: [
      ".DDDD........DDDD.",
      "DwwIID......DwwIID",
      "DwwIID......DwwIID",
      "DIIIID......DIIIID",
      "DDIIDD......DDIIDD",
      ".DDDD........DDDD."
    ],
    closed: [
      "..................",
      "..................",
      "..................",
      "oo...oo....oo...oo",
      "..ooo........ooo..",
      ".................."
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_pequenos",
  category: "eyes",
  name: "Pequenos",
  colorable: "eyes",
  offset: { x: 15, y: 21 },
  legend: { "o": "outline", "I": "eye.iris", "D": "eye.dark", "w": "white" },
  frames: {
    default: [
      ".DDDD........DDDD.",
      ".DwwD........DwwD.",
      ".DIID........DIID.",
      ".DDDD........DDDD."
    ],
    closed: [
      "..................",
      ".oooo........oooo.",
      "..................",
      ".................."
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_felizes",
  category: "eyes",
  name: "Felizes",
  colorable: null,
  offset: { x: 15, y: 20 },
  legend: { "o": "outline" },
  frames: {
    default: [
      "..ooo........ooo..",
      ".o...o......o...o.",
      "o.....o....o.....o"
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_anime",
  locked: true, price: 30,
  category: "eyes",
  name: "Anime",
  colorable: "eyes",
  offset: { x: 15, y: 19 },
  legend: { "o": "outline", "I": "eye.iris", "D": "eye.dark", "w": "white" },
  frames: {
    default: [
      ".DDDD........DDDD.",
      "DwwIID......DwwIID",
      "DwwIID......DwwIID",
      "DIIIID......DIIIID",
      "DIIwID......DIIwID",
      "DDIIDD......DDIIDD",
      ".DDDD........DDDD."
    ],
    closed: [
      "..................",
      "..................",
      "..................",
      "..................",
      "oo...oo....oo...oo",
      "..ooo........ooo..",
      ".................."
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_redondos",
  category: "eyes",
  name: "Redondos",
  colorable: "eyes",
  offset: { x: 15, y: 20 },
  legend: { "o": "outline", "I": "eye.iris", "D": "eye.dark", "w": "white" },
  frames: {
    default: [
      ".DDDD........DDDD.",
      "DwwIID......DwwIID",
      "DIIIID......DIIIID",
      "DDIIDD......DDIIDD",
      ".DDDD........DDDD."
    ],
    closed: [
      "..................",
      "..................",
      "..................",
      "oo...oo....oo...oo",
      "..ooo........ooo.."
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_determinado",
  locked: true, unlockedBy: { type: "level", value: 5 },
  category: "eyes",
  name: "Determinado",
  colorable: "eyes",
  offset: { x: 15, y: 20 },
  legend: { "o": "outline", "I": "eye.iris", "D": "eye.dark", "w": "white" },
  frames: {
    default: [
      "oooo..........oooo",
      "DwwIID......DwwIID",
      "DIIIID......DIIIID",
      ".DDDD........DDDD."
    ],
    closed: [
      "..................",
      "..................",
      "oo...oo....oo...oo",
      "..ooo........ooo.."
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_fechados",
  category: "eyes",
  name: "Fechados",
  colorable: null,
  offset: { x: 15, y: 21 },
  legend: { "o": "outline" },
  frames: {
    default: [
      "oo...oo....oo...oo",
      "..ooo........ooo.."
    ]
  }
});

AvatarCatalog.register({
  id: "eyes_sorrindo",
  category: "eyes",
  name: "Sorrindo",
  colorable: null,
  offset: { x: 15, y: 20 },
  legend: { "o": "outline" },
  frames: {
    default: [
      "..ooo........ooo..",
      ".oo.oo......oo.oo.",
      "oo...oo....oo...oo"
    ]
  }
});
