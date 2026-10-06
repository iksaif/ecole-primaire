// @ts-check
// Calcul mental — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CP  : + et − ≤ 20, compléments à 10, doubles et moitiés ; les stratégies (± dizaines, ± 9, passage de dizaine,
//         complément à la dizaine) sont au programme du CP mais pas encore proposées ici (plan 09, audit maths) ;
//   CE1 : nombres ≤ 1 000, tables de 2, 3, 4, 5 et 10 (pas de division), × 10 (× 100 : CE2), doubles et moitiés ;
//   CE2 : ≤ 10 000, tables de 2 à 9, division « combien de fois », × 10 et × 100 ;
//   CM1, CM2 : entiers (pas de contrainte chiffrée au cycle 3), tables jusqu'à 12 puis 25.
// Les identifiants d'opérations (« + », « Compléments à 10 »…) sont aussi ceux des réglages mémorisés des visiteurs
// et les libellés des boutons que le build des fiches clique (src/impression/exercices.js) : ils ne changent pas.

const VERS_DIZAINE = 'Vers la dizaine (37 + ? = 40)'
const DIZAINES = '± dizaines (45 + 30)'
const NEUF_ONZE = '± 9 / ± 11'
const PASSAGE = 'Passage de dizaine (47 + 6)'
export const OPS = { VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE }

const BASE = ['+', '−', 'Compléments à 10']
const STRATEGIES = [VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE]
const CM = ['+', '−', '×', '÷', 'Compléments à 10', 'Compléments à 100', ...STRATEGIES, 'Doubles', 'Moitiés', '× 10 / × 100']
const defaut = { ops: ['+', '−'] }

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'calcul-mental',
  route: '/maths/calcul-mental',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ce2',
  // temps : secondes par question (0 = sans limite) ; nbQ : questions du jeu ; nbFiche : calculs d'une fiche
  reglages: { nbQ: 10, temps: 10, nbFiche: 20 },
  options: { nbQ: [5, 10, 20], temps: [0, 10, 20, 30], nbFiche: [10, 20, 30, 40] },
  niveaux: {
    cp: {
      competences: ['tables-addition', 'complement-dizaine', 'doubles-moities'],
      options: { ops: [...BASE, 'Doubles', 'Moitiés'] },
      reglages: defaut,
    },
    ce1: {
      competences: ['tables-addition', 'tables-multiplication', 'complement-dizaine', 'ajouter-dizaines', 'ajouter-9', 'doubles-moities', 'multiplier-10-100'],
      options: { ops: ['+', '−', '×', 'Compléments à 10', 'Compléments à 100', ...STRATEGIES, 'Doubles', 'Moitiés', '× 10 / × 100'] },
      reglages: defaut,
    },
    ce2: {
      competences: ['tables-addition', 'tables-multiplication', 'sens-division', 'complement-dizaine', 'ajouter-dizaines', 'ajouter-9', 'doubles-moities', 'multiplier-10-100'],
      options: { ops: CM },
      reglages: defaut,
    },
    ...Object.fromEntries(['cm1', 'cm2'].map(n => [n, {
      competences: ['tables-multiplication', 'sens-division', 'complement-dizaine', 'ajouter-dizaines', 'ajouter-9', 'doubles-moities', 'multiplier-10-100'],
      options: { ops: CM },
      reglages: defaut,
    }])),
  },
  // fiches par compétence (le bilan d'une classe : « + » et « − ») ; mêmes fiches que src/impression/exercices.js
  fiches: [
    ...['cp', 'ce1', 'ce2'].map(niveau => ({ id: 'tables-addition', competence: 'tables-addition', niveau, reglages: { ops: ['+', '−'] } })),
    ...['ce1', 'ce2', 'cm1', 'cm2'].map(niveau => ({ id: 'tables-multiplication', competence: 'tables-multiplication', niveau, reglages: { ops: ['×'] } })),
    ...['ce2', 'cm1', 'cm2'].map(niveau => ({ id: 'division', competence: 'sens-division', niveau, reglages: { ops: ['÷'] } })),
    { id: 'complements', competence: 'complement-dizaine', niveau: 'cp', reglages: { ops: ['Compléments à 10'] } },
    ...['ce1', 'ce2', 'cm1', 'cm2'].flatMap(niveau => [
      { id: 'complements', competence: 'complement-dizaine', niveau, reglages: { ops: ['Compléments à 100', VERS_DIZAINE] } },
      { id: 'dizaines', competence: 'ajouter-dizaines', niveau, reglages: { ops: [DIZAINES, PASSAGE] } },
      { id: 'ajouter-9', competence: 'ajouter-9', niveau, reglages: { ops: [NEUF_ONZE] } },
      { id: 'multiplier-10-100', competence: 'multiplier-10-100', niveau, reglages: { ops: ['× 10 / × 100'] } },
    ]),
    ...['cp', 'ce1', 'ce2', 'cm1', 'cm2'].map(niveau => ({ id: 'doubles-moities', competence: 'doubles-moities', niveau, reglages: { ops: ['Doubles', 'Moitiés'] } })),
  ],
}
