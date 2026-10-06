// Ranger les nombres — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes questions)
//   verifier(q, rep)                              rep : { ordre: [nombres cliqués, dans l'ordre] }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type DEFINITION from './definition.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

// Plus grand nombre rangé, par niveau (programme : MS jusqu'à 6, GS jusqu'à 10)
export const NOMBRE_MAX: Readonly<Partial<Record<Classe, number>>> = { ms: 5, gs: 10 }

/** Dans quel sens ranger. */
export type Sens = 'croissant' | 'decroissant'
/**
 * Une question : `taille` nombres tirés entre 1 et le maximum du niveau, en désordre (`nombres`), et leur bon ordre (`bonne`).
 * `cle` : ce qui fait deux questions « la même » (le sens et les nombres dans l'ordre où on les voit).
 */
export interface Question { cle: string, nombres: number[], bonne: number[], sens: Sens }
/** La réponse de l'élève : les nombres touchés, dans l'ordre des touches. */
export interface Reponse { ordre: number[] }

export function question({ niveau, reglages, rng }: { niveau: Classe, reglages: Reglages, rng: Rng }): Question {
  const max = NOMBRE_MAX[niveau]
  if (max === undefined) throw new Error(`ranger : niveau « ${niveau} » inconnu`)
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  const choix = rng.melanger(pool).slice(0, reglages.taille)
  const sens: Sens = reglages.sens === 'mix' ? (rng() > 0.5 ? 'croissant' : 'decroissant') : reglages.sens
  const bonne = [...choix].sort((a, b) => (sens === 'croissant' ? a - b : b - a))
  const nombres = rng.melanger(choix)
  return { cle: `${sens}:${nombres.join('-')}`, nombres, bonne, sens }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] =>
  tirerUniques(nb, () => question({ niveau, reglages, rng }), { cle: q => q.cle })

export const questionsFiche = ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages>, 'nb'>): Question[] => questions({ niveau, reglages, rng, T })

export const verifier = (q: Question, rep: Reponse): Verdict => rep.ordre.join(',') === q.bonne.join(',')

export const bonneReponse = (q: Question): Reponse => ({ ordre: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ ordre: [...q.bonne].reverse() })

export function ecartsAuProgramme(questions: readonly Question[], contraintes: Contraintes): string[] {
  const nombreMax = contraintes.nombreMax ?? Infinity
  const max = Math.max(0, ...questions.flatMap(q => q.nombres))
  return max > nombreMax ? [`nombre ${max} > ${nombreMax} (nombreMax)`] : []
}
