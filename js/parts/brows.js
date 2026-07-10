/* ============================================================
   Mercator — Sobrancelhas (camada brows)
   Zona: y16..18 (o animator sobe 1px na micro-animação)
   Chars: B=hair.shadow (acompanha a cor do cabelo)
   ============================================================ */

// Lote C — 5 estilos

AvatarCatalog.register({
  id: "brows_reta",
  category: "brows",
  name: "Reta",
  colorable: null,
  offset: { x: 15, y: 16 },
  legend: { "B": "hair.shadow" },
  frames: {
    default: [
      ".BBBB........BBBB.",
      ".BBBB........BBBB."
    ]
  }
});

AvatarCatalog.register({
  id: "brows_arqueada",
  category: "brows",
  name: "Arqueada",
  colorable: null,
  offset: { x: 15, y: 16 },
  legend: { "B": "hair.shadow" },
  frames: {
    default: [
      "..BBB........BBB..",
      ".BB..B......B..BB."
    ]
  }
});

AvatarCatalog.register({
  id: "brows_brava",
  category: "brows",
  name: "Brava",
  colorable: null,
  offset: { x: 15, y: 16 },
  legend: { "B": "hair.shadow" },
  frames: {
    default: [
      ".BB............BB.",
      "..BBB........BBB..",
      "....B........B...."
    ]
  }
});

AvatarCatalog.register({
  id: "brows_preocupada",
  category: "brows",
  name: "Preocupada",
  colorable: null,
  offset: { x: 15, y: 16 },
  legend: { "B": "hair.shadow" },
  frames: {
    default: [
      "....BB......BB....",
      ".BBB..........BBB."
    ]
  }
});

AvatarCatalog.register({
  id: "brows_grossa",
  category: "brows",
  name: "Grossa",
  colorable: null,
  offset: { x: 15, y: 16 },
  legend: { "B": "hair.shadow" },
  frames: {
    default: [
      ".BBBBB......BBBBB.",
      ".BBBBB......BBBBB."
    ]
  }
});
