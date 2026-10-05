// @ts-check
// Tables de multiplication — définition (format : src/exercices/README.md). Programme : src/data/programme.js,
// « tables-multiplication » (CE1 → CM2, c2maths p. 14 : A × B = C, A et B entre 0 et 10 ; renforcé au CE2 et au cours
// moyen). L'exercice n'avait pas de niveau : on déduit CE1 → CM2 du programme. Tables de 1 à 10 au programme à chaque
// niveau ; les tables de 11 et 12 et « multiplier jusqu'à 12 » sont un bonus. Au CE1 la sélection de départ reprend les
// tables de 2, 3, 4, 5 et 10 (programme du CE1), ailleurs les tables de 2 à 9 (choix d'avant).
// mode : 'entrainement' (voir la table, puis répondre dans l'ordre), 'aleatoire', 'chrono' (1 minute).

const TOUTES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const niveau = (tables) => ({
  competences: ['tables-multiplication'],
  reglages: { tables, jusqu: 10 },
  options: { tables: TOUTES, jusqu: [10, 12] },
  bonus: { tables: [11, 12], jusqu: [12] },
})

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'tables',
  route: '/maths/tables',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ce2',
  // tables : à réviser ; jusqu : multiplier jusqu'à ; nbQ : questions (mode aléatoire) ; ordreFiche et nbFiche : la
  // fiche papier (nbFiche 0 = tous les calculs des tables choisies)
  reglages: { tables: [2, 3, 4, 5, 6, 7, 8, 9], mode: 'aleatoire', jusqu: 10, nbQ: 20, ordreFiche: 'melange', nbFiche: 0 },
  options: {
    mode: ['entrainement', 'aleatoire', 'chrono'], nbQ: [10, 20, 30],
    ordreFiche: ['ordre', 'melange'], nbFiche: [0, 20, 30, 40],
  },
  niveaux: {
    ce1: niveau([2, 3, 4, 5, 10]),
    ce2: niveau([2, 3, 4, 5, 6, 7, 8, 9]),
    cm1: niveau([2, 3, 4, 5, 6, 7, 8, 9]),
    cm2: niveau([2, 3, 4, 5, 6, 7, 8, 9]),
  },
  // aucune fiche par compétence : pas de fiche publiée pour cet exercice
  fiches: [],
}
