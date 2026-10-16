// Le premier, le dernier — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le
// hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
// Une question : une file de `longueur` objets identiques, et un rang à montrer (le k-ième, le dernier, l'avant-dernier). La réponse est la
// place touchée (0 = la première, en partant de la flèche dessinée au début de la file). MS : files de 4 à 6, rangs numérotés (le premier… le
// sixième : « le dernier » est du programme de 5 ans) ; GS : files de 6 à 10, aussi « dernier » et « avant-dernier ».
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { EMOJI_OBJETS } from '../../dessins/collections.ts'
import type { ObjetCollection } from '../../dessins/collections.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Rng } from '../../utils/hasard.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Les objets de la file (aucun nom à dire : l'image suffit, la consigne est « montre le troisième »). */
export const OBJETS: readonly ObjetCollection[] = ['chat', 'grenouille', 'papillon', 'poisson', 'fleur', 'voiture']

/** Plus longue file par classe (programme : 6 à 4 ans, 10 à 5 ans). */
export const FILE_MAX: Readonly<Partial<Record<Classe, number>>> = { ms: 6, gs: 10 }
/** Plus courte file par classe : en MS 4 (le rang n'est jamais deviné), en GS 6 (plus longue que la MS). */
export const FILE_MIN: Readonly<Partial<Record<Classe, number>>> = { ms: 4, gs: 6 }

/** Ce qu'on demande : un rang (1 = le premier), ou la fin de la file (« dernier » : 0, « avant-dernier » : -1 en GS). */
export type Demande = { rang: number } | { fin: 'dernier' | 'avant-dernier' }
export interface Question {
  cle: string
  objet: ObjetCollection
  emoji: NomEmoji
  longueur: number
  demande: Demande
  /** la place (de 0) de l'objet à montrer */
  attendu: number
  /** le mot dit : « premier », « troisième », « dernier »… (clé de `ordinal.` dans le catalogue) */
  mot: string
}
export interface Reponse { place: number }
export interface TirageFiche { niveau: Classe, questions: Question[] }

/** Le mot de l'ordinal pour un rang (1 = premier) : sa clé dans le catalogue (`ordinal.<mot>`). */
export const MOT_DU_RANG: readonly string[] = ['premier', 'deuxieme', 'troisieme', 'quatrieme', 'cinquieme', 'sixieme', 'septieme', 'huitieme', 'neuvieme', 'dixieme']

function question(niveau: Classe, rng: Rng): Question {
  const max = FILE_MAX[niveau] ?? 3
  const longueur = rng.entier(FILE_MIN[niveau] ?? 3, max)
  const objet = rng.choisir(OBJETS)
  // GS : une fois sur trois, un bout de la file ; MS : seulement des rangs numérotés ; sinon un rang au hasard dans la file
  const fin = niveau === 'gs' && rng.entier(0, 2) === 0
  let demande: Demande
  let attendu: number
  let mot: string
  if (fin) {
    const avantDernier = rng.entier(0, 1) === 1
    demande = { fin: avantDernier ? 'avant-dernier' : 'dernier' }
    attendu = avantDernier ? longueur - 2 : longueur - 1
    mot = avantDernier ? 'avantDernier' : 'dernier'
  } else {
    attendu = rng.entier(0, longueur - 1)
    demande = { rang: attendu + 1 }
    mot = MOT_DU_RANG[attendu]
  }
  return { cle: `${longueur}:${mot}`, objet, emoji: EMOJI_OBJETS[objet], longueur, demande, attendu, mot }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question(niveau, rng), { cle: q => q.cle })

export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche =>
  ({ niveau: p.niveau, questions: questions({ ...p, nb: 6 }) })

/** La consigne dite : « Montre le troisième, en partant de la flèche. » */
export const consigne = (q: Question, T: Traducteur<Cle>): string => T('montre', { mot: T(`ordinal.${q.mot}` as Cle) })
/** Le corrigé d'une question, en une ligne : « le troisième : la 3e case ». */
export const corrige = (q: Question, T: Traducteur<Cle>): string => T('corrigeCase', { mot: T(`ordinal.${q.mot}` as Cle), n: q.attendu + 1 })

export const verifier = (q: Question, rep: Reponse): Verdict => rep.place === q.attendu
export const bonneReponse = (q: Question): Reponse => ({ place: q.attendu })
export const mauvaiseReponse = (q: Question): Reponse => ({ place: (q.attendu + 1) % q.longueur })

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs: readonly Question[] = Array.isArray(x) ? x : (x as TirageFiche).questions
  const max = FILE_MAX[contraintes.niveau] ?? 0
  const trop = qs.filter(q => q.longueur > max).map(q => `file de ${q.longueur} > ${max}`)
  const bout = qs.filter(q => 'fin' in q.demande && contraintes.niveau !== 'gs').map(() => 'dernier ou avant-dernier avant la GS')
  return [...trop, ...bout]
}
