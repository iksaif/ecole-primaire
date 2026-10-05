// @ts-check
// La monnaie — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CP  : montants entiers d'euros ≤ 100 € (c2maths p. 26) : compter, payer, rendre ; pas de centimes ;
//   CE1 : centimes (au plus tard en période 2), écriture à virgule à partir de la période 3 (p. 28) ;
//   CE2 : euros et centimes, 1 € = 100 c, écriture à virgule, montants plus grands (p. 30-31).
// Les sommes sont toujours en centimes entiers dans le générateur.

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'monnaie',
  route: '/maths/monnaie',
  domaine: 'grandeurs-mesures',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // réglages communs à tous les niveaux
  reglages: { nbQ: 10, aideTotal: true },
  niveaux: {
    cp: {
      competences: ['monnaie-euros'],
      options: { exercices: ['compter', 'composer', 'moins', 'rendre', 'comparer'], centimes: [false] },
      reglages: { exercices: ['compter', 'composer'], centimes: false },
    },
    ce1: {
      competences: ['monnaie-euros', 'monnaie-centimes'],
      options: { exercices: ['compter', 'composer', 'moins', 'rendre', 'comparer'], centimes: [false, true] },
      reglages: { exercices: ['compter', 'composer'], centimes: false },
    },
    ce2: {
      competences: ['monnaie-euros', 'monnaie-centimes'],
      options: { exercices: ['compter', 'composer', 'moins', 'rendre', 'comparer', 'convertir'], centimes: [false, true] },
      reglages: { exercices: ['compter', 'composer'], centimes: false },
    },
  },
  // fiches par compétence (le bilan d'une classe : réglages par défaut du niveau) ; mêmes fiches que
  // src/impression/exercices.js, qui les produit encore en cliquant (appel direct : phase 4)
  fiches: [
    ...['cp', 'ce1', 'ce2'].flatMap(niveau => [
      { id: 'compter', competence: 'monnaie-euros', niveau, reglages: { exercices: ['compter', 'composer', 'moins', 'comparer'] } },
      { id: 'rendre', competence: 'monnaie-euros', niveau, reglages: { exercices: ['rendre'] } },
    ]),
    { id: 'centimes', competence: 'monnaie-centimes', niveau: 'ce2', reglages: { exercices: ['compter', 'composer', 'convertir'], centimes: true } },
  ],
}
