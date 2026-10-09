// Plus long, plus court — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun
// Math.random (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (4 séries à ranger, sinon 6)
//   verifier(q, rep)                              rep : { choix: crayon touché } (comparer) ou { ordre: [crayons touchés] } (ranger)
//   bonPrefixe(q, ordre)                          les crayons touchés jusqu'ici sont-ils dans le bon ordre ? (ranger)
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(questions, contraintes)
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type DEFINITION from './definition.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
export type Mode = Reglages['mode']

/** PS : longueurs très différentes (rapport ≥ 2), 3 objets ; MS : écarts plus petits, 4 ; GS : écarts fins, 5. */
export const NIVEAUX_LONG: Readonly<Partial<Record<Classe, { rapport: number, nb: number }>>> = { ps: { rapport: 2, nb: 3 }, ms: { rapport: 1.35, nb: 4 }, gs: { rapport: 1.15, nb: 5 } }
/** Longueur maximale d'un crayon, en unités du dessin (src/dessins n'a pas de crayon : un seul dessin, dans la vue et la fiche). */
export const LARGEUR = 300
const COULEURS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e91e8c']

export interface Crayon { longueur: number, couleur: string }
/** `cle` : les longueurs dans l'ordre d'affichage et ce qu'on cherche (deux questions identiques ont la même clé). */
export interface Question { cle: string, mode: Mode, crayons: Crayon[], cherche: 'long' | 'court' }
/** Comparer : le crayon touché ; ranger : les crayons touchés, dans l'ordre des clics. */
export type Reponse = { choix: number } | { ordre: number[] }
/** Ce que tire la fiche : ranger (MS, GS) ou entourer. */
export interface Tirage { niveau: Classe, ranger: boolean, questions: Question[] }

function donneesDe(niveau: Classe): { rapport: number, nb: number } {
  const d = NIVEAUX_LONG[niveau]
  if (!d) throw new Error(`longueurs : niveau « ${niveau} » inconnu`)
  return d
}

// longueurs croissantes, chacune au moins `rapport` fois la précédente (en partant de 55 sur 300)
function longueurs(n: number, rapport: number, rng: Rng): number[] {
  const res = [55 + rng.entier(0, 19)]
  while (res.length < n) res.push(Math.min(LARGEUR - 4, Math.ceil(res[res.length - 1] * rapport) + rng.entier(0, 14)))
  return res
}

/** Indices des crayons du plus court au plus long. */
export const rangsAttendus = (q: Question): number[] => [...q.crayons.keys()].sort((a, b) => q.crayons[a].longueur - q.crayons[b].longueur)
/** Crayon attendu quand on compare deux crayons. */
export const attendu = (q: Question): number => rangsAttendus(q)[q.cherche === 'long' ? q.crayons.length - 1 : 0]

export function question({ niveau, mode, rng }: { niveau: Classe, mode: Mode, rng: Rng }): Question {
  const { rapport, nb } = donneesDe(niveau)
  // le nombre de crayons de la classe (« MS — 4 crayons », « GS — 5 crayons »), pour ranger comme pour trouver le plus long ou le plus court ;
  // en PS, on compare deux crayons très différents
  const n = mode === 'ranger' || niveau !== 'ps' ? nb : 2
  const couleurs = rng.melanger(COULEURS)
  const crayons = rng.melanger(longueurs(n, n === 2 ? rapport : Math.min(rapport, 1.3), rng).map((longueur, i) => ({ longueur, couleur: couleurs[i] })))
  const cherche = rng.vrai(0.5) ? 'long' : 'court'
  return { cle: `${crayons.map(c => c.longueur).join('-')}/${cherche}`, mode, crayons, cherche }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] =>
  tirerUniques(nb, () => question({ niveau, mode: reglages.mode, rng }), { cle: q => q.cle })

// Fiche : entourer le plus long (ou le plus court) ; MS et GS : numéroter du plus court au plus long. PS : toujours le plus long.
export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages>, 'nb'>): Tirage {
  const ranger = reglages.mode === 'ranger' && niveau !== 'ps'
  const qs = tirerUniques(ranger ? 4 : 6, () => {
    const q = question({ niveau, mode: reglages.mode, rng })
    if (niveau !== 'ps') return q
    return { ...q, cherche: 'long' as const, cle: `${q.crayons.map(c => c.longueur).join('-')}/long` }
  }, { cle: q => q.cle })
  return { niveau, ranger, questions: qs }
}

export const bonPrefixe = (q: Question, ordre: readonly number[]): boolean => ordre.every((c, i) => c === rangsAttendus(q)[i])

export function verifier(q: Question, rep: Reponse): Verdict {
  if (q.mode === 'ranger') return 'ordre' in rep && rep.ordre.length === q.crayons.length && bonPrefixe(q, rep.ordre)
  return 'choix' in rep && rep.choix === attendu(q)
}

export const bonneReponse = (q: Question): Reponse => (q.mode === 'ranger' ? { ordre: rangsAttendus(q) } : { choix: attendu(q) })
export const mauvaiseReponse = (q: Question): Reponse =>
  (q.mode === 'ranger' ? { ordre: [...rangsAttendus(q)].reverse() } : { choix: rangsAttendus(q)[q.cherche === 'long' ? 0 : q.crayons.length - 1] })

export function ecartsAuProgramme(x: readonly Question[] | Tirage, contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x : (x as Tirage).questions
  const max = donneesDe(contraintes.niveau).nb
  return qs.some(q => q.crayons.length > max) ? [`plus de ${max} objets à comparer`] : []
}
