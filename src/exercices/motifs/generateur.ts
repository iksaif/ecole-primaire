// Les motifs — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (5 frises en PS, sinon 6)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Les motifs eux-mêmes (types par niveau, suite) : motifs.ts, pur et testé. L'ordre des tirages est celui de l'ancienne vue.
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { TYPES_DU_NIVEAU, nbElements, questionMotif } from './motifs.ts'
import type { ModeMotif, QuestionMotif } from './motifs.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

// Éléments des frises : couleurs, formes et images (4 par thème : ABCD au plus)
export const THEMES: readonly (readonly string[])[] = [
  ['🔴', '🔵', '🟡', '🟢'], ['⭐', '🌙', '☀️', '☁️'], ['🍎', '🍌', '🍇', '🍓'],
  ['🐱', '🐶', '🐰', '🐻'], ['🟥', '🟦', '🟨', '🟩'], ['🌸', '🍀', '🍄', '🌻'],
]

/** Une proposition de réponse : l'élément (en emoji) et son indice dans la liste d'éléments de la question. */
export interface Proposition { label: string, valeur: number }

/**
 * Une question : le motif (indices dans `elements`), la place de la case « ? », l'élément attendu et les propositions.
 * PS : 2 choix (les deux éléments du motif) ; sinon les éléments du motif, complétés jusqu'à 3. `cle` : ce qui fait deux questions
 * « la même » (le motif, la case, et les éléments qu'on voit, quel que soit l'ordre des propositions).
 */
export interface Question extends QuestionMotif {
  cle: string
  elements: string[]
  /** indices des éléments proposés */
  choix: number[]
  options: Proposition[]
  /** indice de la bonne proposition */
  bonne: number
}
/** La réponse de l'élève : l'indice de la proposition touchée. */
export interface Reponse { choix: number }
/** Ce que tire la fiche : le niveau, le mode et les frises. */
export interface TirageFiche { niveau: Classe, mode: ModeMotif, questions: Question[] }

export function question({ niveau, mode, rng }: { niveau: Classe, mode: ModeMotif, rng: Rng }): Question {
  const m = questionMotif(niveau, mode, rng)
  const elements = rng.melanger(THEMES[rng.entier(0, THEMES.length - 1)])
  const dans = Array.from({ length: nbElements(m.type) }, (_, i) => i)
  const nb = niveau === 'ps' ? 2 : 3
  const choix = rng.melanger([...dans, ...[0, 1, 2, 3].filter(i => !dans.includes(i))].slice(0, Math.max(nb, dans.length)))
  const propositions = choix.includes(m.attendu) ? choix : [m.attendu, ...choix.slice(1)]
  const vus = elements.slice(0, dans.length).join('')
  return {
    ...m, cle: `${m.type}${m.place}${vus}/${propositions.map(c => elements[c]).sort().join('')}`, elements, choix: propositions,
    // propositions pour <ChoixReponses> (l'élément en emoji) ; bonne : indice de l'élément attendu
    options: propositions.map(c => ({ label: elements[c], valeur: c })), bonne: propositions.indexOf(m.attendu),
  }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question({ niveau, mode: reglages.mode, rng }), { cle: q => q.cle })

// Fiche : frises à continuer ; 5 en PS, 6 sinon (nbQ ne compte pas : une page de frises)
export const questionsFiche = ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche => ({
  niveau, mode: reglages.mode, questions: questions({ niveau, reglages, rng, T, nb: niveau === 'ps' ? 5 : 6 }),
})

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne

export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.choix.length })

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x : (x as TirageFiche).questions
  const permis = TYPES_DU_NIVEAU[contraintes.niveau] ?? []
  const ecarts = qs.filter(q => !permis.includes(q.type)).map(q => `motif ${q.type} hors programme du niveau`)
  if (contraintes.motifs === 'alternance') ecarts.push(...qs.filter(q => q.type !== 'AB').map(q => `motif ${q.type} : seule l'alternance AB est au programme`))
  return [...new Set(ecarts)]
}
