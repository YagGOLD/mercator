/* ============================================================
   Mercator — Cabelos (camada hairFront; longos usam back)
   Chars: o=contorno  H=hair.base  h=hair.shadow  L=hair.light
   Zona: topo y5..y15; franja termina antes das sobrancelhas (y16)
   ============================================================ */

// Lote B — 9 estilos. O PRIMEIRO registro vira o cabelo padrão do
// avatar novo (defaultFor) — manter a Franja no topo.

// Franja: estilo v2 (referência) — mechas volumosas com brilho
// chapado no topo-esquerdo e pontas bagunçadas sobre a testa
AvatarCatalog.register({
  id: "hair_franja",
  category: "hair",
  name: "Franja",
  colorable: "hair",
  offset: { x: 9, y: 4 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "..........oooooooooo..........",
      "......ooooHHHHHHHHHHoooo......",
      ".....oHHHHLLHHHHHHHHHHHHo.....",
      "....oHHHLLLLHHHHHHHHHHHHHo....",
      "...oHHHLLLLLLHHHHHHHHHHHHHo...",
      "..oHHHHLLLLHHHHHHHHHHHHHHHHo..",
      ".oHHHHHLLHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHhHHhHHHHHo.",
      ".ohHHHHHHhhHHHHhhHHHHhhHHHhho.",
      ".oHHohHHHo.hHHHo.oHHHho.oHHHo.",
      ".oHho....................ohHo.",
      ".oHo......................oHo.",
      "..oo......................oo.."
    ]
  }
});

// Curto: coroa alta, testa à mostra
AvatarCatalog.register({
  id: "hair_curto",
  category: "hair",
  name: "Curto",
  colorable: "hair",
  offset: { x: 9, y: 5 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "...........oooooooo...........",
      "........oooHHHHHHHHooo........",
      "......ooHHHHHHHHHHHHHHoo......",
      "....ooHHHHHHLLHHHHHHHHHHoo....",
      "...oHHHHHLLLLHHHHHHHHHHHHHo...",
      "..oHHHHHLLLLHHHHHHHHHHHHHHHo..",
      "..oHHHHHHLLHHHHHHHHHHHHHHHHo..",
      ".ohHHHHHHHHHHHHHHHHHHHHHHHHho.",
      "..oooooooooooooooooooooooooo.."
    ]
  }
});

// Liso: franja de corte reto
AvatarCatalog.register({
  id: "hair_liso",
  category: "hair",
  name: "Liso",
  colorable: "hair",
  offset: { x: 9, y: 5 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "...........oooooooo...........",
      "........oooHHHHHHHHooo........",
      "......ooHHHHHHHHHHHHHHoo......",
      "....ooHHHHHHLLHHHHHHHHHHoo....",
      "...oHHHHHLLLLHHHHHHHHHHHHHo...",
      "..oHHHHHLLLLHHHHHHHHHHHHHHHo..",
      "..oHHHHHHLLHHHHHHHHHHHHHHHHo..",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".ohHHHHHHHHHHHHHHHHHHHHHHHHho.",
      ".oooooooooooooooooooooooooooo."
    ]
  }
});

// Médio: franja + mechas laterais até a bochecha
AvatarCatalog.register({
  id: "hair_medio",
  category: "hair",
  name: "Médio",
  colorable: "hair",
  offset: { x: 9, y: 5 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "...........oooooooo...........",
      "........oooHHHHHHHHooo........",
      "......ooHHHHHHHHHHHHHHoo......",
      "....ooHHHHHHLLHHHHHHHHHHoo....",
      "...oHHHHHLLLLHHHHHHHHHHHHHo...",
      "..oHHHHHLLLLHHHHHHHHHHHHHHHo..",
      "..oHHHHHHLLHHHHHHHHHHHHHHHHo..",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".ohhHHHHhhHHHHhhHHHHhhHHHHhho.",
      ".oHHohhh..hhhh..hhhh..hhhoHHo.",
      ".oHHo....................oHHo.",
      ".oHHo....................oHHo.",
      ".ohHo....................ohHo.",
      "..oo......................oo.."
    ]
  }
});

