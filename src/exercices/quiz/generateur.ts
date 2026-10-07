// Quiz — générateur : des questions du thème, toutes différentes, avec leurs propositions mélangées. Pur : le hasard vient de `rng`.
//   questions({ reglages, rng, nb, langue })   une partie ; questionsFiche({ reglages, rng, langue }) : la fiche (questions à entourer)
//   verifier(q, rep)                           rep : { choix } (indice de la proposition touchée)
// La banque dépend de la langue du contenu (`langue` : une question non traduite n'existe qu'en français), pas de T.
import type { Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import { questionsDuTheme } from './donnees.ts'
import type { Theme } from './donnees.ts'
import type { QuestionBanque } from './questions/types.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** Une question : l'énoncé, les propositions (mélangées), la bonne (indice et texte), et ce qu'on apprend après une erreur. */
export interface Question { cle: string, theme: Theme, texte: string, options: { label: string }[], bonne: number, attendu: string, info: string }
export interface Reponse { choix: number }
export interface TirageFiche { theme: Theme, questions: Question[] }

function question(rng: Rng, theme: Theme, q: QuestionBanque): Question {
  const choix = rng.melanger([...q.choix])
  return { cle: q.q, theme, texte: q.q, options: choix.map(label => ({ label })), bonne: choix.indexOf(q.bonne), attendu: q.bonne, info: q.info ?? '' }
}

/** `nb` questions du thème, toutes différentes (moins si le thème n'en a pas assez dans cette langue). */
function tirer(theme: Theme, rng: Rng, nb: number, langue?: string): Question[] {
  return rng.melanger([...questionsDuTheme(theme, langue)]).slice(0, nb).map(q => question(rng, theme, q))
}

export function questions({ reglages, rng, nb = reglages.nb, langue }: ParamsGenerateur<Reglages>): Question[] {
  return tirer(reglages.theme, rng, nb, langue)
}

export function questionsFiche({ reglages, rng, langue }: Omit<ParamsGenerateur<Reglages>, 'nb'>): TirageFiche {
  return { theme: reglages.theme, questions: tirer(reglages.theme, rng, reglages.nb, langue) }
}

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne
export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.options.length })

/** Programme : le thème est choisi parmi ceux de la classe (definition.ts) ; chaque question a sa bonne réponse parmi les propositions. */
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, _contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x as readonly Question[] : (x as TirageFiche).questions
  if (!qs.length) return ['aucune question']
  return qs.filter(q => q.bonne < 0).map(q => `« ${q.texte} » : la bonne réponse n'est pas parmi les propositions`)
}
