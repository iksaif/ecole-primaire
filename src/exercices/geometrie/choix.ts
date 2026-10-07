// La géométrie — une question à choix : les libellés proposés, la bonne réponse, les propositions pour <ChoixReponses> (pur).
import type { AvecChoix } from './types.ts'

/** Ajoute à la question ses propositions : `choix` (libellés), `reponse` (le bon libellé), `options` et `bonne` (indice). */
export function avecChoix<Q extends object>(q: Q, choix: string[], reponse: string): Q & AvecChoix {
  return { ...q, choix, reponse, options: choix.map(label => ({ label })), bonne: choix.indexOf(reponse) }
}
