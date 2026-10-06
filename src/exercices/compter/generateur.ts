// Compter les objets — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes questions)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { EMOJI_OBJETS } from '../../dessins/collections.ts'
import type { ObjetCollection } from '../../dessins/collections.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Les objets à compter (leur nom, au pluriel : `objet.<id>` du catalogue de contenu), dans l'ordre du tirage. */
export const OBJETS: readonly ObjetCollection[] = ['pomme', 'etoile', 'chat', 'fleur', 'voiture', 'papillon', 'grenouille', 'fraise', 'poisson', 'lune']

// Plus grand nombre compté (programme : PS 3, « voire 4 » pas systématique ; MS 6 ; GS 10)
export const NOMBRE_MAX: Readonly<Partial<Record<Classe, number>>> = { ps: 3, ms: 6, gs: 10 }
const maxDe = (niveau: Classe): number => {
  const max = NOMBRE_MAX[niveau]
  if (max === undefined) throw new Error(`compter : niveau « ${niveau} » inconnu`)
  return max
}

/** Une proposition de réponse : le nombre (affiché en chiffre, ou en points en PS). */
export interface Proposition { label: string, valeur: number }

/**
 * Une question : `nb` objets à compter et des propositions. PS : toujours 1, 2, 3 (affichés en points) ; sinon la bonne réponse et
 * jusqu'à 3 distracteurs proches (à 3 près), tirés parmi ceux qui existent. `cle` : ce qui fait deux questions « la même ».
 */
export interface Question {
  cle: string
  nb: number
  emoji: string
  objet: ObjetCollection
  choix: number[]
  reponse: number
  options: Proposition[]
  /** indice de la bonne proposition */
  bonne: number
}
/** La réponse de l'élève : l'indice de la proposition touchée. */
export interface Reponse { choix: number }
/** Ce que tire la fiche : le niveau, comment l'enfant répond (PS : toujours en entourant) et les questions. */
export interface TirageFiche { niveau: Classe, reponse: Reglages['reponse'], questions: Question[] }

export function question({ niveau, rng }: { niveau: Classe, rng: ParamsGenerateur<Reglages, Cle>['rng'] }): Question {
  const max = maxDe(niveau)
  const nb = rng.entier(1, max)
  const objet = OBJETS[rng.entier(0, OBJETS.length - 1)]
  let choix: number[]
  if (niveau === 'ps') choix = [1, 2, 3]
  else {
    const proches = rng.melanger(Array.from({ length: max }, (_, i) => i + 1).filter(d => d !== nb && Math.abs(d - nb) <= 3))
    choix = rng.melanger([nb, ...proches.slice(0, 3)])
  }
  return {
    cle: `${objet}${nb}`, nb, emoji: EMOJI_OBJETS[objet], objet, choix, reponse: nb,
    // propositions pour <ChoixReponses> : la valeur est le nombre (affichée en chiffre, ou en points en PS)
    options: choix.map(c => ({ label: String(c), valeur: c })), bonne: choix.indexOf(nb),
  }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question({ niveau, rng }), { cle: q => q.cle })

export const questionsFiche = ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche =>
  ({ niveau, reponse: reglages.reponse, questions: questions({ niveau, reglages, rng, T }) })

/** Le nom, au pluriel, de l'objet compté (« pommes »). */
export const nomObjet = (objet: ObjetCollection, T: Traducteur<Cle>): string => T(`objet.${objet}` as Cle)

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne

export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.choix.length })

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x : (x as TirageFiche).questions
  const nombreMax = contraintes.nombreMax ?? Infinity
  const max = Math.max(0, ...qs.flatMap(q => [q.nb, ...q.choix]))
  return max > nombreMax ? [`nombre ${max} > ${nombreMax} (nombreMax)`] : []
}
