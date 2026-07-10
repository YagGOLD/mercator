/* ============================================================
   Mercator — Paletas de cor do avatar
   Regra do projeto: NENHUM hex solto nas matrizes das partes.
   Toda cor vem daqui, como rampa { base, shadow, light }.
   O contorno é único e quente (não preto puro) — consistência
   com o estilo pixel-art "cozy" da referência.
   ============================================================ */

window.Palettes = {

  // Contorno global (1px, quase-preto quente — estilo v2 da referência)
  outline: "#241a16",

  // ===== Tons de pele =====
  skins: [
    { id: "skin_01", name: "Porcelana", base: "#f9dfc0", shadow: "#e8bd95", light: "#fff0da", blush: "#f2a58a" },
    { id: "skin_02", name: "Clara",     base: "#f2cba1", shadow: "#dfa878", light: "#fce0bd", blush: "#ec9a7c" },
    { id: "skin_03", name: "Dourada",   base: "#e0ab77", shadow: "#c48851", light: "#f0c795", blush: "#d98a68" },
    { id: "skin_04", name: "Morena",    base: "#c08652", shadow: "#9e6636", light: "#d6a06c", blush: "#b56f4e" },
    { id: "skin_05", name: "Marrom",    base: "#96603a", shadow: "#754624", light: "#ad7a50", blush: "#8f5540" },
    { id: "skin_06", name: "Escura",    base: "#6e4226", shadow: "#522e17", light: "#855636", blush: "#6b3f30" }
  ],

  // ===== Cores de cabelo (valem p/ barba, bigode e sobrancelha) =====
  hairColors: [
    { id: "hairc_preto",    name: "Preto",    base: "#2e2a33", shadow: "#1c1922", light: "#5c556e" },
    { id: "hairc_castanho", name: "Castanho", base: "#6b4630", shadow: "#4c2f1e", light: "#8a6044" },
    { id: "hairc_loiro",    name: "Loiro",    base: "#d9a94f", shadow: "#b17f33", light: "#eecb7d" },
    { id: "hairc_ruivo",    name: "Ruivo",    base: "#b5502c", shadow: "#8c371b", light: "#d0703f" },
    { id: "hairc_cinza",    name: "Grisalho", base: "#9aa1a6", shadow: "#6f767c", light: "#c3c9cd" },
    { id: "hairc_teal",     name: "Teal",     base: "#2fa898", shadow: "#1e7a6f", light: "#5bc9b8" },
    { id: "hairc_azul",     name: "Azul",     base: "#3f6fb5", shadow: "#2b4d85", light: "#6592d0" },
    { id: "hairc_rosa",     name: "Rosa",     base: "#d06a9c", shadow: "#a54876", light: "#e690b8" }
  ],

  // ===== Cores de olhos =====
  eyeColors: [
    { id: "eyec_castanho", name: "Castanho", base: "#7a4a2a", shadow: "#54301a", light: "#9c6a42" },
    { id: "eyec_verde",    name: "Verde",    base: "#4a9e5c", shadow: "#2f7040", light: "#72bd80" },
    { id: "eyec_azul",     name: "Azul",     base: "#4a86c8", shadow: "#2f5c94", light: "#74a8dd" },
    { id: "eyec_teal",     name: "Teal",     base: "#35b3a1", shadow: "#217f72", light: "#63d1c1" },
    { id: "eyec_ambar",    name: "Âmbar",    base: "#c8912f", shadow: "#96681f", light: "#dfb055" },
    { id: "eyec_cinza",    name: "Cinza",    base: "#7d8a91", shadow: "#576369", light: "#a1adb3" }
  ],

  // Cores fixas usadas em legends (branco do olho, dentes etc.)
  fixed: {
    white:  "#f7f5f0",
    mouth:  "#8a3f3a",   // interior da boca
    tongue: "#c96a62",
    metal:  "#c9cdd2",   // armações/brincos
    metalShadow: "#8f959c"
  },

  // Confete das partículas ao salvar
  confetti: ["#3fd6c0", "#4da3ff", "#f7c548", "#e690b8", "#f9dfc0", "#72bd80"],

  byId(list, id) { return list.find(function (c) { return c.id === id; }) || list[0]; }
};
