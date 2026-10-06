// Calcul mental — générateur : QUOI poser comme calculs, et comment les corriger. Pur : aucun import de Vue, aucun
// Math.random (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
// Un SEUL générateur de calculs pour le jeu et pour toutes les fiches (bilan d'une classe, fiches par compétence, fiches
// « à la carte » publiées sous leurs adresses historiques) : les fiches ne diffèrent que par leurs réglages.
// L'ordre des tirages est celui de l'ancienne vue : mêmes calculs, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ConfigDe, ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import { contraintesDe } from '../../data/programme.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import DEFINITION, {
  COMPLEMENTS_10, COMPLEMENTS_100, DIZAINES, DOUBLES, FOIS, FOIS_10_100, MOINS, MOITIES, NEUF_ONZE, PASSAGE, PLUS, VERS_DIZAINE,
} from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Config = ConfigDe<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
/** Une opération proposée (valeur du réglage `ops`). */
export type Op = Reglages['ops'][number]

/**
 * Un calcul. `texte` : « 7 + 5 = ? » ou « 37 + ? = 40 » (le « ? » est la case à remplir) ; `attendu` : ce qu'on met dans la
 * case ; `trou` : le « ?» est au milieu du calcul (complément) et non à la fin.
 */
export interface Question { texte: string, attendu: number, op: Op, trou: boolean }
/** La réponse de l'élève : le nombre tapé. */
export interface Reponse { nombre: number }

type Plage = readonly [min: number, max: number]
/** Ce que chaque niveau demande (voir le programme en tête de definition.ts). */
interface Plan {
  add: Plage
  sou: Plage
  /** multiplication : les deux facteurs dans la plage, ou une table (réglage `tables`) × un facteur de 1 à `max` ; null : pas de × */
  mul: Plage | { max: number } | null
  div: Plage | { max: number } | null
  /** nombres dont on demande le double (les moitiés portent sur les doubles correspondants) */
  doubles: readonly number[]
  /** 'dizaines' (30 + ? = 100) ou 'quelconque' (37 + ? = 100) */
  c100: 'dizaines' | 'quelconque' | null
  /** plages des nombres multipliés par 10 et par 100 */
  x10: { x10: Plage, x100: Plage | null } | null
  /** borne max des calculs « stratégiques » (± dizaines, ± 9/11, passage et complément à la dizaine) */
  strat: number
  /** tables de × et ÷ quand le réglage ne les donne pas (le cycle 3 n'a pas de réglage) */
  tables?: readonly number[]
}

const plage = (min: number, max: number, pas = 1): number[] => { const t: number[] = []; for (let n = min; n <= max; n += pas) t.push(n); return t }

const PLANS: Partial<Record<Classe, Plan>> = {
  cp: { add: [1, 10], sou: [1, 10], mul: null, div: null, doubles: plage(1, 10), c100: null, x10: null, strat: 100 },
  // CE1 : pas de division (hors programme), tables de 2, 3, 4, 5 et 10 ; doubles et moitiés : les listes du programme
  ce1: {
    add: [1, 20], sou: [1, 20], mul: { max: 10 }, div: null,
    doubles: contraintesDe('ce1')?.doubles ?? [], c100: 'dizaines', x10: { x10: [1, 99], x100: null },   // × 100 : CE2
    strat: 100,
  },
  // CE2 : tables de 2 à 9, division = « combien de fois » dans les tables
  ce2: {
    add: [1, 99], sou: [1, 99], mul: { max: 10 }, div: { max: 10 },
    doubles: [...plage(1, 50), ...plage(60, 100, 10), ...plage(200, 500, 100)], c100: 'quelconque',
    x10: { x10: [1, 999], x100: [1, 99] }, strat: 1000,
  },
  cm1: {
    add: [1, 999], sou: [1, 999], mul: [2, 12], div: [1, 12],
    doubles: [...plage(1, 100), ...plage(110, 500, 10), ...plage(600, 1000, 100)], c100: 'quelconque',
    x10: { x10: [1, 999], x100: [1, 999] }, strat: 1000,
  },
  cm2: {
    add: [1, 999], sou: [1, 999], mul: [2, 25], div: [1, 25],
    doubles: [...plage(1, 100), ...plage(110, 500, 10), ...plage(600, 5000, 100)], c100: 'quelconque',
    x10: { x10: [1, 9999], x100: [1, 999] }, strat: 1000,
  },
}

/** Le plan d'un niveau de l'exercice (une classe hors de l'exercice est une erreur, jamais un repli silencieux). */
function planDe(niveau: Classe): Plan {
  const plan = PLANS[niveau]
  if (!plan) throw new Error(`calcul-mental : pas de plan pour le niveau « ${niveau} »`)
  return plan
}
const niveauConnu = (niveau: Classe): Classe => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

