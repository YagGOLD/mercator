/* ============================================================
   Mercator — Cabeça-base (sempre presente, camada "head")
   Estilo v2 (referência do usuário, 10/jul): cabeça mais
   REDONDA, sombreamento mais rico, blush marcado, contorno
   quase-preto quente (ver Palettes.outline).

   TEMPLATE-GUIA da face na grade 48x48:
     y  4..8   → topo do cabelo (acima da cabeça)
     y  9      → contorno superior da cabeça
     y 16..17  → SOBRANCELHAS
     y 20..25  → OLHOS  (x15..32, centros ~17.5 e ~29.5)
     y 27..28  → blush
     y 29..31  → BOCA   (x21..26)
     y 34      → contorno do queixo
     centro horizontal da face: x = 23.5

   Chars: o=contorno  s=pele  d=sombra  l=luz  b=blush
   ============================================================ */

AvatarCatalog.register({
  id: "base_head",
  category: "head",
  name: "Cabeça",
  colorable: "skin",
  offset: { x: 10, y: 9 },
  legend: {
    "o": "outline",
    "s": "skin.base",
    "d": "skin.shadow",
    "l": "skin.light",
    "b": "skin.blush"
  },
  frames: {
    default: [
      "..........oooooooo..........",
      ".......oossssssssssoo.......",
      ".....oossssssssssssssoo.....",
      "....osssssssssssssssssso....",
      "...osssssssssssssssssssso...",
      "..osssssssssssssssssssssso..",
      "..osssssssssssssssssssssso..",
      ".olssssssssssssssssssssssdo.",
      ".ollsssssssssssssssssssssdo.",
      ".ollsssssssssssssssssssssdo.",
      ".olssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      ".osssssssssssssssssssssssdo.",
      "..obbbssssssssssssssbbbsdo..",
      "..obbbssssssssssssssbbbsdo..",
      "...osssssssssssssssssssso...",
      "....osssssssssssssssssso....",
      ".....oossssdddddddsssoo.....",
      ".......ooddddddddddoo.......",
      "..........oooooooo.........."
    ]
  }
});
