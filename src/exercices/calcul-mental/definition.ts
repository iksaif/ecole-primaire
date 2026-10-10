// Calcul mental — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   CP  : + et − ≤ 20, compléments à 10, doubles et moitiés ; stratégies sur les nombres jusqu'à 100 (± dizaines, ± 9,
//         passage de dizaine, complément à la dizaine) ;
//   CE1 : nombres ≤ 1 000, tables de 2, 3, 4, 5 et 10 (pas de division), × 10 (× 100 : CE2), doubles et moitiés ;
//   CE2 : ≤ 10 000, tables de 2 à 9, division « combien de fois », × 10 et × 100 ;
//   CM1, CM2 : entiers (pas de contrainte chiffrée au cycle 3), tables jusqu'à 12 puis 25.
// Les identifiants d'opérations (« + », « Compléments à 10 »…) sont aussi les valeurs des réglages mémorisés des visiteurs :
// ils ne changent pas (les libellés affichés sont dans textes.ts).
import { definir, cases, choix, pourClasses, fichesPourClasses, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

// Les opérations proposées (littéraux : le type des réglages en découle)
export const PLUS = '+'
export const MOINS = '−'
export const FOIS = '×'
export const DIVISION = '÷'
export const COMPLEMENTS_10 = 'Compléments à 10'
export const COMPLEMENTS_100 = 'Compléments à 100'
export const VERS_DIZAINE = 'Vers la dizaine (37 + ? = 40)'
export const DIZAINES = '± dizaines (45 + 30)'
export const NEUF_ONZE = '± 9 / ± 11'
export const PASSAGE = 'Passage de dizaine (47 + 6)'
export const DOUBLES = 'Doubles'
export const MOITIES = 'Moitiés'
export const FOIS_10_100 = '× 10 / × 100'

// Par niveau, dans l'ordre d'affichage (au CE1, « × 10 / × 100 » ne propose que × 10 : × 100 est au programme du CE2)
const OPS_CP = [PLUS, MOINS, COMPLEMENTS_10, VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE, DOUBLES, MOITIES] as const
const OPS_CE1 = [PLUS, MOINS, FOIS, COMPLEMENTS_10, COMPLEMENTS_100, VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE, DOUBLES, MOITIES, FOIS_10_100] as const
const OPS_CM = [PLUS, MOINS, FOIS, DIVISION, COMPLEMENTS_10, COMPLEMENTS_100, VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE, DOUBLES, MOITIES, FOIS_10_100] as const
const PAR_DEFAUT = [PLUS, MOINS] as const

export default definir({
  id: 'calcul-mental',
  route: '/maths/calcul-mental',
  domaine: D.nombresCalcul,
  niveauDefaut: 'ce2',
  competences: [K.tablesAddition, K.tablesMultiplication, K.sensDivision, K.complementDizaine, K.ajouterDizaines, K.ajouter9, K.doublesMoities, K.multiplier10100],

  // temps : secondes par question (0 = sans limite) ; nbQ : questions du jeu ; nbFiche : calculs d'une fiche
  reglages: {
    nbQ: choix([5, 10, 20], { defaut: 10, libre: NB_LIBRE }),
    temps: choix([0, 10, 20, 30], { defaut: 10 }),
    nbFiche: choix([10, 20, 30, 40, 60], { defaut: 20 }),
  },

  // opérations de chaque niveau ; tables : celles de × et ÷ (au CE1 et au CE2 : les tables du programme ; au cycle 3, les
  // deux facteurs vont de 2 à 12, puis 25 : pas de réglage « tables »)
  niveaux: {
    cp: { reglages: { ops: cases(OPS_CP, { defaut: PAR_DEFAUT }) } },
    ce1: { reglages: { ops: cases(OPS_CE1, { defaut: PAR_DEFAUT }), tables: cases([2, 3, 4, 5, 10]) } },
    ce2: { reglages: { ops: cases(OPS_CM, { defaut: PAR_DEFAUT }), tables: cases([2, 3, 4, 5, 6, 7, 8, 9, 10], { defaut: [2, 3, 4, 5, 6, 7, 8, 9] }) } },
    ...pourClasses('cm1-cm2', { reglages: { ops: cases(OPS_CM, { defaut: PAR_DEFAUT }) } }),
  },

  // Fiches par compétence (le bilan d'une classe : « + » et « − »). Celles qui portent un `slug` existaient avant, sous cette
  // adresse (fiches « de calcul » à la carte) : elle ne change pas. Titres et descriptions : `fiche.<id>` de textes.ts.
  fiches: [
    // tables d'addition
    ...fichesPourClasses('cp-ce2', { id: 'tables-addition', competence: K.tablesAddition, reglages: { ops: [PLUS, MOINS] } }),
    { id: 'tables-addition-cp', slug: 'fiche-tables-d-addition-cp', competence: K.tablesAddition, niveau: 'cp', reglages: { ops: [PLUS, MOINS], nbFiche: 30 } },
    { id: 'additions-jusqu-a-20', slug: 'fiche-additions-jusqu-a-20', competence: K.tablesAddition, niveau: 'cp', reglages: { ops: [PLUS], nbFiche: 30 } },
    { id: 'additions-soustractions-ce1', slug: 'fiche-additions-soustractions-ce1', competence: K.tablesAddition, niveau: 'ce1', reglages: { ops: [PLUS, MOINS], nbFiche: 30 } },
    { id: 'calcul-mental-ce1', slug: 'fiche-calcul-mental-ce1', competence: K.tablesAddition, niveau: 'ce1',
      reglages: { ops: [PLUS, MOINS, FOIS, COMPLEMENTS_10, DOUBLES, MOITIES], nbFiche: 40 } },
    // tables de multiplication
    ...fichesPourClasses('ce1+', { id: 'tables-multiplication', competence: K.tablesMultiplication, reglages: { ops: [FOIS] } }),
    { id: 'table-2', slug: 'fiche-table-de-multiplication-2', competence: K.tablesMultiplication, niveau: 'ce1', reglages: { ops: [FOIS], tables: [2], nbFiche: 30 } },
    { id: 'table-3', slug: 'fiche-table-de-multiplication-3', competence: K.tablesMultiplication, niveau: 'ce1', reglages: { ops: [FOIS], tables: [3], nbFiche: 30 } },
    { id: 'table-4', slug: 'fiche-table-de-multiplication-4', competence: K.tablesMultiplication, niveau: 'ce1', reglages: { ops: [FOIS], tables: [4], nbFiche: 30 } },
    { id: 'table-5', slug: 'fiche-table-de-multiplication-5', competence: K.tablesMultiplication, niveau: 'ce1', reglages: { ops: [FOIS], tables: [5], nbFiche: 30 } },
    { id: 'table-10', slug: 'fiche-table-de-multiplication-10', competence: K.tablesMultiplication, niveau: 'ce1', reglages: { ops: [FOIS], tables: [10], nbFiche: 30 } },
    { id: 'table-6', slug: 'fiche-table-de-multiplication-6', competence: K.tablesMultiplication, niveau: 'ce2', reglages: { ops: [FOIS], tables: [6], nbFiche: 30 } },
    { id: 'table-7', slug: 'fiche-table-de-multiplication-7', competence: K.tablesMultiplication, niveau: 'ce2', reglages: { ops: [FOIS], tables: [7], nbFiche: 30 } },
    { id: 'table-8', slug: 'fiche-table-de-multiplication-8', competence: K.tablesMultiplication, niveau: 'ce2', reglages: { ops: [FOIS], tables: [8], nbFiche: 30 } },
    { id: 'table-9', slug: 'fiche-table-de-multiplication-9', competence: K.tablesMultiplication, niveau: 'ce2', reglages: { ops: [FOIS], tables: [9], nbFiche: 30 } },
    { id: 'tables-2-a-5', slug: 'fiche-tables-de-multiplication-2-a-5', competence: K.tablesMultiplication, niveau: 'ce1', reglages: { ops: [FOIS], tables: [2, 3, 4, 5], nbFiche: 40 } },
    { id: 'tables-6-a-9', slug: 'fiche-tables-de-multiplication-6-a-9', competence: K.tablesMultiplication, niveau: 'ce2', reglages: { ops: [FOIS], tables: [6, 7, 8, 9], nbFiche: 40 } },
    { id: 'toutes-les-tables', slug: 'fiche-toutes-les-tables-de-multiplication', competence: K.tablesMultiplication, niveau: 'ce2',
      reglages: { ops: [FOIS], tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], nbFiche: 60 } },
    // division
    ...fichesPourClasses('ce2+', { id: 'division', competence: K.sensDivision, reglages: { ops: [DIVISION] } }),
    { id: 'divisions-combien-de-fois', slug: 'fiche-divisions-combien-de-fois', competence: K.sensDivision, niveau: 'ce2', reglages: { ops: [DIVISION], tables: [2, 3, 4, 5, 10], nbFiche: 20 } },
    { id: 'divisions-tables-cm1', slug: 'fiche-divisions-tables-cm1', competence: K.sensDivision, niveau: 'cm1', reglages: { ops: [DIVISION], nbFiche: 40 } },
    // compléments
    { id: 'complements', competence: K.complementDizaine, niveau: 'cp', reglages: { ops: [COMPLEMENTS_10] } },
    ...fichesPourClasses('ce1+', { id: 'complements', competence: K.complementDizaine, reglages: { ops: [COMPLEMENTS_100, VERS_DIZAINE] } }),
    { id: 'complements-a-10', slug: 'fiche-complements-a-10', competence: K.complementDizaine, niveau: 'cp', reglages: { ops: [COMPLEMENTS_10], nbFiche: 20 } },
    { id: 'complements-a-100', slug: 'fiche-complements-a-100', competence: K.complementDizaine, niveau: 'ce1', reglages: { ops: [COMPLEMENTS_100], nbFiche: 30 } },
    { id: 'complements-dizaine', slug: 'fiche-complements-dizaine-superieure', competence: K.complementDizaine, niveau: 'ce1', reglages: { ops: [VERS_DIZAINE], nbFiche: 30 } },
    // dizaines, 9 et 11, × 10 et × 100
    ...fichesPourClasses('cp+', { id: 'dizaines', competence: K.ajouterDizaines, reglages: { ops: [DIZAINES, PASSAGE] } }),
    { id: 'ajouter-retirer-10', slug: 'fiche-ajouter-retirer-10', competence: K.ajouterDizaines, niveau: 'cp', reglages: { ops: [DIZAINES], nbFiche: 30 } },
    ...fichesPourClasses('cp+', { id: 'ajouter-9', competence: K.ajouter9, reglages: { ops: [NEUF_ONZE] } }),
    { id: 'ajouter-retirer-9-11', slug: 'fiche-ajouter-retirer-9-11', competence: K.ajouter9, niveau: 'ce1', reglages: { ops: [NEUF_ONZE], nbFiche: 30 } },
    ...fichesPourClasses('ce1+', { id: 'multiplier-10-100', competence: K.multiplier10100, reglages: { ops: [FOIS_10_100] } }),
    { id: 'multiplier-par-10-et-100', slug: 'fiche-multiplier-par-10-et-100', competence: K.multiplier10100, niveau: 'ce2', reglages: { ops: [FOIS_10_100], nbFiche: 30 } },
    // doubles et moitiés
    ...fichesPourClasses('cp+', { id: 'doubles-moities', competence: K.doublesMoities, reglages: { ops: [DOUBLES, MOITIES] } }),
    { id: 'doubles-moities-cp', slug: 'fiche-doubles-et-moities-cp', competence: K.doublesMoities, niveau: 'cp', reglages: { ops: [DOUBLES, MOITIES], nbFiche: 20 } },
    { id: 'doubles-moities-ce1', slug: 'fiche-doubles-et-moities-ce1', competence: K.doublesMoities, niveau: 'ce1', reglages: { ops: [DOUBLES, MOITIES], nbFiche: 30 } },
  ],
})
