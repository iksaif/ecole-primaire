// Textes de l'interface — conjugaison (français) : la page et le jeu. Source des clés : br/textes/conjugaison.ts doit avoir exactement les mêmes.
// La fiche (titre, temps, groupes, consignes) est dans le catalogue de contenu de l'exercice : src/exercices/conjugaison/textes.ts.
export default {
  titre: 'Conjugaison',
  description: 'Conjuguer au présent, à l’imparfait, au futur…',
  verbeAConjuguer: 'Verbes à conjuguer',
  groupe: { aux: 'auxiliaire', g1: '1er groupe', g2: '2e groupe', g3: '3e groupe' },
  temps: 'Temps',
  nomTemps: {
    present: 'Présent', imparfait: 'Imparfait', futur: 'Futur', 'passe-compose': 'Passé composé', 'passe-simple': 'Passé simple',
    'plus-que-parfait': 'Plus-que-parfait',
  },
  mode: 'Mode',
  modes: { lacunes: 'Lacunes', complet: 'Complet' },
  modesDesc: { lacunes: 'Remplis les terminaisons', complet: 'Écris la forme entière' },
  accents: 'Attention aux accents : {forme}',
  ficheFormat: 'Sur la fiche',
  ficheFormats: { tableaux: 'Des tableaux (quatre verbes)', lignes: 'Une forme par ligne' },
  correction: 'Correction',
} as const
