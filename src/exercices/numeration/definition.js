// @ts-check
// Les nombres — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CP  : nombres jusqu'à 100 (dizaines et unités) ; en lettres jusqu'à 50 seulement (c2maths p. 3-4) ;
//   CE1 : jusqu'à 1 000 (centaines) ; suites et ± 10, ± 100 (période 2 : « jusqu'à mille ») ;
//   CE2 : jusqu'à 10 000.
// « Nombres jusqu'à » (plage) : le plus grand nombre tiré ; il détermine le nombre de chiffres (2, 3 ou 4).

const TYPES = ['decomposer', 'representation', 'lettresChiffres', 'chiffresLettres', 'comparer', 'suites', 'droite', 'ranger']

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'numeration',
  route: '/maths/numeration',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // réglages communs à tous les niveaux : nombre de questions à l'écran et sur la fiche
  reglages: { nbQ: 10, nbFiche: 10 },
  options: { nbQ: [5, 10, 15, 20], nbFiche: [5, 10, 15, 20, 30] },
  niveaux: {
    // CP : pas de suites (suites-nombres est une compétence du CE1) ; les nombres en lettres s'arrêtent à 50
    cp: {
      competences: ['numeration-100', 'nombres-en-lettres', 'comparer-ranger', 'droite-graduee'],
      options: { types: TYPES.filter(t => t !== 'suites'), plage: [100] },
      reglages: { types: TYPES.filter(t => t !== 'suites'), plage: 100 },
    },
    ce1: {
      competences: ['numeration-1000', 'nombres-en-lettres', 'comparer-ranger', 'droite-graduee', 'suites-nombres'],
      options: { types: TYPES, plage: [100, 1000] },
      reglages: { types: TYPES, plage: 1000 },
    },
    ce2: {
      competences: ['numeration-10000', 'nombres-en-lettres', 'comparer-ranger', 'droite-graduee', 'suites-nombres'],
      options: { types: TYPES, plage: [1000, 10000] },
      reglages: { types: TYPES, plage: 10000 },
    },
  },
  // fiches par compétence (mêmes ids que src/impression/exercices.js : les slugs publiés ne changent pas)
  fiches: [
    { id: 'numeration', competence: 'numeration-100', niveau: 'cp', reglages: { types: ['decomposer', 'representation', 'lettresChiffres'] } },
    { id: 'numeration', competence: 'numeration-1000', niveau: 'ce1', reglages: { types: ['decomposer', 'representation', 'lettresChiffres'] } },
    { id: 'numeration', competence: 'numeration-10000', niveau: 'ce2', reglages: { types: ['decomposer', 'representation', 'lettresChiffres'] } },
    ...['cp', 'ce1', 'ce2'].flatMap(niveau => [
      { id: 'en-lettres', competence: 'nombres-en-lettres', niveau, reglages: { types: ['chiffresLettres'] } },
      { id: 'comparer-ranger', competence: 'comparer-ranger', niveau, reglages: { types: ['comparer', 'ranger'] } },
      { id: 'droite', competence: 'droite-graduee', niveau, reglages: { types: ['droite'] } },
    ]),
    ...['ce1', 'ce2'].map(niveau => ({ id: 'suites', competence: 'suites-nombres', niveau, reglages: { types: ['suites'] } })),
  ],
}
