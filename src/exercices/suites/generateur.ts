// Suites de nombres — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun
// Math.random (le hasard vient de `rng`).
//   poursuivre : quatre termes, donner le suivant ; complete : un terme manquant au milieu ; regle : trouver le pas.
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ConfigDe, ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import { contraintesDe } from '../../data/programme.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'
import type { Rng } from '../../utils/hasard.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Config = ConfigDe<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

// Une question est l'une des formes de l'union, reconnue à `type`. `trous` : rangs des termes à écrire (un à l'écran, un ou deux
// sur la fiche) ; `attendus` : leurs valeurs ; `texte` : la question en une ligne, pour le tableau de correction.
interface Suite { termes: number[], pas: number, texte: string }
export type Question = Suite & (
  | { type: 'poursuivre' | 'complete', trous: number[], attendus: number[], attendu: number }
  | { type: 'regle', attendu: number }
)
/** La réponse de l'élève, dans la forme que `verifier` attend (la vue la construit). */
export interface Reponse { nombre: number }

const LONGUEUR = 6          // termes d'une suite « à trous » ou « trouver le pas »
const MONTRES = 4           // termes donnés quand on poursuit une suite
const NB_TROUS_FICHE = 2    // cases à remplir par suite sur une fiche (une seule à l'écran)

// Un départ « rond » selon le pas : de 25 en 25, on part d'un multiple de 25 ; de 10 en 10, de 100 en 100, un nombre quelconque.
const GRANULARITE: Record<number, number> = { 2: 1, 5: 5, 10: 1, 25: 25, 50: 50, 100: 1, 250: 250, 500: 500, 1000: 1 }
// Plus grand départ possible selon le pas (au-delà, la suite devient trop longue à compter)
const DEPART_MAX: Record<number, number> = { 2: 30, 5: 70, 10: 140, 25: 300, 50: 600, 100: 600, 250: 1500, 500: 3000, 1000: 6000 }

const enLigne = (termes: number[], trous: number[]): string => termes.map((n, i) => (trous.includes(i) ? '…' : n)).join(' ; ')

// Les termes d'une suite d'`n` termes de pas `pas`, croissante ou décroissante, dans le champ numérique du niveau.
function termesDe(n: number, pas: number, descend: boolean, limite: number, rng: Rng): number[] {
  const max = Math.max(0, Math.min(DEPART_MAX[pas] ?? 0, limite - (LONGUEUR - 1) * pas))
  const grain = GRANULARITE[pas] ?? 1
  const depart = rng.entier(0, Math.floor(max / grain)) * grain
  const montante = Array.from({ length: n }, (_, i) => depart + i * pas)
  return descend ? montante.reverse() : montante
}

// Deux premiers termes donnés (pour voir le pas), puis `nbTrous` cases parmi les quatre suivants
const trousAuMilieu = (nbTrous: number, rng: Rng): number[] => rng.melanger([2, 3, 4, 5]).slice(0, nbTrous).sort((a, b) => a - b)

function question(niveau: Classe, reglages: Config, rng: Rng, nbTrous: number): Question {
  // Toujours tirer dans le même ordre : même graine, mêmes questions, donc même fiche (instantanés).
  const pas = rng.choisir(reglages.pas)   // plusieurs pas cochés : un par question
  const descend = rng.choisir(reglages.sens) === 'descend'
  const type = rng.choisir(reglages.exercices)
  const limite = contraintesDe(niveau)?.nombreMax ?? Infinity

  switch (type) {
    case 'poursuivre': {
      const termes = termesDe(MONTRES + nbTrous, pas, descend, limite, rng)
      const trous = termes.map((_, i) => i).slice(MONTRES)
      return { type, termes, pas, trous, attendus: trous.map(i => termes[i]), attendu: termes[MONTRES], texte: enLigne(termes, trous) }
    }
    case 'complete': {
      const termes = termesDe(LONGUEUR, pas, descend, limite, rng)
      const trous = trousAuMilieu(nbTrous, rng)
      return { type, termes, pas, trous, attendus: trous.map(i => termes[i]), attendu: termes[trous[0]], texte: enLigne(termes, trous) }
    }
    case 'regle': {
      const termes = termesDe(LONGUEUR, pas, descend, limite, rng)
      return { type, termes, pas, attendu: pas, texte: termes.join(' ; ') }
    }
  }
}

/** Les questions de l'exercice à l'écran : un terme à trouver par suite. `nb` : le réglage nbQ, sauf si l'appelant en veut un autre. */
export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question(niveau, reglages, rng, 1))   // jamais deux fois la même question (noyau/uniques.ts)

/** Ce que tire la fiche : les mêmes suites, avec deux cases chacune, en nombre fixé par le réglage nbFiche. */
export const questionsFiche = ({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): Question[] =>
  tirerUniques(reglages.nbFiche, () => question(niveau, reglages, rng, NB_TROUS_FICHE))

/**
 * Verdict : un booléen, ou { ok, nuance } quand la réponse est « presque » juste (un pas de trop ou de moins : l'élève a compris
 * la règle, il s'est trompé de cran).
 */
export function verifier(q: Question, rep: Reponse): Verdict {
  if (rep.nombre === q.attendu) return true
  return q.type !== 'regle' && Math.abs(rep.nombre - q.attendu) === q.pas ? { ok: false, nuance: 'un-pas' } : false
}

/** Une réponse juste, que `verifier` doit accepter (les tests le vérifient pour chaque question tirée). */
export const bonneReponse = (q: Question): Reponse => ({ nombre: q.attendu })

/** Une réponse fausse, que `verifier` doit refuser (les tests le vérifient pour chaque question tirée). */
export const mauvaiseReponse = (q: Question): Reponse => ({ nombre: q.attendu + (q.type === 'regle' ? 1 : 7 * q.pas) })

/** Ce qui sort du programme du niveau, [] si tout y est. Les tests l'appellent sur toutes les questions tirées. */
export function ecartsAuProgramme(questions: Question[], contraintes: Contraintes): string[] {
  const max = Math.max(0, ...questions.flatMap(q => q.termes))
  const limite = contraintes.nombreMax ?? Infinity
  return max > limite ? [`nombre ${max} > ${limite} (nombreMax)`] : []
}
