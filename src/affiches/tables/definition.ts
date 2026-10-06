// Les affiches des tables (reportées de `main`, src/impression/calcul.js et src/impression/affiches/tables.js) : les tables de
// multiplication et d'addition, toutes sur une page, une par page, ou en tableau à double entrée (Pythagore, tableau des additions).
// Programme (src/data/programme.ts) : tables de multiplication du CE1 au CM2 (« tables-multiplication ») ; tables d'addition du CP au
// CE2 (« tables-addition »), proposées au CP et au CE1. Les slugs publiés sont ceux de `main` (une variante par fiche) ; les
// variantes bretonnes sont `-br` (et non plus `-brezhoneg`).
// `operation` (« mul » ou « add ») et `disposition` (« toutes », « une », « grille ») sont des réglages de la VARIANTE que lit le dessin :
// l'élève choisit la variante, pas ces valeurs. `tables` : quelles tables montrer (toutes sur une page, ou une par page).
import { definirAffiche, cases } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

/** Marge et hauteur du titre (mm, agrandis en A3 par le cadre). */
export const MARGE = 12
export const H_TITRE = 14
/** Les tables proposées : de 1 à 10. */
export const PLAGE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

// quelles tables montrer (sur l'affiche « toutes les tables » et « une table par page » seulement)
const TABLES = cases(PLAGE)

const definition = definirAffiche({
  id: 'tables',
  domaine: D.nombresCalcul,
  // la carte du catalogue (l'emoji de l'ancienne entrée « Affiches des tables », src/data/activites.js)
  emoji: '🧮',
  // paysage par défaut ; une seule langue par feuille (une entrée de catalogue par langue)
  orientations: ['landscape', 'portrait'],
  langues: CODES,
  marge: MARGE,
  hTitre: H_TITRE,
  // chaque variante garde celles qui sont au programme de TOUTES ses classes
  competences: [K.tablesAddition, K.tablesMultiplication],
  formulaire: {
    visibleSi: { tables: { reglage: 'variante', dans: ['multiplication-a4', 'multiplication-a3', 'multiplication-une-par-page', 'addition'] } },
  },
  // une variante par fiche toute prête publiée (slugs de `main`) : `format` et `orientation` sont ceux de la fiche
  variantes: {
    'multiplication-a4': { classes: ['ce1', 'ce2', 'cm1', 'cm2'], slug: 'affiche-tables-de-multiplication-a4', format: 'A4', orientation: 'landscape',
      reglages: { operation: 'mul', disposition: 'toutes', tables: TABLES } },
    'multiplication-a3': { classes: ['ce1', 'ce2', 'cm1', 'cm2'], slug: 'affiche-tables-de-multiplication-a3', format: 'A3', orientation: 'landscape',
      reglages: { operation: 'mul', disposition: 'toutes', tables: TABLES } },
    'multiplication-une-par-page': { classes: ['ce1', 'ce2', 'cm1'], slug: 'affiches-une-table-de-multiplication-par-page', format: 'A4', orientation: 'portrait',
      reglages: { operation: 'mul', disposition: 'une', tables: TABLES } },
    pythagore: { classes: ['ce2', 'cm1', 'cm2'], slug: 'table-de-pythagore-multiplication', format: 'A4', orientation: 'portrait',
      reglages: { operation: 'mul', disposition: 'grille' } },
    addition: { classes: ['cp', 'ce1'], slug: 'affiche-tables-d-addition', format: 'A4', orientation: 'landscape',
      reglages: { operation: 'add', disposition: 'toutes', tables: TABLES } },
    'addition-tableau': { classes: ['cp', 'ce1'], slug: 'tableau-des-additions-0-a-10', format: 'A4', orientation: 'portrait',
      reglages: { operation: 'add', disposition: 'grille' } },
  },
})

export default definition
/** Les réglages que lit le dessin : ceux de la variante (operation, disposition, tables) et ceux de la feuille. */
export type Reglages = ReglagesDeAffiche<typeof definition>
