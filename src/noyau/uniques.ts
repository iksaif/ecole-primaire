// Jamais deux fois la même question dans une partie ou sur une fiche. Pur (lisible par node) : le hasard vient de l'appelant.
//
//   const questions = tirerUniques(nb, i => question(niveau, reglages, rng))   // `i` : rang de la question à tirer
//
// Une question en double est tirée de nouveau (au plus `essais` fois en tout). Quand le réglage n'a pas assez de questions
// différentes (« additions jusqu'à 3 », 10 demandées), la liste est plus COURTE que demandé : un doublon serait pire qu'une
// partie plus courte. L'ordre de tirage reste celui de la graine, donc la fiche d'une graine ne change pas d'un appel à l'autre.

/** La clé qui dit que deux questions sont « la même » : leur contenu entier, par défaut. */
export const cleQuestion = (q: unknown): string => JSON.stringify(q)

export interface OptionsUniques<Q> {
  /** ce qui identifie une question (défaut : `cleQuestion`) ; à préciser quand des détails sans importance varient (ordre des propositions) */
  cle?: (q: Q) => string
  /** nombre maximal de tirages, doublons compris (défaut : 30 par question demandée) */
  essais?: number
}

/** `nb` questions toutes différentes (moins si le réglage n'en offre pas autant). `tirer(i)` : la question de rang `i`. */
export function tirerUniques<Q>(nb: number, tirer: (rang: number) => Q, { cle = cleQuestion, essais = nb * 30 }: OptionsUniques<Q> = {}): Q[] {
  const vues = new Set<string>()
  const questions: Q[] = []
  for (let tirages = 0; questions.length < nb && tirages < essais; tirages++) {
    const q = tirer(questions.length)
    const k = cle(q)
    if (vues.has(k)) continue
    vues.add(k)
    questions.push(q)
  }
  return questions
}

/** Les questions qui apparaissent plus d'une fois (leur clé), pour les tests. */
export function doublons<Q>(questions: readonly Q[], cle: (q: Q) => string = cleQuestion): string[] {
  const vues = new Set<string>()
  const rep = new Set<string>()
  for (const q of questions) { const k = cle(q); if (vues.has(k)) rep.add(k); vues.add(k) }
  return [...rep]
}