// Libellés : clés du catalogue de contenu ; « +, −, ×, ÷, ± 9 / ± 11 » s'affichent tels quels
const LIBELLES_OPS = {
  [COMPLEMENTS_10]: 'op_complements10',
  [COMPLEMENTS_100]: 'op_complements100',
  [VERS_DIZAINE]: 'op_versDizaine',
  [DIZAINES]: 'op_dizaines',
  [PASSAGE]: 'op_passage',
  [DOUBLES]: 'op_doubles',
  [MOITIES]: 'op_moities',
} as const satisfies Partial<Record<Op, Cle>>

/** Libellé d'une opération (boutons de réglage, en-tête de la fiche). Au CE1, « × 10 / × 100 » ne propose que × 10. */
export function libelleOp(op: Op, niveau: Classe, T: Traducteur<Cle>): string {
  if (op === FOIS_10_100 && PLANS[niveau]?.x10 && !PLANS[niveau]?.x10?.x100) return '× 10'
  return op in LIBELLES_OPS ? T(LIBELLES_OPS[op as keyof typeof LIBELLES_OPS]) : op
}

const estPlage = (p: Plage | { max: number }): p is Plage => Array.isArray(p)

type Calcul = Pick<Question, 'texte' | 'attendu' | 'trou'>

function complement(rng: Rng, total: number, a: number): Calcul {
  const b = total - a
  return rng.vrai(0.5)
    ? { texte: `${a} + ? = ${total}`, attendu: b, trou: true }
    : { texte: `? + ${b} = ${total}`, attendu: a, trou: true }
}
const resultat = (texte: string, attendu: number): Calcul => ({ texte, attendu, trou: false })

// Les réglages dont dépend le calcul d'une opération : les tables de × et ÷ (les plans de CE1 et CE2 n'ont pas de tables en dur)
function tablesDe(reglages: Config, plan: Plan): readonly number[] {
  const choisies = (reglages as Partial<Reglages>).tables
  return choisies?.length ? choisies : (plan.tables ?? [])
}

function calculer(plan: Plan, tables: readonly number[], op: Op, rng: Rng, T: Traducteur<Cle>): Calcul {
  if (op === COMPLEMENTS_10) return complement(rng, 10, rng.entier(1, 9))

  if (op === COMPLEMENTS_100) {
    const a = plan.c100 === 'dizaines' ? rng.entier(1, 9) * 10 : rng.entier(1, 99)
    return complement(rng, 100, a)
  }

  if (op === VERS_DIZAINE) {
    // 37 + ? = 40
    let a: number
    do { a = rng.entier(11, plan.strat - 1) } while (a % 10 === 0)
    const cible = Math.ceil(a / 10) * 10
    return { texte: `${a} + ? = ${cible}`, attendu: cible - a, trou: true }
  }

  if (op === DIZAINES) {
    // 45 + 30, 76 − 20 (nombre non rond ± dizaines entières)
    const N = plan.strat
    let a: number
    let d: number
    if (rng.vrai(0.5)) {
      do { a = rng.entier(11, N - 11) } while (a % 10 === 0)
      d = rng.entier(1, Math.min(9, Math.floor((N - 1 - a) / 10))) * 10
      return resultat(`${a} + ${d} = ?`, a + d)
    }
    do { a = rng.entier(21, N - 1) } while (a % 10 === 0)
    d = rng.entier(1, Math.min(9, Math.floor((a - 1) / 10))) * 10
    return resultat(`${a} − ${d} = ?`, a - d)
  }

  if (op === NEUF_ONZE) {
    const n = rng.vrai(0.5) ? 9 : 11
    const a = rng.entier(12, plan.strat - 12)
    return rng.vrai(0.5) ? resultat(`${a} + ${n} = ?`, a + n) : resultat(`${a} − ${n} = ?`, a - n)
  }

  if (op === PASSAGE) {
    // 47 + 6 (on dépasse la dizaine) ou 53 − 7 (on redescend sous la dizaine)
    const N = plan.strat
    let a: number
    let b: number
    if (rng.vrai(0.5)) {
      do { a = rng.entier(12, N - 10); b = rng.entier(2, 9) } while (a % 10 + b < 10 || a % 10 === 0)
      return resultat(`${a} + ${b} = ?`, a + b)
    }
    do { a = rng.entier(21, N - 1); b = rng.entier(2, 9) } while (a % 10 >= b)
    return resultat(`${a} − ${b} = ?`, a - b)
  }

  if (op === DOUBLES) {
    const n = rng.choisir(plan.doubles)
    return resultat(T('doubleDe', { n }), n * 2)
  }

  if (op === MOITIES) {
    const n = rng.choisir(plan.doubles)
    return resultat(T('moitieDe', { n: n * 2 }), n)
  }

  if (op === FOIS_10_100) {
    const x10 = plan.x10
    if (!x10) throw new Error('calcul-mental : « × 10 / × 100 » hors du plan de ce niveau')
    const fois100 = !!x10.x100 && rng.vrai(0.5)
    const [min, max] = (fois100 ? x10.x100 : x10.x10) as Plage
    const n = rng.entier(min, max)
    const m = fois100 ? 100 : 10
    return resultat(`${n} × ${m} = ?`, n * m)
  }

  let a: number
  let b: number
  let reponse: number
  if (op === PLUS) {
    a = rng.entier(...plan.add); b = rng.entier(...plan.add); reponse = a + b
  } else if (op === MOINS) {
    a = rng.entier(...plan.sou); b = rng.entier(1, a); reponse = a - b
  } else if (op === FOIS) {
    const mul = plan.mul
    if (mul && estPlage(mul)) {
      a = rng.entier(mul[0], mul[1]); b = rng.entier(mul[0], mul[1])
    } else if (mul) {
      // tables du niveau : un facteur dans les tables, l'autre de 1 à max, ordre aléatoire
      const t = rng.choisir(tables)
      const f = rng.entier(1, mul.max)
      ;[a, b] = rng.vrai(0.5) ? [t, f] : [f, t]
    } else throw new Error('calcul-mental : « × » hors du plan de ce niveau')
    reponse = a * b
  } else {
    const div = plan.div
    if (div && estPlage(div)) {
      b = rng.entier(div[0], div[1]); reponse = rng.entier(div[0], div[1])
    } else if (div) {
      // partages correspondant aux tables : 35 ÷ 5, 18 ÷ 3…
      b = rng.choisir(tables)
      reponse = rng.entier(1, div.max)
    } else throw new Error('calcul-mental : « ÷ » hors du plan de ce niveau')
    a = b * reponse
  }
  return resultat(`${a} ${op} ${b} = ?`, reponse)
}

