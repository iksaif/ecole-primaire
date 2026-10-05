// Types d'une affiche (src/affiches/README.md). Les identifiants viennent du programme (programme.ts) : une compétence,
// un domaine ou une classe inconnus ne compilent pas. Purs : lisibles par node (retrait des types, sans compilation).
import type { Classe, CompetenceId, DomaineId, NiveauExercice, OptionsDe, Reglages, Rng, Traducteur, ValeurOption } from '../noyau/types.ts'
import type { Format, Orientation } from '../utils/page.ts'

export type { Format, Orientation }

/** Les deux sortes d'écriture : le script (lettres séparées) et l'attaché (cursive). */
export type TypePolice = 'script' | 'attache'

/**
 * La police du contenu de l'affiche. Le titre et l'interface restent toujours dans la police de base (Andika).
 * - `unique` : un seul choix pour toute l'affiche, avec un défaut possible propre à l'affiche ;
 * - `parType` : une police par type d'élément (ex. les mots en script, les tracés en attaché), chacune avec son défaut.
 */
export type PoliceAffiche =
  | { mode: 'unique', defaut?: string }
  | { mode: 'parType', types: readonly TypePolice[], defauts: Readonly<Partial<Record<TypePolice, string>>> }

/** Un groupe du formulaire : un titre (texte `groupe.<id>`) et ses réglages, dans l'ordre. */
export interface GroupeFormulaire {
  id: string
  /** clés de réglages à choix ou réglages de la feuille : `langues`, `graine`, `titre`, `polices` */
  reglages: readonly string[]
}

/** « Visible si » : le réglage `reglage` vaut `valeur`. Un réglage invisible reprend son défaut et n'est pas proposé. */
export interface ConditionVisible { reglage: string, valeur: ValeurOption }

/** La mise en forme du formulaire : groupes, ordre, aide (texte `aide.<cle>`, facultatif) et dépendances simples. */
export interface PlanFormulaire {
  groupes?: readonly GroupeFormulaire[]
  visibleSi?: Readonly<Record<string, ConditionVisible>>
}

/**
 * Une variante : une version de l'affiche pour des niveaux donnés. C'est un niveau d'exercice (compétences, réglages,
 * options, bonus, horsProgramme) qui sait de plus pour quelles classes elle est faite : <ChoixReglage> la lit tel quel.
 */
export interface VarianteAffiche<R extends Reglages = Reglages> extends NiveauExercice<R> {
  /** classes de la variante (src/data/classes.ts), jamais du texte : le catalogue en fait « MS », « GS · CP » */
  niveaux: readonly Classe[]
  /** slug publié en français (une affiche reportée garde son slug publié) ; défaut `affiche-<id>-<variante>` */
  slug?: string
}

/**
 * Définition d'une affiche : la seule déclaration de ses variantes, niveaux, compétences et réglages. Les textes (titre,
 * noms et descriptions des variantes) sont dans textes.ts, sous des clés qui suivent une convention : `titre`,
 * `variante.<id>.court|titre|description`, `reglage.<cle>`, `valeur.<cle>.<valeur>`, `groupe.<id>`, `aide.<cle>`.
 */
export interface DefinitionAffiche<R extends Reglages = Reglages> {
  id: string
  domaine: DomaineId
  genre: 'affiche'
  orientation: Orientation
  /** formats permis ; le premier est celui par défaut */
  formats: readonly Format[]
  /** langues de contenu de l'affiche ; la première est celle par défaut */
  langues: readonly string[]
  /**
   * `true` : l'affiche peut montrer plusieurs langues sur la même feuille (réglage « langues affichées »), et le
   * catalogue propose chaque langue seule puis toutes ensemble. `false` : une langue par feuille, une entrée par langue.
   */
  bilingue: boolean
  police: PoliceAffiche
  /** le dessin a du hasard : réglage `graine` et bouton « Nouvelle » (sinon, aucune graine) */
  hasard: boolean
  formulaire: PlanFormulaire
  /** page du formulaire « Personnaliser » */
  route: string
  /** marge et hauteur du titre (mm, agrandis en A3) ; défauts du cadre */
  marge?: number
  hTitre?: number
  /** réglages communs : défauts, et valeurs proposées des réglages à choix */
  reglages: Partial<R>
  options: OptionsDe<R>
  /** par identifiant, dans l'ordre d'affichage (une fonction de la déclaration est déjà appelée) */
  variantes: Readonly<Record<string, VarianteAffiche<R>>>
}

/**
 * Réglages complets d'une affiche, tels que le dessin les lit : ceux de la définition et ceux de la feuille.
 * `langue` est la première des `langues` affichées ; `polices` donne la famille de chaque type (`unique` en mode unique).
 */
export type ConfigAffiche<R extends Reglages = Reglages> = R & {
  variante: string, format: Format, orientation: Orientation, langue: string, langues: readonly string[]
  /** titre personnalisé (vide : celui de l'affiche) */
  titre: string
  polices: Readonly<Record<string, string>>
  graine: number
}

/** La zone sous le titre, en millimètres. */
export interface Zone { W: number, H: number }

/** Une page : son HTML, ou son HTML et son titre (`undefined` : celui de l'affiche, `null` : aucun). */
export type Page = string | { corps: string, titre?: string | null }

/** Ce que le cadre fournit au dessin en plus des réglages. */
export interface ContexteDessin {
  /** textes dans une autre langue de la feuille (affiche bilingue) */
  Tde(langue: string): Traducteur
  /** famille CSS d'un type de police (`script`, `attache`), ou la police unique sans argument */
  police(type?: TypePolice): string
  /** hasard de la graine (seulement si la définition a `hasard: true`) */
  rng: Rng
}

/** Le dessin : pur, sans Vue ni DOM. Rend les pages (au moins une) ; `css` s'ajoute à celui du cadre. */
export interface Rendu<R extends Reglages = Reglages> {
  dessin(reglages: ConfigAffiche<R>, zone: Zone, T: Traducteur, contexte: ContexteDessin): readonly Page[]
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
