// @ts-check
// Ranger les nombres — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   MS : nombres jusqu'à 6 ; GS : jusqu'à 10 (« voire au-delà ») ; compétence « bande-numerique » (ranger sur la bande
//   numérique). On range 3 à 5 nombres pris entre 1 et 5 (MS) ou 1 et 10 (GS) : sous le plafond du programme.
//   Pas de PS : ranger des nombres n'est pas un attendu avant 4 ans.

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'ordonner',
  route: '/maternelle/ordonner',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ms',
  // sens : 'croissant' | 'decroissant' | 'mix' ; taille : combien de nombres à ranger
  reglages: { sens: 'croissant', taille: 4, nbQ: 10 },
  options: { sens: ['croissant', 'decroissant', 'mix'], taille: [3, 4, 5], nbQ: [5, 10] },
  niveaux: {
    ms: { competences: ['bande-numerique'], reglages: {} },
    gs: { competences: ['bande-numerique'], reglages: {} },
  },
  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
}
