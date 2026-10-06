// Comparer les quantités — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun
// Math.random (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran (l'égalité est possible hors PS), jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (jamais d'égalité sur papier)
//   verifier(q, rep)                              rep : { choix: 'gauche' | 'droite' | 'egal' }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import { EMOJI_OBJETS } from '../../dessins/collections.ts'
import type { ObjetCollection } from '../../dessins/collections.ts'
import type DEFINITION from './definition.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** Les objets comparés, dans l'ordre du tirage (les mêmes dessins que « compter » : src/dessins/collections.ts). */
export const OBJETS: readonly ObjetCollection[] = ['pomme', 'etoile', 'chat', 'fleur', 'voiture', 'papillon', 'fraise', 'grenouille', 'poisson', 'lune', 'biscuit', 'ballon']

// Plus grand groupe : MS jusqu'à 5 (programme : 6), GS jusqu'à 10 ; PS : 10 aussi (rapport d'au moins 2)
export const NOMBRE_MAX: Readonly<Partial<Record<Classe, number>>> = { ps: 10, ms: 5, gs: 10 }

/** Le groupe qui en a le plus, ou « egal » (jamais en PS ni sur la fiche). */
export type Choix = 'gauche' | 'droite' | 'egal'
/** Deux groupes d'`emoji` ; `cle` : ce qui fait deux questions « la même » (les nombres, pas le dessin). */
export interface Question { cle: string, gauche: number, droite: number, emoji: string, reponse: Choix }
/** La réponse de l'élève : le groupe touché (ou « egal »). */
export interface Reponse { choix: Choix }

const emojiAuHasard = (rng: Rng): string => EMOJI_OBJETS[OBJETS[rng.entier(0, OBJETS.length - 1)]]

// PS : comparer « à vue » deux collections dont l'une a au moins deux fois plus d'objets, jusqu'à 10, sans égalité
// (programme.ts, contraintes PS : comparaisonGlobale)
function questionPS(rng: Rng): Omit<Question, 'cle'> {
  const petit = rng.entier(1, 4)
  const grand = rng.entier(Math.max(2 * petit, petit + 2), 10)
  const plusAGauche = rng.vrai(0.5)
  const emoji = emojiAuHasard(rng)
  return { gauche: plusAGauche ? grand : petit, droite: plusAGauche ? petit : grand, emoji, reponse: plusAGauche ? 'gauche' : 'droite' }
}

function questionAutre(niveau: Classe, rng: Rng): Omit<Question, 'cle'> {
  const max = NOMBRE_MAX[niveau]
  if (max === undefined) throw new Error(`comparer : niveau « ${niveau} » inconnu`)
  const gauche = rng.entier(1, max)
  const forceEgal = rng.vrai(0.2) // 20 % de chance d'être égal
  const droite = forceEgal ? gauche : rng.entier(1, max)
  const emoji = emojiAuHasard(rng)
  const reponse: Choix = gauche > droite ? 'gauche' : droite > gauche ? 'droite' : 'egal'
  return { gauche, droite, emoji, reponse }
}

export function question({ niveau, rng }: { niveau: Classe, rng: Rng }): Question {
  const q = niveau === 'ps' ? questionPS(rng) : questionAutre(niveau, rng)
  return { cle: `${q.gauche}-${q.droite}`, ...q }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] =>
  tirerUniques(nb, () => question({ niveau, rng }), { cle: q => q.cle })

// Fiche : on entoure le groupe qui a le plus, donc pas d'égalité (on retire jusqu'à en avoir une autre)
export const questionsFiche = ({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages>, 'nb'>): Question[] =>
  tirerUniques(reglages.nbQ, () => {
    let q: Question
    do { q = question({ niveau, rng }) } while (q.reponse === 'egal')
    return q
  }, { cle: q => q.cle })

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.reponse

export const bonneReponse = (q: Question): Reponse => ({ choix: q.reponse })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: q.reponse === 'gauche' ? 'droite' : 'gauche' })

export function ecartsAuProgramme(questions: readonly Question[], contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  for (const q of questions) {
    const [petit, grand] = [q.gauche, q.droite].sort((a, b) => a - b)
    if (contraintes.comparaisonGlobale) {
      const { rapportMin, max } = contraintes.comparaisonGlobale
      if (grand < rapportMin * petit || grand > max) ecarts.push(`${q.gauche} · ${q.droite} : rapport < ${rapportMin} ou > ${max}`)
    } else if (contraintes.nombreMax !== undefined && grand > contraintes.nombreMax) ecarts.push(`nombre ${grand} > ${contraintes.nombreMax} (nombreMax)`)
  }
  return ecarts
}
