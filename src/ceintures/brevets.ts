// Les ceintures — les brevets papier : les questions d'une ceinture d'une piste fournie. Pur (le hasard vient de `rng`). Une piste sans brevet écrit
// (calcul mental, lettres : à venir) n'est pas dans PISTES_AVEC_BREVET.
// Tables : chaque ceinture dit ses tables (les mêmes que les objectifs de textes.ts) ; les deux dernières mêlent les sens (a × b, puis des divisions).
import type { Rng } from '../utils/hasard.ts'
import type { IdPiste } from './pistes.ts'

/** Une question de brevet : l'énoncé (« 8 × 7 = ») et sa réponse. */
export interface LigneBrevet { enonce: string, reponse: string }

/** Combien de ceintures a chaque piste avec brevet (une par groupe de tables). */
export const NB_CEINTURES_BREVET: Readonly<Record<'tables', number>> = { tables: 6 }

/** Au plus autant de questions que le réglage permet (30). */
export const MAX_QUESTIONS = 30

/** Les tables de chaque ceinture (la première : ×2, ×5, ×10 ; la dernière : toutes, avec des divisions). */
const TABLES_PAR_CEINTURE: readonly (readonly number[])[] = [
  [2, 5, 10], [3, 4], [6, 7], [8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
]
/** À partir de quelle ceinture (indice) une partie des questions sont des divisions. */
const DIVISIONS_DES = 4

/** Les questions de la ceinture `indice` des tables, mélangées, sans doublon (au plus MAX_QUESTIONS). */
function brevetTables(indice: number, rng: Rng): LigneBrevet[] {
  const tables = TABLES_PAR_CEINTURE[Math.min(indice, TABLES_PAR_CEINTURE.length - 1)]
  const calculs = tables.flatMap(a => Array.from({ length: 10 }, (_, i) => ({ a, b: i + 1 })))
  return rng.melanger(calculs).slice(0, MAX_QUESTIONS).map(({ a, b }, i) => {
    const division = indice >= DIVISIONS_DES && i % 2 === 1
    return division ? { enonce: `${a * b} ÷ ${a} =`, reponse: String(b) } : { enonce: `${a} × ${b} =`, reponse: String(a * b) }
  })
}

/** Les pistes dont le brevet est écrit (les autres : à venir). */
export const PISTES_AVEC_BREVET = ['tables'] as const satisfies readonly IdPiste[]
export type PisteAvecBrevet = (typeof PISTES_AVEC_BREVET)[number]

/** Les questions du brevet de la ceinture `indice` (0 pour la première) d'une piste. */
export function brevetDe(piste: PisteAvecBrevet, indice: number, rng: Rng): LigneBrevet[] {
  return brevetTables(indice, rng)
}
