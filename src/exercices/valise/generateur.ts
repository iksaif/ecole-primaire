// La valise — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard vient
// de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes questions)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
// Trois sortes : « ajoute » (a objets, on en met b : combien ?), « retire » (t objets, on en enlève b : combien en reste-t-il ?) et « complete »
// (il en faut t, il y en a déjà a : combien en ajouter ?). Le nombre cherché est toujours entre 1 et le maximum de la classe.
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

/** Les objets mis dans la valise (leur nom est dans le catalogue de l'exercice « compter » : `objet.<id>`). */
export const OBJETS: readonly ObjetCollection[] = ['pomme', 'etoile', 'chat', 'fleur', 'voiture', 'papillon', 'grenouille', 'fraise']

/** Plus grand total par classe (programme : PS 3, voire 4 ; MS 6 ; GS 10). */
export const TOTAL_MAX: Readonly<Partial<Record<Classe, number>>> = { ps: 3, ms: 6, gs: 10 }
const totalMax = (niveau: Classe): number => TOTAL_MAX[niveau] ?? 0

/** Une proposition de réponse : le nombre (en chiffre, ou en points en PS). */
export interface Proposition { label: string, valeur: number }

/**
 * Une question. `a` : ce qui est dans la valise au départ (« ajoute »), ou déjà là (« complete ») ; `b` : ce qu'on ajoute ou enlève ;
 * `total` : le tout (ce qu'il en faut pour « complete », ce qu'il y a au départ pour « retire »). `reponse` : le nombre cherché.
 */
export interface Question {
  cle: string
  type: TypeQuestion
  objet: ObjetCollection
  emoji: NomEmoji
  a: number
  b: number
  total: number
  reponse: number
  /** MS-GS : ce qui est déjà dans la valise est caché (« ajoute » : on n'en voit que le nombre) ; PS : tout est visible */
  cache: boolean
  options: Proposition[]
  /** indice de la bonne proposition */
  bonne: number
}
export interface Reponse { choix: number }
/** Ce que tire la fiche : le niveau, comment l'enfant répond et les questions. */
export interface TirageFiche { niveau: Classe, reponse: Reglages['reponse'], questions: Question[] }

/** Les nombres de la question : a, b, total (« ajoute » : a + b ; « retire » : total − b ; « complete » : a + b = total). */
function nombres(type: TypeQuestion, max: number, rng: Rng): { a: number, b: number, total: number, reponse: number } {
  if (type === 'ajoute') {
    const total = rng.entier(2, max)
    const a = rng.entier(1, total - 1)
    return { a, b: total - a, total, reponse: total }
  }
  if (type === 'retire') {
    const total = rng.entier(2, max)
    const b = rng.entier(1, total - 1)
    return { a: total, b, total, reponse: total - b }
  }
  const total = rng.entier(2, max)
  const a = rng.entier(1, total - 1)
  return { a, b: total - a, total, reponse: total - a }
}

/** Les propositions : en PS 1, 2, 3 (en points) ; sinon la bonne et des nombres proches (de 1 au maximum), sans le nombre déjà là (`exclure`) qui est la erreur de lecture. */
function propositions(niveau: Classe, reponse: number, max: number, rng: Rng, exclure: number | null): Proposition[] {
  const proches = Array.from({ length: max }, (_, i) => i + 1).filter(n => n !== reponse && n !== exclure && Math.abs(n - reponse) <= 3)
  const valeurs = niveau === 'ps' ? [1, 2, 3] : rng.melanger([reponse, ...rng.melanger(proches).slice(0, 3)])
  return valeurs.map(v => ({ label: String(v), valeur: v }))
}

export function question(niveau: Classe, reglages: Reglages, rng: Rng): Question {
  const max = totalMax(niveau)
  const type = rng.choisir(reglages.types)
  const n = nombres(type, max, rng)
  const objet = rng.choisir(OBJETS)
  // « complete » : le nombre déjà là n'est pas proposé (compter ce qu'on voit donnerait une réponse fausse qui tente), sauf s'il est la réponse
  const options = propositions(niveau, n.reponse, max, rng, type === 'complete' && n.a !== n.reponse ? n.a : null)
  return { cle: `${type}:${objet}:${n.a}:${n.b}`, type, objet, emoji: EMOJI_OBJETS[objet], ...n, cache: niveau !== 'ps', options, bonne: options.findIndex(o => o.valeur === n.reponse) }
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
  const max = Math.max(0, ...qs.flatMap(q => [q.total, ...q.options.map(o => o.valeur)]))
  return max > nombreMax ? [`nombre ${max} > ${nombreMax} (nombreMax)`] : []
}
