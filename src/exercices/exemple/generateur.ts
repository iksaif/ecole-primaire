// Exemple d'exercice — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue,
// aucun Math.random (le hasard vient de `rng`, fourni par l'appelant), donc lisible par node et par les tests.
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ConfigDe, ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'

// Le type des réglages vient de la définition : le changer là change ici, et une faute de frappe ne compile pas.
type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Config = ConfigDe<typeof DEFINITION>

// Une question est l'une des formes de l'union, reconnue à `type`. Ajouter une forme fait échouer la compilation de
// chaque `switch (q.type)` qui l'oublie (verifier, fiche, corrigé) : on ne peut pas l'oublier en silence.
// `texte` : la question en une ligne, pour le tableau de correction de fin de partie (avec `attendu`)
interface Suite { termes: number[], pas: number, texte: string }
export type Question = Suite & (
  | { type: 'complete', trou: number, attendu: number }   // trouver le terme manquant
  | { type: 'regle', attendu: number }                    // trouver le pas
)
/** La réponse de l'élève, dans la forme que `verifier` attend (la vue la construit). */
export interface Reponse { nombre: number }

const LONGUEUR = 5          // termes affichés
const NB_FICHE = 8          // suites sur une fiche
// Plus grand nombre de la suite, par niveau. Le test l'oppose au programme (ecartsAuProgramme) : une erreur ici se voit.
const PLAFOND: Record<string, number> = { cp: 100, ce1: 1000, ce2: 10000 }

function question(niveau: Classe, reglages: Config, rng: ParamsGenerateur<Reglages>['rng']): Question {
  // Toujours tirer dans le même ordre : même graine, mêmes questions, donc même fiche (instantanés).
  const pas = rng.choisir(reglages.pas)   // plusieurs pas cochés : un par question
  const descend = rng.choisir(reglages.sens) === 'descend'
  const type = rng.choisir(reglages.exercices)
  const base = pas >= 10 ? 10 : 1                                   // compter de 10 en 10 : départ « rond »
  const premierMax = Math.max(0, PLAFOND[niveau] - pas * (LONGUEUR - 1))   // pas trop grand : on part de 0
  const depart = rng.entier(0, Math.floor(premierMax / base)) * base
  const montante = Array.from({ length: LONGUEUR }, (_, i) => depart + i * pas)
  const termes = descend ? montante.reverse() : montante

  switch (type) {
    case 'complete': {
      const trou = rng.entier(1, LONGUEUR - 1)   // jamais le premier terme : il faut deux termes pour deviner le pas
      return { type, termes, pas, trou, attendu: termes[trou], texte: termes.map((n, i) => (i === trou ? '…' : n)).join(' ; ') }
    }
    case 'regle':
      return { type, termes, pas, attendu: pas, texte: termes.join(' ; ') }
  }
}

/** Les questions de l'exercice à l'écran. `nb` : le réglage nbQ, sauf si l'appelant en veut un autre. */
export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] =>
  Array.from({ length: nb }, () => question(niveau, reglages, rng))

/** Ce que tire la fiche imprimable : les mêmes questions, en nombre fixe (fiche.ts les met en page). */
export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages>, 'nb'>): Question[] => questions({ ...p, nb: NB_FICHE })

/**
 * Verdict : un booléen, ou { ok, nuance } quand la réponse est « presque » juste. useJeu affiche alors le message de
 * la nuance et la question passe en orange (il faudra un `messageNuance` dans la vue).
 */
export function verifier(q: Question, rep: Reponse): Verdict {
  switch (q.type) {
    case 'complete':
      if (rep.nombre === q.attendu) return true
      // un pas de trop ou de moins : l'élève a bien compris la règle, il s'est trompé de cran
      return Math.abs(rep.nombre - q.attendu) === q.pas ? { ok: false, nuance: 'un-pas' } : false
    case 'regle':
      return rep.nombre === q.attendu
  }
}

/** Une réponse juste, que `verifier` doit accepter (les tests le vérifient pour chaque question tirée). */
export const bonneReponse = (q: Question): Reponse => ({ nombre: q.attendu })

/** Ce qui sort du programme du niveau, [] si tout y est. Les tests l'appellent sur toutes les questions tirées. */
export function ecartsAuProgramme(questions: Question[], contraintes: Contraintes): string[] {
  const max = Math.max(0, ...questions.flatMap(q => q.termes))
  const limite = contraintes.nombreMax ?? Infinity
  return max > limite ? [`nombre ${max} > ${limite} (nombreMax)`] : []
}
