/* ============================================================
   Mercator — Acessórios (camada accessory, topo do empilhamento)
   Cores próprias em hex fixo na legend (não recolorem).
   Categoria opcional: o primeiro item é sempre "Nenhum".
   ============================================================ */

// Lote E — 7 itens

AvatarCatalog.register({ id: "accessory_none", category: "accessory", name: "Nenhum", none: true });

AvatarCatalog.register({
  id: "accessory_bone",
  category: "accessory",
  name: "Boné",
  colorable: null,
  offset: { x: 9, y: 3 },
  legend: { "o": "outline", "C": "#3fd6c0", "c": "#238d80" },
  frames: {
    default: [
      "..........oooooooo............",
      "........ooCCCCCCCCoo..........",
      "......ooCCCCCCCCCCCCoo........",
      ".....oCCCCCCCCCCCCCCCCo.......",
      "....oCCCCCCCCCCCCCCCCCCo......",
      "...oCCCCCCCCCCCCCCCCCCCCo.....",
      "..occcccccccccccccccccccccco..",
      "...ooooooooooooooooooooooooo.."
    ]
  }
});

AvatarCatalog.register({
  id: "accessory_chapeu",
  locked: true, unlockedBy: { type: "level", value: 8 },
  category: "accessory",
  name: "Chapéu",
  colorable: null,
  offset: { x: 9, y: 2 },
  legend: { "o": "outline", "Y": "#d9a94f", "y": "#b17f33" },
  frames: {
    default: [
      ".........oooooooooo...........",
      "........oYYYYYYYYYYo..........",
      "........oYYYYYYYYYYo..........",
      "......ooYYYYyyyyYYYYoo........",
      ".oyyyyYYYYYYYYYYYYYYYYyyyyo...",
      "..oooooooooooooooooooooooo...."
    ]
  }
});

AvatarCatalog.register({
  id: "accessory_faixa",
  category: "accessory",
  name: "Faixa",
  colorable: null,
  offset: { x: 10, y: 12 },
  legend: { "o": "outline", "F": "#dd4b6c", "f": "#a53551" },
  frames: {
    default: [
      "oFFFFFFFFFFFFFFFFFFFFFFFFFFo",
      "offffffffffffffffffffffffffo"
    ]
  }
});

AvatarCatalog.register({
  id: "accessory_tiara",
  locked: true, price: 60,
  category: "accessory",
  name: "Tiara",
  colorable: null,
  offset: { x: 12, y: 5 },
  legend: { "o": "outline", "T": "#f7c548", "g": "#4da3ff" },
  frames: {
    default: [
      "......oooooooooooo......",
      "....ooTTTTTggTTTTToo....",
      "....oo............oo...."
    ]
  }
});

AvatarCatalog.register({
  id: "accessory_presilhas",
  category: "accessory",
  name: "Presilhas",
  colorable: null,
  offset: { x: 12, y: 13 },
  legend: { "P": "#e690b8" },
  frames: {
    default: [
      "PP......",
      "..PP....",
      "....PP.."
    ]
  }
});

AvatarCatalog.register({
  id: "accessory_brincos",
  category: "accessory",
  name: "Brincos",
  colorable: null,
  offset: { x: 9, y: 24 },
  legend: { "m": "metal", "g": "#4da3ff" },
  frames: {
    default: [
      ".m..........................m.",
      ".g..........................g."
    ]
  }
});

AvatarCatalog.register({
  id: "accessory_laco",
  category: "accessory",
  name: "Laço",
  colorable: null,
  offset: { x: 26, y: 4 },
  legend: { "R": "#dd4b6c", "r": "#a53551" },
  frames: {
    default: [
      "RR......RR",
      "RRRR..RRRR",
      ".RRRrrRRR.",
      "..RR..RR.."
    ]
  }
});

// Item LENDÁRIO — só no nível 100 (marco máximo de evolução)
AvatarCatalog.register({
  id: "accessory_coroa",
  locked: true, unlockedBy: { type: "level", value: 100 },
  category: "accessory",
  name: "Coroa",
  colorable: null,
  offset: { x: 17, y: 4 },
  legend: { "T": "#f7c548", "g": "#4da3ff", "y": "#b17f33" },
  frames: {
    default: [
      "T...T...T...T",
      "TT.TTT.TTT.TT",
      "TTTTTTTTTTTTT",
      "TgTTTgTTTgTTT",
      "yyyyyyyyyyyyy"
    ]
  }
});
