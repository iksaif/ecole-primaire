// Quiz — la forme d'une banque de questions (fr.ts, br.ts).
import type { Theme } from '../donnees.ts'

/** Une question : l'énoncé, la bonne réponse (parmi `choix`), les propositions, et ce qu'on apprend après une erreur. */
export interface QuestionBanque { q: string, bonne: string, choix: readonly string[], info?: string }
/** Les questions d'une langue, par thème (un thème peut manquer dans une traduction : ses questions restent en français). */
export type Banque = Readonly<Partial<Record<Theme, readonly QuestionBanque[]>>>
