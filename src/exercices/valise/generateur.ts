// La valise — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard vient de
// `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes questions)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
// Un problème est une bande en trois images : un état de départ, une transformation (on met ou on enlève des objets) et un état d'arrivée ;
// l'un des trois est inconnu (c'est la valise fermée, marquée « ? ») et c'est ce que l'enfant trouve. Quatre sortes, d'après Eduscol :
//   ajoute    départ a, on met b, arrivée ?        retire   départ t, on enlève b, arrivée ?
//   complete  départ a, on met ?, arrivée t        initial  départ ?, on met ou enlève b, arrivée n
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { EMOJI_OBJETS } from '../../dessins/collections.ts'
import type { ObjetCollection } from '../../dessins/collections.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Rng } from '../../utils/hasard.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
export type TypeQuestion = Reglages['types'][number]

/** Les objets mis dans la valise : des images de l'exercice « compter ». */
export const OBJETS: readonly ObjetCollection[] = ['pomme', 'etoile', 'chat', 'fleur', 'voiture', 'papillon', 'grenouille', 'fraise']

/** Plus grand nombre de la bande par classe (programme : PS 3, voire 4 ; MS 6 ; GS 10). */
export const TOTAL_MAX: Readonly<Partial<Record<Classe, number>>> = { ps: 3, ms: 6, gs: 10 }
const totalMax = (niveau: Classe): number => TOTAL_MAX[niveau] ?? 0

/** Une proposition de réponse : le nombre (en chiffre, ou en points en PS). */
export interface Proposition { label: string, valeur: number }

/**
 * Une question : la bande en trois images. `depart` et `arrivee` : le nombre d'objets avant et après (null : la valise fermée, inconnu) ; `change` :
 * ce qu'on met ou enlève (null : inconnu, « combien en mettre ? ») ; `signe` : « + » (on met) ou « − » (on enlève). `reponse` : le nombre cherché.
 */
export interface Question {
  cle: string
  type: TypeQuestion
  objet: ObjetCollection
  emoji: NomEmoji
  depart: number | null
  change: number | null
  arrivee: number | null
  signe: '+' | '-'
  reponse: number
  options: Proposition[]
  /** indice de la bonne proposition */
  bonne: number
}
export interface Reponse { choix: number }
/** Ce que tire la fiche : le niveau, comment l'enfant répond et les questions. */
export interface TirageFiche { niveau: Classe, reponse: Reglages['reponse'], questions: Question[] }

type Bande = Pick<Question, 'depart' | 'change' | 'arrivee' | 'signe' | 'reponse'>

/** Les nombres de la bande d'une sorte de problème (tous entre 1 et `max`, le total jamais au-dessus). */
function bande(type: TypeQuestion, max: number, rng: Rng): Bande {
  if (type === 'ajoute') {
    const total = rng.entier(2, max)
    const a = rng.entier(1, total - 1)
    return { depart: a, change: total - a, arrivee: null, signe: '+', reponse: total }
  }
  if (type === 'retire') {
    const total = rng.entier(2, max)
    const b = rng.entier(1, total - 1)
    return { depart: total, change: b, arrivee: null, signe: '-', reponse: total - b }
  }
  if (type === 'complete') {
    const total = rng.entier(2, max)
    const a = rng.entier(1, total - 1)
    return { depart: a, change: null, arrivee: total, signe: '+', reponse: total - a }
  }
  // initial : on cherche ce qu'il y avait avant ; on a enlevé b et il reste n (départ n + b ≤ max), ou mis b et il y a n (départ n − b ≥ 1)
  if (rng.entier(0, 1) === 0) {
    const n = rng.entier(1, max - 1)
    const b = rng.entier(1, max - n)
    return { depart: null, change: b, arrivee: n, signe: '-', reponse: n + b }
  }
  const n = rng.entier(2, max)
  const b = rng.entier(1, n - 1)
  return { depart: null, change: b, arrivee: n, signe: '+', reponse: n - b }
}

/** Les propositions : en PS 1, 2, 3 (en points) ; sinon la bonne et des nombres proches (de 1 au maximum). */
function propositions(niveau: Classe, reponse: number, max: number, rng: Rng): Proposition[] {
  const proches = Array.from({ length: max }, (_, i) => i + 1).filter(n => n !== reponse && Math.abs(n - reponse) <= 3)
  const valeurs = niveau === 'ps' ? [1, 2, 3] : rng.melanger([reponse, ...rng.melanger(proches).slice(0, 3)])
  return valeurs.map(v => ({ label: String(v), valeur: v }))
}

export function question(niveau: Classe, reglages: Reglages, rng: Rng): Question {
  const max = totalMax(niveau)
  const type = rng.choisir(reglages.types)
  const b = bande(type, max, rng)
  const objet = rng.choisir(OBJETS)
  const options = propositions(niveau, b.reponse, max, rng)
  return { cle: `${type}:${objet}:${b.depart}:${b.change}:${b.arrivee}:${b.signe}`, type, objet, emoji: EMOJI_OBJETS[objet], ...b, options, bonne: options.findIndex(o => o.valeur === b.reponse) }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question(niveau, reglages, rng), { cle: q => q.cle })

export const questionsFiche = ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche =>
  ({ niveau, reponse: reglages.reponse, questions: questions({ niveau, reglages, rng, T }) })

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne
export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.options.length })

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs: readonly Question[] = Array.isArray(x) ? x : (x as TirageFiche).questions
  const nombreMax = contraintes.nombreMax ?? Infinity
  const nombres = qs.flatMap(q => [q.depart ?? 0, q.arrivee ?? 0, q.change ?? 0, q.reponse, ...q.options.map(o => o.valeur)])
  const max = Math.max(0, ...nombres)
  return max > nombreMax ? [`nombre ${max} > ${nombreMax} (nombreMax)`] : []
}
