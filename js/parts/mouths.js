/* ============================================================
   Mercator — Bocas (camada mouth)
   Zona: y29..32, centro da face x=23.5
   Chars: o=contorno  M=interior boca  T=língua  w=dentes
   Bocas neutras têm frame "smile" (sorriso ocasional do idle).
   ============================================================ */

// Lote A — 6 estilos

// Estilo v2 (referência): sorriso aberto pequeno com língua
AvatarCatalog.register({
  id: "mouth_sorrindo",
  category: "mouth",
  name: "Sorrindo",
  colorable: null,
  offset: { x: 21, y: 29 },
  legend: { "o": "outline", "M": "mouth.inner", "T": "tongue", "w": "white" },
  frames: {
    default: [
      "o....o",
      "oMTTMo",
      ".oooo."
    ]
  }
});

AvatarCatalog.register({
  id: "mouth_neutra",
  category: "mouth",
  name: "Neutra",
  colorable: null,
  offset: { x: 21, y: 30 },
  legend: { "o": "outline" },
  frames: {
    default: [
      ".oooo."
    ],
    smile: [
      "o....o",
      ".oooo."
    ]
  }
});

AvatarCatalog.register({
  id: "mouth_feliz",
  category: "mouth",
  name: "Feliz",
  colorable: null,
  offset: { x: 20, y: 29 },
  legend: { "o": "outline", "M": "mouth.inner", "T": "tongue", "w": "white" },
  frames: {
    default: [
      ".oooooo.",
      "oMMMMMMo",
      ".oMTTMo.",
      "..oooo.."
    ]
  }
});

AvatarCatalog.register({
  id: "mouth_aberta",
  category: "mouth",
  name: "Aberta",
  colorable: null,
  offset: { x: 21, y: 29 },
  legend: { "o": "outline", "M": "mouth.inner", "T": "tongue" },
  frames: {
    default: [
      "..oo..",
      ".oMMo.",
      ".oMMo.",
      "..oo.."
    ]
  }
});

AvatarCatalog.register({
  id: "mouth_rindo",
  locked: true, price: 25,
  category: "mouth",
  name: "Rindo",
  colorable: null,
  offset: { x: 20, y: 29 },
  legend: { "o": "outline", "M": "mouth.inner", "T": "tongue", "w": "white" },
  frames: {
    default: [
      ".oooooo.",
      "owwwwwwo",
      "oMMTTMMo",
      ".oooooo."
    ]
  }
});

AvatarCatalog.register({
  id: "mouth_surpresa",
  category: "mouth",
  name: "Surpresa",
  colorable: null,
  offset: { x: 22, y: 29 },
  legend: { "o": "outline", "M": "mouth.inner" },
  frames: {
    default: [
      ".oo.",
      "oMMo",
      ".oo."
    ]
  }
});
