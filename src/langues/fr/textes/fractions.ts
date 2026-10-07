// Textes de l'interface — les fractions (français) : la page et le jeu. Source des clés : br/textes/fractions.ts doit avoir exactement
// les mêmes. Les consignes, les fractions en lettres et la fiche sont dans le catalogue de contenu de l'exercice :
// src/exercices/fractions/textes.ts. Mots communs (niveau, exercices, valider…) : section `communs`.
export default {
  titre: 'Les fractions',
  description: 'Un demi, un tiers, un quart…',
  fractions: 'Fractions',
  aideColorier: 'Touche les parts pour les colorier ({n} / {total})',
  graduation: '{o} graduation',
  laBonne: '❌ La bonne réponse : {r}',
  passer: 'Passer ⏭',
  passe: '(passé)',
  effacer: '🧽 Effacer',
  types: {
    identifier: '👀 Quelle fraction ?',
    colorier: '🖍️ Colorier',
    lettres: '🔤 En lettres',
    partDe: '🍪 La moitié de…',
    egales: '🟰 Fractions égales',
    droite: '📏 Lire sur la droite',
    placer: '📍 Placer sur la droite',
  },
  // fractions proposées
  modes: {
    unitaires: 'Un demi, un tiers… (1/2, 1/3…)',
    toutes: 'Aussi 2/3, 3/4…',
  },
} as const
