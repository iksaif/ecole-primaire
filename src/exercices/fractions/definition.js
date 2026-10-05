// @ts-check
// Les fractions — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CE1 : moitié, demi, quart, puis fractions de dénominateur 2, 3, 4, 5, 6, 8 ou 10, toujours ≤ 1 (c2maths p. 12) ;
//   CE2 : égalités de fractions ≤ 1, droite graduée en fractions d'unité (p. 20) ; dénominateur ≤ 12.
// Écart connu : au CE2 les dénominateurs 7, 9, 11 et 12 ne sont pas tirés (ils ne sont que la borne du programme) ;
// les fractions > 1, la comparaison à 1 et la fraction d'une quantité (tiers, quart) sont du CM1 : pas proposées.

const CE1 = ['identifier', 'colorier', 'lettres', 'partDe']

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'fractions',
  route: '/maths/fractions',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // réglages communs à tous les niveaux : nombre de questions à l'écran et sur la fiche
  reglages: { nbQ: 10, nbFiche: 10 },
  options: { nbQ: [5, 10, 15, 20], nbFiche: [5, 10, 15, 20, 30] },
  niveaux: {
    // mode : 'unitaires' (1/2, 1/3…) ou 'toutes' (2/3, 3/4… aussi)
    ce1: {
      competences: ['fractions-unitaires', 'fractions-inferieures-1', 'doubles-moities'],
      options: { types: CE1, mode: ['unitaires', 'toutes'] },
      reglages: { types: CE1, mode: 'unitaires' },
    },
    ce2: {
      competences: ['fractions-unitaires', 'fractions-inferieures-1', 'fractions-egales', 'fractions-mesure', 'doubles-moities'],
      options: { types: [...CE1, 'egales', 'droite', 'placer'], mode: ['unitaires', 'toutes'] },
      reglages: { types: [...CE1, 'egales', 'droite', 'placer'], mode: 'toutes' },
    },
  },
  // fiches par compétence (mêmes ids que src/impression/exercices.js : les slugs publiés ne changent pas)
  fiches: [
    ...['ce1', 'ce2'].flatMap(niveau => [
      { id: 'unitaires', competence: 'fractions-unitaires', niveau, reglages: { types: ['identifier', 'colorier', 'lettres'], mode: 'unitaires' } },
      { id: 'moitie', competence: 'doubles-moities', niveau, reglages: { types: ['partDe'] } },
    ]),
    { id: 'fractions-1', competence: 'fractions-inferieures-1', niveau: 'ce2', reglages: { types: ['identifier', 'colorier', 'lettres'], mode: 'toutes' } },
    { id: 'egales', competence: 'fractions-egales', niveau: 'ce2', reglages: { types: ['egales'] } },
    { id: 'droite', competence: 'fractions-mesure', niveau: 'ce2', reglages: { types: ['droite', 'placer'] } },
  ],
}
