// Textes de l'interface — les motifs (français) : la page et le jeu. Source des clés : br/textes/motifs.ts doit avoir exactement les mêmes.
// La fiche (titre, consignes) est dans le catalogue de contenu de l'exercice : src/exercices/motifs/textes.ts. Mots communs : section `communs`.
export default {
  titre: 'Les motifs',
  description: 'Continuer un collier qui se répète',
  niveau: {
    ps: '🐣 PS — deux éléments',
    ms: '🌱 MS — motifs simples',
    gs: '🌳 GS — motifs plus longs',
  },
  exercice: 'Exercice',
  apres: 'Et après ?',
  trou: 'Il en manque un',
  consigneApres: 'Qu’est-ce qui vient après ?',
  consigneTrou: 'Qu’est-ce qui manque dans le collier ?',
  regarde: '❌ Regarde bien comment le collier se répète',
} as const
