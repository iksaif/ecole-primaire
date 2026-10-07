// La géométrie — les types : une question par famille (symétrie, reproduction, repérage, figure, solide, angles, propriétés, cercle,
// patron), la réponse de l'élève et le tirage d'une fiche. Types seuls (aucun code).
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
export interface QReproduction extends SurQuadrillage { type: 'reproduction', modele: string[], repere: string }
export interface QReperageColorie extends SurQuadrillage { type: 'reperage', sous: 'colorie', cible: string, nom: string }
export interface QReperageLire extends Base, AvecChoix { type: 'reperage', sous: 'lire', cols: number, rows: number, cible: string, nom: string, consigne: string }

/** Une figure dessinée dans 200 × 200 : ses sommets (cercle : seulement son rayon) et ceux où l'angle est droit. */
export interface Figure { points: [number, number][], rayon: number, anglesDroits: number[] }
export interface QFigure extends Base, AvecChoix, Figure { type: 'figure', sous: 'nom' | 'cotes' | 'angle', forme: FormeFigure, lettres?: undefined }
export interface QSolide extends Base, AvecChoix { type: 'solide', sous: 'nom' | 'rouler' | 'faces' | 'sommets', solide: SolideGeo }
export interface QAngles extends Base, Figure { type: 'angles', forme: FormeAngles, lettres: string[], droits: string[] }
export interface QPropriete extends Base, AvecChoix { type: 'proprietes', prop: string }
export interface QCercle extends Base, AvecChoix {
  type: 'cercle', sous: 'centre' | 'segment' | 'lequel' | 'mesure', rot: number, pts: { a: string, b: string, c: string, d: string, e: string }
  cible?: 'rayon' | 'diametre', r?: number
}
export interface QPatron extends Base, AvecChoix { type: 'patron', cases: [number, number][], valide: boolean }

export type Question = QSymetrie | QReproduction | QReperageColorie | QReperageLire | QFigure | QSolide | QAngles | QPropriete | QCercle | QPatron

/**
 * La réponse : `choix` (indice de la proposition touchée), `selection` (clés de cases : symétrie, reproduction, repérage) ou `lettres`
 * (angles droits : les lettres cochées, ou ['aucun']).
 */
export type Reponse = { choix: number } | { selection: string[] } | { lettres: string[] }

/** Une rubrique de la fiche de repérage : la grille, les cases à colorier, les symboles à nommer. */
export interface RepereFiche {
  cols: number, rows: number, aColorier: string[], symboles: Record<string, string>, lectures: { symbole: string, nom: string }[]
}
/** Ce que tire la fiche : une rubrique par exercice coché (et offert par le niveau), dans l'ordre de la fiche. */
export interface TirageFiche {
  niveau: Classe
  symetrie?: QSymetrie[]
  reproduction?: QReproduction[]
  reperage?: RepereFiche
  figures?: (Figure & { forme: FormeFigure })[]
  solides?: SolideGeo[]
  angles?: QAngles[]
  proprietes?: { id: string, vrai?: boolean }[]
  cercle?: { rot: number }
  patrons?: { cases: [number, number][], valide: boolean }[]
}
