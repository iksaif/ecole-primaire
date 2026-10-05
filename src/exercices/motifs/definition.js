// @ts-check
// Les motifs — définition (format : src/exercices/README.md). Programme : src/data/programme.js, « motifs-maternelle »
//   (BO n° 41 p. 70-71). Les types de motifs par niveau sont ceux de src/utils/motifs.js (TYPES_DU_NIVEAU) :
//   PS : alternance AB ; MS : AB, ABB, AAB, ABC ; GS : + AABB, ABCD et motifs évolutifs (réservés à 5 ans).

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'motifs',
  route: '/maternelle/motifs',
  domaine: 'motifs',
  contenu: 'interface',
  niveauDefaut: 'ms',
  // mode : 'apres' (qu'est-ce qui vient après ?) ou 'trou' (il en manque un)
  reglages: { mode: 'apres', nbQ: 10 },
  options: { mode: ['apres', 'trou'], nbQ: [5, 10] },
  niveaux: {
    // PS : 5 questions (enfants de 3 ans), 2 choix
    ps: { competences: ['motifs-maternelle'], reglages: { nbQ: 5 } },
    ms: { competences: ['motifs-maternelle'], reglages: {} },
    gs: { competences: ['motifs-maternelle'], reglages: {} },
  },
  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
}
