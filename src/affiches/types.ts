// Types d'une affiche (src/affiches/README.md). Les identifiants viennent du programme (programme.ts) : une compétence,
// un domaine ou une classe inconnus ne compilent pas. Purs : lisibles par node (retrait des types, sans compilation).
import type { Classe, CompetenceId, DomaineId, NiveauExercice, OptionsDe, Reglages, Rng, Traducteur, ValeurOption, ValeurReglage } from '../noyau/types.ts'
import type { Champ } from '../noyau/declaration.ts'
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

/**
 * « Visible si » : une condition sur la valeur d'un réglage (de l'affiche, ou de la feuille : `variante`, `langue`,
 * `langues`, `format`, `orientation`). Un réglage invisible reprend son défaut et n'est pas proposé.
 * - `{ reglage, valeur }` : le réglage vaut `valeur` ;
 * - `{ reglage, dans }` : sa valeur est l'une de la liste ;
 * - `{ reglage, contient }` : sa valeur est une liste (choix multiple, `langues`) qui contient `valeur` ;
 * - `{ tous }` (ET) et `{ un }` (OU) : combinaisons d'autres conditions.
 */
export type Condition =
  | { reglage: string, valeur: ValeurOption }
  | { reglage: string, dans: readonly ValeurOption[] }
  | { reglage: string, contient: ValeurOption }
  | { tous: readonly Condition[] }
  | { un: readonly Condition[] }

/**
 * La mise en forme du formulaire : groupes, ordre, aide (texte `aide.<cle>`, facultatif) et dépendances.
 * `visibleSi` : par clé de réglage, ou `polices.<type>` pour un type de police (mode `parType`).
 */
export interface PlanFormulaire {
  groupes?: readonly GroupeFormulaire[]
  visibleSi?: Readonly<Record<string, Condition>>
}

export type { Champ }

/** Les valeurs proposées d'un réglage à choix d'après les autres réglages (langue, variante…) : voir `offertes`. */
export type Offertes = (config: Readonly<Record<string, unknown>>) => readonly ValeurOption[]

/**
 * Une variante : une version de l'affiche pour des niveaux donnés. C'est un niveau d'exercice (compétences, réglages,
 * options, bonus, horsProgramme) qui sait de plus pour quelles classes elle est faite : <ChoixReglage> la lit tel quel.
 */
export interface VarianteAffiche<R extends object = Reglages> extends NiveauExercice<R> {
  /**
   * classes de la variante (src/data/classes.ts), jamais du texte : le catalogue en fait « MS », « GS · CP ». Un TABLEAU de
   * classes (une affiche sert souvent plusieurs classes) ; côté exercice, `niveaux` est un objet (un niveau par classe).
   */
  classes: readonly Classe[]
  /** champs libres propres à la variante (s'ajoutent à ceux de l'affiche) */
  champs?: Readonly<Record<string, Champ>>
  /** slug publié en français (une affiche reportée garde son slug publié) ; défaut `affiche-<id>-<variante>` */
  slug?: string
  /** format et sens par défaut de cette variante (parmi ceux de l'affiche) ; défaut : le premier de chaque liste. L'élève peut les changer. */
  format?: Format
  orientation?: Orientation
  /**
   * place de la variante sur les axes du choix (ex. { verbe: 'etre', temps: 'cycle' }) : le formulaire propose alors une rangée de boutons
   * par axe au lieu de la liste des variantes ; textes `axe.<axe>` (titre de la rangée) et `axe.<axe>.<valeur>` (bouton)
   */
  axes?: Readonly<Record<string, string>>
}

/**
 * Définition d'une affiche : la seule déclaration de ses variantes, niveaux, compétences et réglages. Les textes (titre,
 * noms et descriptions des variantes) sont dans textes.ts, sous des clés qui suivent une convention : `titre`,
 * `variante.<id>.court|titre|description`, `reglage.<cle>`, `valeur.<cle>.<valeur>`, `groupe.<id>`, `aide.<cle>`.
 */
