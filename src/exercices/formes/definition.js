// @ts-check
// Les formes — définition (format : src/exercices/README.md). Programme : src/data/programme.js, « formes-maternelle »
// (BO n° 41 p. 68-69) : PS trier sans nommer (disque, carré, triangle) ; MS reconnaître ces trois formes ; GS nommer,
// avec le rectangle (5 ans). Un bouton par niveau : PS, MS, GS.
// mode : 'meme' (la même forme que le modèle), 'trouver' (montre le…), 'reconnaitre' (le nom), 'compter' (les côtés).

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'formes',
  route: '/maternelle/formes',
  domaine: 'espace-geometrie',
  contenu: 'interface',
  niveauDefaut: 'ms',
  reglages: { mode: 'meme' },
  niveaux: {
    ps: { competences: ['formes-maternelle'], reglages: { mode: 'meme' }, options: { mode: ['meme'] } },
    ms: { competences: ['formes-maternelle'], reglages: { mode: 'meme' }, options: { mode: ['meme', 'trouver'] } },
    gs: { competences: ['formes-maternelle'], reglages: { mode: 'reconnaitre' }, options: { mode: ['reconnaitre', 'trouver', 'compter', 'meme'] } },
  },
  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée ; le mode du
  // jeu ne change pas la fiche (colorier les formes et les compter, PS : colorier les formes pareilles au modèle)
  fiches: [],
}