/** Opérations choisies et proposées au niveau (une opération absente du niveau est ignorée ; « + » à défaut). */
export function opsDuNiveau(niveau: Classe, ops: readonly Op[] | undefined): Op[] {
  const offertes = (DEFINITION.niveaux[niveau]?.options?.ops ?? []) as readonly Op[]
  const choisies = (ops ?? []).filter(o => offertes.includes(o))
  return choisies.length ? choisies : [PLUS]
}

// `nb` calculs tous différents (même énoncé = même calcul) : moins si le réglage n'en offre pas autant (compléments à 10 : 18 calculs)
function calculs(niveau: Classe, reglages: Config, rng: Rng, T: Traducteur<Cle>, nb: number): Question[] {
  const plan = planDe(niveau)
  const ops = opsDuNiveau(niveau, reglages.ops)
  const tables = tablesDe(reglages, plan)
  return tirerUniques(nb, () => {
    const op = rng.choisir(ops)
    return { ...calculer(plan, tables, op, rng, T), op }
  }, { cle: q => q.texte, essais: nb * 50 })
}

/** Les questions du jeu (`nb` : le réglage nbQ), jamais deux fois le même calcul. */
export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  calculs(niveauConnu(niveau), reglages, rng, T, nb)

/** Les calculs de la fiche imprimable (réglage nbFiche) : les mêmes que ceux du jeu. */
export const questionsFiche = ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): Question[] =>
  calculs(niveauConnu(niveau), reglages, rng, T, reglages.nbFiche)

/** La réponse est juste si le nombre tapé est le nombre attendu. */
export const verifier = (q: Question, rep: Reponse): Verdict => Number.isFinite(rep.nombre) && rep.nombre === q.attendu

/** Une réponse juste, que `verifier` doit accepter (les tests le vérifient pour chaque question tirée). */
export const bonneReponse = (q: Question): Reponse => ({ nombre: q.attendu })

/** Une réponse fausse, que `verifier` doit refuser. */
export const mauvaiseReponse = (q: Question): Reponse => ({ nombre: q.attendu + 1 })

/**
 * Ce qui sort du programme du niveau : nombres en jeu et résultats ≤ calculMentalMax ; opérations du niveau ; doubles et
 * moitiés : les listes du programme (au CP et au CE1, où elles sont reprises telles quelles).
 */
export function ecartsAuProgramme(questions: Question[], contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  const offertes = (DEFINITION.niveaux[contraintes.niveau]?.options?.ops ?? []) as readonly Op[]
  const limite = contraintes.calculMentalMax ?? Infinity
  const nombre = (texte: string): number => Number(texte.replace(/\D/g, ''))
  for (const q of questions) {
    const max = Math.max(q.attendu, ...(q.texte.match(/\d+/g) ?? []).map(Number))
    if (max > limite) ecarts.push(`${q.texte} : ${max} > ${limite} (calculMentalMax)`)
    if (!offertes.includes(q.op)) ecarts.push(`${q.texte} : opération « ${q.op} » hors du niveau`)
    if (contraintes.niveau === 'cp' || contraintes.niveau === 'ce1') {
      if (q.op === DOUBLES && !contraintes.doubles?.includes(nombre(q.texte))) ecarts.push(`${q.texte} : double hors programme`)
      if (q.op === MOITIES && !contraintes.moities?.includes(nombre(q.texte))) ecarts.push(`${q.texte} : moitié hors programme`)
    }
  }
  return [...new Set(ecarts)]
}
