// Types d'une affiche (src/affiches/README.md). Les identifiants viennent du programme (programme.ts) : une compétence,
// un domaine ou une classe inconnus ne compilent pas. Purs : lisibles par node (retrait des types, sans compilation).
import type { Classe, CompetenceId, DomaineId, NiveauExercice, OptionsDe, Reglages, Traducteur } from '../noyau/types.ts'
import type { Format, Orientation } from '../utils/page.ts'

export type { Format, Orientation }

/**
 * Une variante : une version de l'affiche pour des niveaux donnés. C'est un niveau d'exercice (compétences, réglages,
 * options, bonus, horsProgramme) qui sait de plus pour quelles classes elle est faite : <ChoixReglage> la lit tel quel.
 */
export interface VarianteAffiche<R extends Reglages = Reglages> extends NiveauExercice<R> {
  /** classes de la variante (src/data/classes.ts), jamais du texte : le catalogue en fait « MS », « GS · CP » */
  niveaux: readonly Classe[]
  /** slug publié en français (une affiche migrée garde le sien) ; défaut `affiche-<id>-<variante>` */
  slug?: string
}

/**
 * Définition d'une affiche : la seule déclaration de ses variantes, niveaux, compétences et réglages. Les textes (titre,
 * noms et descriptions des variantes) sont dans textes.ts, sous des clés qui suivent une convention : `titre`,
 * `variante.<id>.court|titre|description`, `reglage.<cle>`, `valeur.<cle>.<valeur>` (voir README).
 */
export interface DefinitionAffiche<R extends Reglages = Reglages> {
  id: string
  domaine: DomaineId
  genre: 'affiche'
  orientation: Orientation
  /** formats permis ; le premier est celui par défaut */
  formats: readonly Format[]
  /** langues de l'affiche ; la première est celle par défaut */
  langues: readonly string[]
  /** page du formulaire « Personnaliser » */
  route: string
  /** marge et hauteur du titre (mm, agrandis en A3) ; défauts du cadre */
  marge?: number
  hTitre?: number
  /** réglages communs : défauts, et valeurs proposées des réglages à choix */
  reglages: Partial<R>
  options: OptionsDe<R>
  /** par identifiant, dans l'ordre d'affichage */
  variantes: Readonly<Record<string, VarianteAffiche<R>>>
}

/** Réglages complets d'une affiche, tels que le dessin les lit : ceux de la définition et ceux de la feuille. */
export type ConfigAffiche<R extends Reglages = Reglages> = R & { variante: string, format: Format, orientation: Orientation, langue: string }

/** La zone sous le titre, en millimètres. */
export interface Zone { W: number, H: number }

/** Le dessin : pur, sans Vue ni DOM. Rend le HTML de la zone ; `css` s'ajoute à celui du cadre. */
export interface Rendu<R extends Reglages = Reglages> {
  dessin(reglages: ConfigAffiche<R>, zone: Zone, T: Traducteur): string
  css: string
}

/** Catalogues de textes d'une affiche, par langue. */
export type TextesAffiche = Record<string, Record<string, string>>

/** Une affiche : sa définition, son dessin et ses textes. Le registre (index.ts) les range. */
export interface ModuleAffiche<R extends Reglages = Reglages> {
  definition: DefinitionAffiche<R>
  rendu: Rendu<R>
  textes: TextesAffiche
}

export type { CompetenceId }

/** Le type des réglages d'une définition : `type Reglages = ReglagesDeAffiche<typeof definition>`. */
export type ReglagesDeAffiche<D> = D extends DefinitionAffiche<infer R> ? R : never
