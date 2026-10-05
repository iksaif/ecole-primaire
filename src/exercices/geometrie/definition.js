// @ts-check
// La géométrie — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CE1 : reproduire sur quadrillage, se repérer, figures (carré, rectangle, triangle, triangle rectangle, cercle) et
//         solides (c2maths p. 32-34) ; pas de symétrie ni de losange ;
//   CE2 : + losange, angle droit, symétrie (reconnaître un axe, compléter), patron du cube (p. 35-36).
// Un exercice de la liste = un type de question (symétrie, reproduction, repérage, figures, solides, angles droits,
// propriétés, cercle, patrons) ; les niveaux ne diffèrent que par la liste des exercices et la taille des quadrillages.

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'geometrie',
  route: '/maths/geometrie',
  domaine: 'espace-geometrie',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // axeHorizontal : commun (le réglage mémorisé garde sa clé quel que soit le niveau), proposé au CE2 seulement
  reglages: { nbQ: 8, axeHorizontal: false },
  options: { nbQ: [4, 8, 12] },
  niveaux: {
    ce1: {
      competences: ['figures-planes', 'solides', 'tracer-figures', 'reperage-deplacements'],
      options: { exercices: ['reproduction', 'reperage', 'figures', 'solides'] },
      reglages: { exercices: ['reproduction', 'reperage', 'figures', 'solides'] },
    },
    ce2: {
      competences: ['figures-planes', 'solides', 'tracer-figures', 'reperage-deplacements', 'symetrie', 'angle-droit', 'patrons'],
      options: {
        exercices: ['symetrie', 'reproduction', 'reperage', 'figures', 'solides', 'angles', 'proprietes', 'cercle', 'patrons'],
        axeHorizontal: [false, true],
      },
      reglages: {
        exercices: ['symetrie', 'reproduction', 'reperage', 'figures', 'solides', 'angles', 'proprietes', 'cercle', 'patrons'],
        axeHorizontal: false,
      },
    },
  },
  // fiches par compétence : mêmes fiches que src/impression/exercices.js (slugs inchangés)
  fiches: [
    ...['ce1', 'ce2'].flatMap(niveau => [
      { id: 'reproduction', competence: 'tracer-figures', niveau, reglages: { exercices: ['reproduction'] } },
      { id: 'reperage', competence: 'reperage-deplacements', niveau, reglages: { exercices: ['reperage'] } },
      { id: 'solides', competence: 'solides', niveau, reglages: { exercices: ['solides'] } },
    ]),
    { id: 'figures', competence: 'figures-planes', niveau: 'ce1', reglages: { exercices: ['figures'] } },
    { id: 'figures', competence: 'figures-planes', niveau: 'ce2', reglages: { exercices: ['figures', 'proprietes', 'cercle'] } },
    { id: 'symetrie', competence: 'symetrie', niveau: 'ce2', reglages: { exercices: ['symetrie'] } },
    { id: 'angles', competence: 'angle-droit', niveau: 'ce2', reglages: { exercices: ['angles'] } },
    { id: 'patrons', competence: 'patrons', niveau: 'ce2', reglages: { exercices: ['patrons'] } },
  ],
}
