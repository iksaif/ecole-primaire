// Les mesures — les types communs aux générateurs de questions (un module par type : longueurs, masses, contenances, calendrier).
import type { Rng } from '../../utils/hasard.ts'
import type { Traducteur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

export type T = Traducteur<CleContenu<typeof CONTENU>>
export type Reglages = ReglagesDeDefinition<typeof DEFINITION>
/** Un type de question = un exercice proposé (réglage `exercices`). */
// (la liste est celle du CE2 : le CE1 n'a pas de contenances, le type du réglage commun ne les connaît pas)
export type TypeQuestion = 'regle' | 'unite' | 'conversion' | 'comparer' | 'masse' | 'contenance' | 'calendrier'

/** Ce qu'un exercice (ou une question) demande : un nombre tapé, ou une proposition choisie. */
export type ModeReponse = 'nombre' | 'choix'

/**
 * Une question. `cle` : ce qui rend deux questions identiques ; `consigne` : l'énoncé ; `affiche` : l'écriture à compléter (« 3 m = ? cm ») ;
 * `svg` : le dessin ; `texte` : ce que le tableau de correction montre ; `attendu` : la réponse écrite ; `explication` : montrée après une erreur.
 * `unite` : l'unité écrite après la saisie d'un nombre ; `choix` : les propositions (mode `choix`).
 */
export interface Question {
  type: TypeQuestion
  cle: string
  consigne: string
  svg?: string
  affiche?: string
  mode: ModeReponse
  unite?: string
  choix?: string[]
  reponse: number | string
  attendu: string
  texte: string
  explication: string
}

/** Données d'un niveau (donnees.ts). */
export interface DonneesNiveau {
  regle: { max: number, segMin: number, segMax: number, px: number, mm: boolean }
  fiche: { segMin: number, segMax: number, mm: boolean }
  unites: readonly string[]
  objetsUnite: readonly ObjetUnite[]
  conversions: readonly string[]
  kmMax: number
  kgMax: number
  comparaisons: readonly string[]
  boiteMasses: readonly number[]
  boiteKg: readonly number[]
  masses: readonly string[]
  seuils: readonly number[]
  contenances?: readonly string[]
  brocs?: readonly { max: number, u: string }[]
  bouteilles?: { max1: number, max2: number }
  objetsContenance?: readonly ObjetUnite[]
  unitesContenance?: readonly string[]
  calendrier: readonly string[]
  dansN: readonly [number, number]
}
/** Un objet de la vie courante avec sa mesure (`id` : sa phrase, `phrases.<id>` du catalogue de contenu). */
export type IdPhrase = keyof (typeof CONTENU)['source']['phrases']
export interface ObjetUnite { id: IdPhrase, valeur: number, unite: string }

/** Ce que reçoit chaque générateur : le hasard, les textes de l'exercice, les données du niveau, les réglages. */
export interface Contexte { rng: Rng, T: T, niv: DonneesNiveau, reglages: Reglages }
