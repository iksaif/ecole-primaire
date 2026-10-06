// Tables de multiplication — générateur : QUOI poser comme calculs, et comment les corriger. Pur : aucun import de Vue, aucun
// Math.random (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, selon reglages.mode, jamais deux fois la même :
//       'entrainement' : chaque table choisie, de 1 à `jusqu`, dans l'ordre (`premiere` : début d'une table) ;
//       'aleatoire'    : `nb` calculs tirés parmi ceux des tables choisies ;
//       'chrono'       : tous les calculs mélangés, une seule fois (le défi s'arrête à la dernière question ou au bout d'une minute)
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)  bonneReponse(q)             rep : le nombre tapé
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// L'ordre des tirages est celui de l'ancienne vue : mêmes calculs, mêmes fiches à graine égale (tests/instantanes).
import type { Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** Un calcul à répondre. `texte` et `attendu` : la question et sa bonne réponse en une ligne (tableau de correction) ; `cle` : ce qui en fait « le même » calcul. */
export interface Question { cle: string, a: number, b: number, texte: string, reponse: number, attendu: string, premiere?: boolean }
/** La réponse de l'élève : le nombre tapé. */
export type Reponse = number

const calcul = (a: number, b: number): Question => ({ cle: `${a}x${b}`, a, b, texte: `${a} × ${b} = ?`, reponse: a * b, attendu: String(a * b) })
const tousLesCalculs = (tables: readonly number[], jusqu: number): Question[] => tables.flatMap(a => Array.from({ length: jusqu }, (_, i) => calcul(a, i + 1)))

export function questions({ reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] {
  const { tables, jusqu, mode } = reglages
  if (mode === 'entrainement') {
    return tables.flatMap(a => Array.from({ length: jusqu }, (_, i) => ({ ...calcul(a, i + 1), premiere: i === 0 })))
  }
  // un seul mélange : chaque calcul au plus une fois (aléatoire : les `nb` premiers ; chrono : tous, le temps s'arrête avant la fin)
  const melanges = rng.melanger(tousLesCalculs(tables, jusqu))
  return mode === 'aleatoire' ? melanges.slice(0, nb) : melanges
}

/** Un calcul de la fiche, avec son résultat. */
export interface CalculFiche { a: number, b: number, r: number }
/** Ce que tire la fiche : les tables, jusqu'où, et les calculs (dans l'ordre ou mélangés). */
export interface TirageFiche { tables: number[], jusqu: number, questions: CalculFiche[] }

// Fiche : les calculs des tables choisies (dans l'ordre ou mélangés), tous ou `nbFiche` d'entre eux
export function questionsFiche({ reglages, rng }: Omit<ParamsGenerateur<Reglages>, 'nb'>): TirageFiche {
  const tables = [...reglages.tables].sort((a, b) => a - b)
  const jusqu = reglages.jusqu
  let tous: CalculFiche[] = []
  for (const a of tables) for (let i = 1; i <= jusqu; i++) tous.push({ a, b: i, r: a * i })
  const nb = reglages.nbFiche
  if (reglages.ordreFiche === 'melange') {
    tous = rng.melanger(tous)
    if (nb > 0) tous = tous.slice(0, nb)
  } else if (nb > 0 && nb < tous.length) {
    // dans l'ordre : on tire les calculs au hasard puis on les remet dans l'ordre des tables
    const choisis = new Set(rng.melanger(tous).slice(0, nb))
    tous = tous.filter(q => choisis.has(q))
  }
  return { tables, jusqu, questions: tous }
}

export const verifier = (q: Question, rep: Reponse): Verdict => Number.isFinite(rep) && rep === q.reponse
export const bonneReponse = (q: Question): Reponse => q.reponse
export const mauvaiseReponse = (q: Question): Reponse => q.reponse + 1

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs: readonly { a: number, b: number }[] = Array.isArray(x) ? x : (x as TirageFiche).questions
  const max = contraintes.facteurMax
  if (max === undefined) return []
  return [...new Set(qs.filter(q => q.a > max || q.b > max).map(q => `${q.a} × ${q.b} : facteur > ${max} (facteurMax)`))]
}
