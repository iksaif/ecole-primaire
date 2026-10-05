// @ts-check
// Lire l'heure — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CP  : heures entières, aiguilles ≤ 12 h (c2maths p. 26 : « se limite aux heures entières ») ;
//   CE1 : demi-heures et quarts d'heure, heures après midi, durées (p. 28-29) ; les 5 minutes sont un bonus ;
//   CE2 : heures et minutes, durées, 1 h = 60 min (p. 31) ; pas de secondes au cycle 2.

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'heure',
  route: '/maths/heure',
  domaine: 'grandeurs-mesures',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // réglages communs à tous les niveaux
  reglages: { saisie: 'choix', aideMinutes: true, nbQ: 10, nbHorloges: 8 },
  niveaux: {
    cp: {
      competences: ['heure-entiere'],
      options: { exercices: ['lire', 'placer'], precisions: ['heure'] },
      reglages: { exercices: ['lire'], precisions: ['heure'] },
    },
    ce1: {
      competences: ['heure-entiere', 'heure-demi-quart', 'durees'],
      options: { exercices: ['lire', 'placer', 'journee', 'duree'], precisions: ['heure', 'demi', 'quart', 'cinq'] },
      reglages: { exercices: ['lire'], precisions: ['heure', 'demi', 'quart'] },
      bonus: { precisions: ['cinq'] },
    },
    ce2: {
      competences: ['heure-entiere', 'heure-demi-quart', 'heure-minutes', 'durees'],
      options: {
        exercices: ['lire', 'placer', 'journee', 'duree', 'conversion', 'emploi'],
        precisions: ['heure', 'demi', 'quart', 'cinq', 'minute'],
      },
      reglages: { exercices: ['lire', 'duree', 'conversion'], precisions: ['quart', 'cinq', 'minute'] },
    },
  },
  // fiches par compétence (le bilan d'une classe : réglages par défaut du niveau) ; mêmes fiches que
  // src/impression/exercices.js, qui les produit encore en cliquant (appel direct : phase 4)
  fiches: [
    { id: 'lire', competence: 'heure-demi-quart', niveau: 'ce1', reglages: { exercices: ['lire', 'placer', 'journee'] } },
    { id: 'lire', competence: 'heure-minutes', niveau: 'ce2', reglages: { exercices: ['lire', 'placer'] } },
    { id: 'durees', competence: 'durees', niveau: 'ce1', reglages: { exercices: ['duree'] } },
    { id: 'durees', competence: 'durees', niveau: 'ce2', reglages: { exercices: ['duree', 'conversion', 'emploi'] } },
  ],
}
