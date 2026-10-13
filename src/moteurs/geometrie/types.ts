// La géométrie — les types : une question par famille (symétrie, figure, solide, angles, propriétés, cercle, patron), la réponse de l'élève et le tirage d'une fiche. Types seuls (aucun code).
import type { Classe, Rng, Traducteur } from '../../noyau/types.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { FormeAngles, FormeFigure, SolideGeo, TypeExercice } from './donnees.ts'
import type { CONTENU } from './textes.ts'
import type { DonneesNiveau } from './donnees.ts'

export type Cle = CleContenu<typeof CONTENU>
export type T = Traducteur<Cle>

/** Ce que reçoit un générateur de questions : le hasard, les textes et les données du niveau. */
export interface Contexte { rng: Rng, T: T, niv: DonneesNiveau & { exercices: readonly TypeExercice[] } }

/** Une proposition d'une question à choix. */
export interface Choix { label: string }
/** Ce que porte une question à choix : les libellés, la bonne réponse, et les propositions pour <ChoixReponses>. */
export interface AvecChoix { choix: string[], reponse: string, options: Choix[], bonne: number }

interface Base { cle: string, texte: string, attendu: string }
/** Les cases d'un quadrillage sont des clés « colonne,ligne ». */
interface SurQuadrillage extends Base { cols: number, rows: number, cellules: string[], consigne: string }

export interface QSymetrie extends SurQuadrillage { type: 'symetrie', axe: 'h' | 'v', premier: boolean, modele: string[] }

/** Une figure dessinée dans 200 × 200 : ses sommets (cercle : seulement son rayon) et ceux où l'angle est droit. */
export interface Figure { points: [number, number][], rayon: number, anglesDroits: number[] }
export interface QFigure extends Base, AvecChoix, Figure { type: 'figure', sous: 'nom' | 'cotes' | 'sommets' | 'angle', forme: FormeFigure, lettres?: undefined }
/** `proposes` (« Lequel est un… ? ») : les solides dessinés dans les propositions, dans l'ordre des choix. */
export interface QSolide extends Base, AvecChoix {
  type: 'solide', sous: 'nom' | 'lequel' | 'rouler' | 'faces' | 'sommets' | 'aretes' | 'nature', solide: SolideGeo, proposes?: SolideGeo[]
}
export interface QAngles extends Base, Figure { type: 'angles', forme: FormeAngles, lettres: string[], droits: string[] }
export interface QPropriete extends Base, AvecChoix { type: 'proprietes', prop: string }
/** Aigu, droit ou obtus : un angle de `degres`, tourné de `rotation`. */
export interface QAigu extends Base, AvecChoix { type: 'aigus', sorte: 'aigu' | 'droit' | 'obtus', degres: number, rotation: number }
/** Est-ce un carré / un rectangle ? La figure dessinée (sans codage des angles droits : l'élève vérifie) et le cas tiré. */
export interface QJustifier extends Base, AvecChoix, Figure { type: 'justifier', cas: string, question: 'carre' | 'rectangle', forme: FormeAngles }
export interface QCercle extends Base, AvecChoix {
  type: 'cercle', sous: 'centre' | 'segment' | 'lequel' | 'mesure', rot: number, pts: { a: string, b: string, c: string, d: string, e: string }
  cible?: 'rayon' | 'diametre', r?: number
}
export interface QPatron extends Base, AvecChoix { type: 'patron', cases: [number, number][], valide: boolean }

export type Question = QSymetrie | QAigu | QJustifier | QFigure | QSolide | QAngles | QPropriete | QCercle | QPatron

/**
 * La réponse : `choix` (indice de la proposition touchée), `selection` (clés de cases : symétrie) ou `lettres`
 * (angles droits : les lettres cochées, ou ['aucun']).
 */
export type Reponse = { choix: number } | { selection: string[] } | { lettres: string[] }

/** Ce que tire la fiche : une rubrique par exercice coché (et offert par le niveau), dans l'ordre de la fiche. */
export interface TirageFiche {
  niveau: Classe
  symetrie?: QSymetrie[]
  figures?: (Figure & { forme: FormeFigure })[]
  solides?: SolideGeo[]
  /** CP : les solides à entourer s'ils roulent */
  rouler?: SolideGeo[]
  angles?: QAngles[]
  proprietes?: { id: string, vrai?: boolean }[]
  aigus?: QAigu[]
  justifier?: QJustifier[]
  cercle?: { rot: number }
  patrons?: { cases: [number, number][], valide: boolean }[]
}
