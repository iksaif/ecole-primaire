// Les ceintures — les brevets papier : les questions d'une ceinture d'une piste fournie. Pur (le hasard vient de `rng`). Une piste sans brevet écrit
// (calcul mental, lettres : à venir) n'est pas dans PISTES_AVEC_BREVET.
// Tables : chaque ceinture dit ses tables (les mêmes que les objectifs de textes.ts) ; les deux dernières mêlent les sens (a × b, puis des divisions).
import type { Rng } from '../utils/hasard.ts'
import type { IdPiste } from './pistes.ts'

/** Une question de brevet : l'énoncé (« 8 × 7 = ») et sa réponse. */
export interface LigneBrevet { enonce: string, reponse: string }

/** Combien de ceintures a chaque piste avec brevet (une par groupe de tables). */
export const NB_CEINTURES_BREVET: Readonly<Record<'tables' | 'calcul-mental', number>> = { 'tables': 6, 'calcul-mental': 6 }

/** Au plus autant de questions que le réglage permet (30). */
export const MAX_QUESTIONS = 30

/** Les tables de chaque ceinture (la première : ×2, ×5, ×10 ; la dernière : toutes, avec des divisions). */
const TABLES_PAR_CEINTURE: readonly (readonly number[])[] = [
  [2, 5, 10], [3, 4], [6, 7], [8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
]
/** À partir de quelle ceinture (indice) une partie des questions sont des divisions. */
const DIVISIONS_DES = 4

/** Les options d'un brevet de tables (réglages de l'activité) : ses tables si on les choisit, les divisions, jusqu'où multiplier. */
export interface OptionsTables {
  /** `null` : les tables de la ceinture ; sinon celles qu'on a choisies */
  tables: readonly number[] | null
  /** `auto` : des divisions à partir des dernières ceintures ; `non` : jamais ; `oui` : une question sur deux */
  divisions: 'auto' | 'non' | 'oui'
  /** multiplier jusqu'à (10, ou 12 : bonus) */
  jusqu: number
}

export const OPTIONS_TABLES_DEFAUT: OptionsTables = { tables: null, divisions: 'auto', jusqu: 10 }

/** Les tables d'un brevet : celles que l'on a choisies, ou celles de la ceinture `indice`, dans l'ordre croissant. */
export function tablesDuBrevet(indice: number, options: OptionsTables): number[] {
  const choisies = options.tables?.length ? options.tables : TABLES_PAR_CEINTURE[Math.min(indice, TABLES_PAR_CEINTURE.length - 1)]
  return [...choisies].sort((a, b) => a - b)
}

/** Les questions de la ceinture `indice` des tables, mélangées, sans doublon (au plus MAX_QUESTIONS). */
function brevetTables(indice: number, rng: Rng, options: OptionsTables): LigneBrevet[] {
  const calculs = tablesDuBrevet(indice, options).flatMap(a => Array.from({ length: options.jusqu }, (_, i) => ({ a, b: i + 1 })))
  const avecDivisions = options.divisions === 'oui' || (options.divisions === 'auto' && indice >= DIVISIONS_DES)
  return rng.melanger(calculs).slice(0, MAX_QUESTIONS).map(({ a, b }, i) => {
    const division = avecDivisions && i % 2 === 1
    return division ? { enonce: `${a * b} ÷ ${a} =`, reponse: String(b) } : { enonce: `${a} × ${b} =`, reponse: String(a * b) }
  })
}

const SIGNE_MOINS = '−'

/** Des questions uniques : `fabriquer` est appelée jusqu'à en avoir `nb` différentes (ou après trop d'essais : le jeu est petit). */
function uniques(nb: number, fabriquer: () => LigneBrevet): LigneBrevet[] {
  const vues = new Map<string, LigneBrevet>()
  for (let essai = 0; vues.size < nb && essai < nb * 20; essai++) {
    const q = fabriquer()
    if (!vues.has(q.enonce)) vues.set(q.enonce, q)
  }
  return [...vues.values()]
}

/** Une famille de questions de calcul mental : de quoi fabriquer une question au hasard. */
type Famille = (rng: Rng) => LigneBrevet

const plusMoinsPetit: Famille = rng => {
  const pas = rng.choisir([1, 2, 10])
  const plus = rng.vrai(0.5)
  const a = plus ? rng.entier(11, 89) : rng.entier(pas + 1, 90)
  return plus ? { enonce: `${a} + ${pas} =`, reponse: String(a + pas) } : { enonce: `${a} ${SIGNE_MOINS} ${pas} =`, reponse: String(a - pas) }
}
const doublesMoities: Famille = rng => {
  if (rng.vrai(0.5)) { const a = rng.entier(2, 25); return { enonce: `${a} × 2 =`, reponse: String(a * 2) } }
  const moitie = rng.entier(2, 25)
  return { enonce: `${moitie * 2} ÷ 2 =`, reponse: String(moitie) }
}
const complements: Famille = rng => {
  if (rng.vrai(0.5)) { const a = rng.entier(1, 9); return { enonce: `${a} + … = 10`, reponse: String(10 - a) } }
  const a = rng.entier(1, 19) * 5
  return { enonce: `${a} + … = 100`, reponse: String(100 - a) }
}
const additionsDeTete: Famille = rng => {
  const a = rng.entier(12, 70)
  const b = rng.entier(3, 29)
  return rng.vrai(0.5) ? { enonce: `${a} + ${b} =`, reponse: String(a + b) } : { enonce: `${a + b} ${SIGNE_MOINS} ${b} =`, reponse: String(a) }
}
const fois10ou100: Famille = rng => {
  if (rng.vrai(0.5)) { const a = rng.entier(2, 99); return { enonce: `${a} × 10 =`, reponse: String(a * 10) } }
  const a = rng.entier(2, 20)
  return { enonce: `${a} × 100 =`, reponse: String(a * 100) }
}

/** Les familles de chaque ceinture du calcul mental ; la dernière mêle toutes les autres. */
const CALCUL_MENTAL_PAR_CEINTURE: readonly Famille[][] = [
  [plusMoinsPetit], [doublesMoities], [complements], [additionsDeTete], [fois10ou100],
  [plusMoinsPetit, doublesMoities, complements, additionsDeTete, fois10ou100],
]

/** Les questions de la ceinture `indice` du calcul mental : une famille par ceinture, la dernière les mêle toutes. */
function brevetCalculMental(indice: number, rng: Rng): LigneBrevet[] {
  const familles = CALCUL_MENTAL_PAR_CEINTURE[Math.min(indice, CALCUL_MENTAL_PAR_CEINTURE.length - 1)]
  return rng.melanger(uniques(MAX_QUESTIONS, () => rng.choisir(familles)(rng)))
}

/** Les pistes dont le brevet est écrit (les autres : à venir). */
export const PISTES_AVEC_BREVET = ['tables', 'calcul-mental'] as const satisfies readonly IdPiste[]
export type PisteAvecBrevet = (typeof PISTES_AVEC_BREVET)[number]

/** Les exercices du registre dont une piste a un brevet : leur page reçoit l'onglet « Ceintures » (et la piste de l'onglet est celle de l'exercice). */
export const EXERCICES_AVEC_BREVET: Readonly<Record<string, PisteAvecBrevet>> = { 'tables': 'tables', 'calcul-mental': 'calcul-mental' }

/** Les questions du brevet de la ceinture `indice` (0 pour la première) d'une piste ; `options` : celles de la piste des tables (les autres pistes n'en ont pas). */
export function brevetDe(piste: PisteAvecBrevet, indice: number, rng: Rng, options: OptionsTables = OPTIONS_TABLES_DEFAUT): LigneBrevet[] {
  if (piste === 'calcul-mental') return brevetCalculMental(indice, rng)
  return brevetTables(indice, rng, options)
}