export interface DefinitionAffiche<R extends object = Reglages> {
  id: string
  domaine: DomaineId
  genre: 'affiche'
  /** orientations permises ; la première est celle par défaut ; une seule : fixe, non proposée dans le formulaire */
  orientations: readonly Orientation[]
  /** formats permis ; le premier est celui par défaut ; un seul : fixe, non proposé dans le formulaire */
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
  /** emoji de la carte du catalogue ; défaut : celui du domaine */
  emoji?: string
  /** marge et hauteur du titre (mm, agrandis en A3) ; défauts du cadre */
  marge?: number
  hTitre?: number
  /** réglages communs : défauts, et valeurs proposées des réglages à choix */
  reglages: Partial<R>
  options: OptionsDe<R>
  /** champs libres (texte, nombre) communs aux variantes : leur défaut est dans `reglages` */
  champs: Readonly<Record<string, Champ>>
  /** valeurs proposées qui dépendent des autres réglages ; sous-ensemble des `options` déclarées (voir `offertes` de la spec) */
  offertes: Readonly<Record<string, Offertes>>
  /** jeux de réglages nommés qui pré-remplissent le formulaire (texte `prereglage.<id>`) ; ce ne sont pas des variantes */
  prereglages: Readonly<Record<string, Readonly<Record<string, ValeurReglage>>>>
  /** par identifiant, dans l'ordre d'affichage (une fonction de la déclaration est déjà appelée) */
  variantes: Readonly<Record<string, VarianteAffiche<R>>>
}

/**
 * Réglages complets d'une affiche, tels que le dessin les lit : ceux de la définition et ceux de la feuille.
 * `langue` est la première des `langues` affichées ; `polices` donne la famille de chaque type (`unique` en mode unique).
 */
export type ConfigAffiche<R extends object = Reglages> = R & {
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
  /** nom seul de la famille (sans repli CSS), pour `mesure` */
  nomPolice(type?: TypePolice): string
  /** mesure de texte dans les polices (largeur, proportions) : canvas dans le navigateur, estimation tabulée sous node */
  mesure: Mesure
  /** hasard de la graine (seulement si la définition a `hasard: true`) */
  rng: Rng
}

/**
 * Mesure de texte injectée dans le dessin, pour qu'il reste pur (lisible par node). Unités : em (1 = la taille de police).
 * Navigateur : `mesureNavigateur` (canvas, exacte). Node et build : `mesureEstimee` (largeurs tabulées des polices livrées,
 * sans crénage : écart de quelques pour cent, voir src/affiches/mesure.ts).
 */
export interface Mesure {
  largeur(texte: string, police: string, gras?: boolean): number
  /** hauteur d'x, de majuscule, de hampe et de jambage de la police */
  metriques(police: string): { x: number, majuscule: number, hampe: number, jambage: number }
}

/** Le dessin : pur, sans Vue ni DOM. Rend les pages (au moins une) ; `css` s'ajoute à celui du cadre. */
export interface Rendu<R extends object = Reglages> {
  dessin(reglages: ConfigAffiche<R>, zone: Zone, T: Traducteur, contexte: ContexteDessin): readonly Page[]
  css: string
}

/** Catalogues de textes d'une affiche, par langue. */
export type TextesAffiche = Record<string, Record<string, string>>

/** Une affiche : sa définition, son dessin et ses textes. Le registre (index.ts) les range. */
export interface ModuleAffiche<R extends object = Reglages> {
  definition: DefinitionAffiche<R>
  rendu: Rendu<R>
  textes: TextesAffiche
}

export type { CompetenceId }

/** Le type des réglages d'une définition : `type Reglages = ReglagesDeAffiche<typeof definition>`. */
export type ReglagesDeAffiche<D> = D extends DefinitionAffiche<infer R> ? R : never
