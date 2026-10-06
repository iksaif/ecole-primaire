// Le contexte dans l'adresse : lecture et écriture des paramètres `classes`, `mode`, `reg`, `vue`, `refs` (plan 13).
// Pur (aucun import de Vue) : lisible par node. L'adresse est la source de vérité du contexte : une adresse partagée
// reconstruit la vue ; ce qu'elle ne dit pas vient des défauts passés par l'appelant (réglage mémorisé, puis site).
//   classes=ce1,ce2   mode=fr|bi|reg   reg=<code de langue>   vue=cartes|liste   refs=1|0
// Règles : une valeur invalide est ignorée (jamais d'exception) ; les classes sont triées de PS à CM2, sans doublon ;
// un paramètre égal au défaut n'est pas écrit (adresses courtes) ; `reg` n'est écrit que s'il y a plusieurs langues
// régionales possibles. Propriétés testées : lire(écrire(x)) = x, et écrire(lire(q)) normalise q.
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import type { Langue } from '../langues/registre.ts'
import { MODES, VUES } from './types.ts'
import type { Contexte, Mode, Vue } from './types.ts'

/** Les paramètres d'adresse qui portent le contexte. */
export const PARAMS_CONTEXTE = ['classes', 'mode', 'reg', 'vue', 'refs'] as const

/** Paramètres d'adresse tels que les donne vue-router (`route.query`) ou `Object.fromEntries(new URLSearchParams(…))`. */
export type QueryBrute = Readonly<Record<string, string | null | readonly (string | null)[] | undefined>>

/** Le contexte sans le profil : le profil est un réglage d'appareil, jamais une partie de l'adresse. */
export type ContexteAdresse = Omit<Contexte, 'profil'>

/** Ce qu'on retient quand l'adresse se tait : réglage mémorisé, à défaut valeurs du site. */
export interface DefautsContexte {
  /** classes par défaut (la dernière utilisée, sinon une classe de départ) ; `[]` : aucune, la classe est toujours écrite */
  readonly classes: readonly Classe[]
  readonly mode: Mode
  /** langue régionale quand le mode n'est pas `fr` (`null` : celle du site, sinon la première proposée) */
  readonly regionale: Langue | null
  /** langues régionales que le site propose (vide : le mode est toujours `fr`) */
  readonly languesRegionales: readonly Langue[]
  readonly vue: Vue
  readonly refs: boolean
}

/** Classe choisie quand rien d'autre ne l'est : ni l'adresse, ni un réglage mémorisé. */
export const CLASSE_DE_DEPART: Classe = 'ce1'

/** Code d'un mode dans l'adresse. */
const CODE_MODE: Readonly<Record<Mode, string>> = { fr: 'fr', bilingue: 'bi', regionale: 'reg' }

const premiere = (v: QueryBrute[string]): string | undefined => {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' ? x : undefined
}

/** Les classes valides d'une liste : sans doublon, de PS à CM2. Une valeur inconnue est ignorée. */
export function normaliserClasses(classes: readonly unknown[]): Classe[] {
  return NIVEAUX.filter(n => classes.includes(n))
}

const memesClasses = (a: readonly Classe[], b: readonly Classe[]): boolean => a.length === b.length && a.every((c, i) => c === b[i])

/** Langue régionale d'un mode : `null` en français seul ; sinon `reg` si le site la propose, la langue par défaut, la première proposée. */
function regionaleDe(mode: Mode, reg: string | undefined, d: DefautsContexte): Langue | null {
  if (mode === 'fr') return null
  return d.languesRegionales.find(l => l === reg) ?? d.regionale ?? d.languesRegionales[0] ?? null
}

/** Langue régionale quand l'adresse n'en dit rien : celle qu'on omet à l'écriture. */
const regionaleParDefaut = (d: DefautsContexte): Langue | null => d.regionale ?? d.languesRegionales[0] ?? null

