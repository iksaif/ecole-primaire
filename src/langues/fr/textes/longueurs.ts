// Textes de l'interface — plus long, plus court (français) : la page et le jeu. Source des clés : br/textes/longueurs.ts doit avoir
// exactement les mêmes. La fiche (consignes) est dans le catalogue de contenu de l'exercice : src/exercices/longueurs/textes.ts.
// Mots communs (niveau, exercice…) : section `communs`.
export default {
  titre: 'Plus long, plus court',
  description: 'Comparer et ranger des crayons',
  niveaux: { ps: '🐣 PS — très différents', ms: '🌱 MS — 4 crayons', gs: '🌳 GS — 5 crayons' },
  modes: { comparer: 'Le plus long, le plus court', ranger: 'Ranger' },
  consigneLong: 'Touche le crayon le plus long.',
  consigneCourt: 'Touche le crayon le plus court.',
  consigneRanger: 'Touche les crayons du plus court au plus long.',
  regarde: '❌ Regarde bien le bout des crayons',
  rang: 'Crayon {n}',
} as const
