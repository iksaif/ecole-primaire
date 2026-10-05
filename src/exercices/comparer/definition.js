// @ts-check
// Comparer les quantités — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   PS : comparer « à vue » deux collections dont l'une a au moins deux fois plus d'objets (jusqu'à 10), sans égalité,
//        en touchant le groupe ; MS : nombres jusqu'à 5 (programme : 6), avec égalité ; GS : jusqu'à 10.

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'comparer',
  route: '/maternelle/comparer',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ms',
  reglages: { nbQ: 10 },
  options: { nbQ: [5, 10] },
  niveaux: {
    // PS : 5 questions (enfants de 3 ans)
    ps: { competences: ['comparer-quantites'], reglages: { nbQ: 5 } },
    ms: { competences: ['comparer-quantites'], reglages: {} },
    gs: { competences: ['comparer-quantites'], reglages: {} },
  },
  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
}