/** Le contexte d'une adresse (`route.query`) ; ce que l'adresse ne dit pas, ou dit mal, vient des défauts. */
export function lireContexteDeLAdresse(query: QueryBrute, defauts: DefautsContexte): ContexteAdresse {
  const classes = normaliserClasses((premiere(query.classes) ?? '').toLowerCase().split(','))
  const demande = MODES.find(m => CODE_MODE[m] === premiere(query.mode))
  const mode = demande ?? defauts.mode
  const regionale = regionaleDe(mode, premiere(query.reg), defauts)
  const vue = VUES.find(v => v === premiere(query.vue)) ?? defauts.vue
  const refs = ({ '1': true, '0': false } as Readonly<Record<string, boolean | undefined>>)[premiere(query.refs) ?? ''] ?? defauts.refs
  return {
    classes: classes.length ? classes : defauts.classes.length ? defauts.classes : [CLASSE_DE_DEPART],
    // pas de langue régionale possible (site sans) : le français seul
    mode: regionale ? mode : 'fr',
    regionale,
    vue,
    refs,
  }
}

/** Les paramètres d'adresse d'un contexte, sans ceux qui valent le défaut : `{}` si tout est par défaut. */
export function ecrireContexteDansLAdresse(contexte: ContexteAdresse, defauts: DefautsContexte): Record<string, string> {
  const q: Record<string, string> = {}
  const classes = normaliserClasses(contexte.classes)
  if (classes.length && !memesClasses(classes, defauts.classes)) q.classes = classes.join(',')
  if (contexte.mode !== defauts.mode) q.mode = CODE_MODE[contexte.mode]
  if (contexte.mode !== 'fr' && contexte.regionale && defauts.languesRegionales.length > 1 && contexte.regionale !== regionaleParDefaut(defauts)) q.reg = contexte.regionale
  if (contexte.vue !== defauts.vue) q.vue = contexte.vue
  if (contexte.refs !== defauts.refs) q.refs = contexte.refs ? '1' : '0'
  return q
}

/** `mode` peut appartenir à autre chose que le contexte (`?mode=imprimer` d'un exercice) : seules nos valeurs sont les nôtres. */
const modeEstDuContexte = (v: QueryBrute[string]): boolean => MODES.some(m => CODE_MODE[m] === premiere(v))

/** Les paramètres de contexte (valides) d'une adresse, tels quels : ce qu'il faut reporter d'une page à la suivante. */
export function extraireParamsContexte(query: QueryBrute): Record<string, string> {
  const q: Record<string, string> = {}
  for (const k of PARAMS_CONTEXTE) {
    const v = premiere(query[k])
    if (v !== undefined && (k !== 'mode' || modeEstDuContexte(v))) q[k] = v
  }
  return q
}

/** Une adresse sans paramètre de contexte à elle ? (`mode=imprimer` n'en est pas un) */
export const sansContexte = (query: QueryBrute): boolean => Object.keys(extraireParamsContexte(query)).length === 0

/**
 * Remplace les paramètres de contexte d'une adresse par ceux de `contexteQuery` (sortie d'`ecrireContexteDansLAdresse`),
 * en gardant tout le reste (graine, mode=imprimer, état d'un tableau…). Un `mode` qui n'est pas du contexte n'est pas écrasé.
 */
export function fusionnerParamsContexte(query: QueryBrute, contexteQuery: Readonly<Record<string, string>>): Record<string, string | null | (string | null)[]> {
  const q: Record<string, string | null | (string | null)[]> = {}
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue
    const propre = (PARAMS_CONTEXTE as readonly string[]).includes(k) && (k !== 'mode' || modeEstDuContexte(v))
    if (!propre) q[k] = typeof v === 'string' || v === null ? v : [...v]
  }
  for (const [k, v] of Object.entries(contexteQuery)) if (!(k in q)) q[k] = v
  return q
}

/** Chaîne de requête lisible (`?classes=ce1,ce2`) : la virgule n'est pas encodée ; vide : `''`. */
export function chaineDeQuery(query: QueryBrute): string {
  const parties: string[] = []
  for (const [k, v] of Object.entries(query)) {
    for (const x of Array.isArray(v) ? v : [v]) {
      if (x === undefined) continue
      parties.push(x === null ? encodeURIComponent(k) : `${encodeURIComponent(k)}=${encodeURIComponent(x).replace(/%2C/gi, ',')}`)
    }
  }
  return parties.length ? `?${parties.join('&')}` : ''
}
