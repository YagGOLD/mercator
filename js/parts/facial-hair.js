/* ============================================================
   Mercator — Barba e Bigode (camadas beard / mustache)
   Acompanham a cor do cabelo (slots hair.*).
   Barba: queixo y31..35 | Bigode: acima da boca y27..28
   Categorias opcionais: o primeiro item é sempre "Nenhum".
   ============================================================ */

// ===== Barbas (Lote D) =====

AvatarCatalog.register({ id: "beard_none", category: "beard", name: "Nenhuma", none: true });

AvatarCatalog.register({
  id: "beard_cavanhaque",
  category: "beard",
  name: "Cavanhaque",
  colorable: null,
  offset: { x: 20, y: 32 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow" },
  frames: {
    default: [
      "oHHHHHHo",
      ".oHHHHo.",
      "..oooo.."
    ]
  }
});

AvatarCatalog.register({
  id: "beard_cheia",
  category: "beard",
  name: "Cheia",
  colorable: null,
  offset: { x: 11, y: 25 },
  legend: { "o": "outline", "H": "hair.base", "h": "hair.shadow" },
  frames: {
    default: [
      "oH......................Ho",
      "oHH....................HHo",
      "oHH....................HHo",
      "oHHH..................HHHo",
      "oHHH..................HHHo",
      "oHHHH................HHHHo",
      ".oHHHH..............HHHHo.",
      ".oHHHHHHHHHHHHHHHHHHHHHHo.",
      "..oHHHHHHHHHHHHHHHHHHHHo..",
      "...ohHHHHHHHHHHHHHHHHho...",
      "....oooooooooooooooooo...."
    ]
  }
});

AvatarCatalog.register({
  id: "beard_rala",
  category: "beard",
  name: "Rala",
  colorable: null,
  offset: { x: 13, y: 29 },
  legend: { "h": "hair.shadow" },
  frames: {
    default: [
      "h....................h",
      ".h..h............h..h.",
      "..h..h..........h..h..",
      "...h.h.h......h.h.h...",
      "....h..hh.hh.hh..h...."
    ]
  }
});

// ===== Bigodes (Lote D) =====

AvatarCatalog.register({ id: "mustache_none", category: "mustache", name: "Nenhum", none: true });

AvatarCatalog.register({
  id: "mustache_simples",
  category: "mustache",
  name: "Simples",
  colorable: null,
  offset: { x: 19, y: 27 },
  legend: { "H": "hair.base", "h": "hair.shadow" },
  frames: {
    default: [
      ".HHHH..HHHH.",
      "HHHH....HHHH"
    ]
  }
});

AvatarCatalog.register({
  id: "mustache_bigodao",
  category: "mustache",
  name: "Bigodão",
  colorable: null,
  offset: { x: 18, y: 26 },
  legend: { "H": "hair.base", "h": "hair.shadow" },
  frames: {
    default: [
      "..HHHHHHHH..",
      ".HHH....HHH.",
      "HH........HH"
    ]
  }
});

AvatarCatalog.register({
  id: "mustache_fino",
  category: "mustache",
  name: "Fino",
  colorable: null,
  offset: { x: 19, y: 28 },
  legend: { "h": "hair.shadow" },
  frames: {
    default: [
      ".hhhh..hhhh."
    ]
  }
});