// Longo: franja na frente + cortina de cabelo atrás da cabeça
AvatarCatalog.register({
  id: "hair_longo",
  locked: true, unlockedBy: { type: "level", value: 3 },
  category: "hair",
  name: "Longo",
  colorable: "hair",
  offset: { x: 9, y: 5 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "...........oooooooo...........",
      "........oooHHHHHHHHooo........",
      "......ooHHHHHHHHHHHHHHoo......",
      "....ooHHHHHHLLHHHHHHHHHHoo....",
      "...oHHHHHLLLLHHHHHHHHHHHHHo...",
      "..oHHHHHLLLLHHHHHHHHHHHHHHHo..",
      "..oHHHHHHLLHHHHHHHHHHHHHHHHo..",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".ohhHHHHhhHHHHhhHHHHhhHHHHhho.",
      ".oHHohhh..hhhh..hhhh..hhhoHHo.",
      ".oHHo....................oHHo.",
      ".oHHo....................oHHo.",
      ".oHHo....................oHHo.",
      ".oHHo....................oHHo.",
      ".oHHo....................oHHo.",
      ".ohHo....................ohHo.",
      "..oo......................oo.."
    ]
  },
  back: {
    offset: { x: 9, y: 7 },
    legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow" },
    frames: {
      default: [
        "....ooHHHHHHHHHHHHHHHHHHoo....",
        "..ooHHHHHHHHHHHHHHHHHHHHHHoo..",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
        "..ohhhhhhhhhhhhhhhhhhhhhhhho..",
        "...oooooooooooooooooooooooo..."
      ]
    }
  }
});

// Cacheado: silhueta de cachos (bolhas)
AvatarCatalog.register({
  id: "hair_cacheado",
  category: "hair",
  name: "Cacheado",
  colorable: "hair",
  offset: { x: 9, y: 4 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "......oo..oo..oo..oo..oo......",
      "....ooHHooHHooHHooHHooHHoo....",
      "...oHHHHHHHHHHHHHHHHHHHHHHo...",
      "..oHHhHHHHhHHHHhHHHHhHHHHhHo..",
      ".oHHHHHHHLLHHHHHHHHHHHHHHHHHo.",
      ".oHhHHHHLLHHHHHHHHHHHHHHHHhHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      "..oHHhHHHHhHHHHhHHHHhHHHHhHo..",
      "..ooHHooHHooHHooHHooHHooHHoo..",
      "....oo..oo..oo..oo..oo..oo...."
    ]
  }
});

// Moicano: crista central com laterais raspadas
AvatarCatalog.register({
  id: "hair_moicano",
  locked: true, price: 55,
  category: "hair",
  name: "Moicano",
  colorable: "hair",
  offset: { x: 17, y: 2 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "...oo..oo...",
      "..oHHooHHo..",
      ".oHHHHHHHHo.",
      ".oHHLLHHHHo.",
      ".oHHHHHHHHo.",
      "..oHHHHHHo..",
      "..oHHHHHHo..",
      "...oHHHHo..."
    ]
  }
});


// Emo: topo bagunçado com pontas, franja longa varrida cobrindo o olho
// esquerdo (do observador) até a bochecha, mecha lateral no lado direito.
AvatarCatalog.register({
  id: "hair_emo",
  locked: true, price: 40,
  category: "hair",
  name: "Emo",
  colorable: "hair",
  offset: { x: 8, y: 4 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow", "L": "hair.light" },
  frames: {
    default: [
      "............ooo..ooo..oo........",
      ".........ooHHHooHHHHHoHHoo......",
      ".......ooHHHHHHHHHHHHHHHHHoo....",
      "......oHHHHHLLHHHHHHHHHHHHHo....",
      "....ooHHHHLLLLHHHHHHHHHHHHHHo...",
      "...oHHHHHLLLHHHHHHHHHHHHHHHHHo..",
      "..oHHHHHHHLLHHHHHHHHHHHHHHHHHHo.",
      "..oHHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHhhHHHHhhHHHHHHHHo.",
      ".oHHHHHHHHHHHhhHHHhhHHHHHHHHHHo.",
      ".oHHHHHHHHHHHHHhho......oHHHHo..",
      ".oHHHHHHHHHHHHhho.......oHHHo...",
      ".oHHHHHHHHhhHho...........oHHo..",
      ".oHHHHHHHHhHHho...........oHHo..",
      ".oHHHHHHHHhhho............ohHo..",
      "..ohHHHHHHhho............ohho...",
      "..oHHHHHHho.................oo..",
      "...ohHHHHo......................",
      "....ohhHo.......................",
      "......oo........................"
    ]
  }
});


// Careca: item real que não desenha nada (a cabeça-base aparece limpa).
// Fica por último para nunca virar o default.
AvatarCatalog.register({
  id: "hair_careca",
  category: "hair",
  name: "Careca",
  colorable: null,
  offset: { x: 0, y: 0 },
  legend: {},
  frames: { default: ["."] }
});
