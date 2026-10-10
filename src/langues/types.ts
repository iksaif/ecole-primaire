import type { Classe } from '../data/classes.ts'
import type { TableConfiance } from './confiance.ts'
import type { NomEmoji } from '../images/tables.ts'
// Types du système de langues : définition d'une langue, catalogues de textes typés, clés et paramètres dérivés du français.
// Purs (aucune dépendance) : lisibles par node, sans compilation.

// ── Catalogues de textes ──

/** Texte à pluriel : la forme est choisie par `Intl.PluralRules` d'après `n` (français : one/other ; breton : one/two/few/many/other). */
export interface Pluriel { zero?: string, one?: string, two?: string, few?: string, many?: string, other: string }

/** Une feuille du catalogue : un texte, une liste de textes, ou un texte à pluriel. */
export type Feuille = string | readonly string[] | Pluriel

/**
 * Forme qu'une langue doit donner à son catalogue, d'après le catalogue source (le français, écrit `as const`) :
 * exactement les mêmes clés (une clé manquante ou en trop est une erreur de compilation), des textes pour des textes,
 * des listes pour des listes, des pluriels pour des pluriels (avec les formes propres à la langue).
 */
export type Traductions<T> = {
  [K in keyof T]: T[K] extends string ? string
    : T[K] extends readonly string[] ? readonly string[]
    : T[K] extends { other: string } ? Pluriel
    : Traductions<T[K]>
}

/** Chemins (« nav.accueil ») de toutes les feuilles d'un catalogue. */
export type Chemins<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends Feuille ? `${P}${K}` : Chemins<T[K], `${P}${K}.`>
}[keyof T & string]

/** Type de la feuille à un chemin. */
export type FeuilleA<T, C extends string> = C extends `${infer K}.${infer R}`
  ? K extends keyof T ? FeuilleA<T[K], R> : never
  : C extends keyof T ? T[C] : never

/** Noms des paramètres `{nom}` d'un texte. */
type ParamsDeTexte<S extends string> = S extends `${string}{${infer P}}${infer R}` ? P | ParamsDeTexte<R> : never

/** Noms des paramètres d'une feuille ; un pluriel demande toujours `n`. */
export type NomsParams<F> = F extends string ? ParamsDeTexte<F>
  : F extends { other: infer O extends string } ? 'n' | ParamsDeTexte<O>
  : never

/** Clés (chemins) dont la feuille est un texte ou un pluriel, pas une liste. */
export type CleTexteDe<S> = { [C in Chemins<S>]: FeuilleA<S, C> extends readonly string[] ? never : C }[Chemins<S>]
/** Clés (chemins) dont la feuille est une liste de textes. */
export type CleListeDe<S> = { [C in Chemins<S>]: FeuilleA<S, C> extends readonly string[] ? C : never }[Chemins<S>]

export type ValeurParam = string | number

/** Arguments de `t(cle, …)` : les paramètres du texte, absents si le texte n'en a pas. */
export type ArgsParams<F> = [NomsParams<F>] extends [never] ? [params?: undefined] : [params: { [P in NomsParams<F>]: ValeurParam }]

// ── Langue ──

/** Règles de langue pour écrire du contenu généré sans branche « si breton… ». Voir fr/regles.ts et br/regles.ts. */
export interface Regles {
  readonly langue: string
  /** « 1 bille », « 3 billes » (breton : le nom reste au singulier) ; nom = { s, p } ou chaîne */
  nombre(n: number, nom: string | NomPluriel): string
  pluriel(n: number, nom: string | NomPluriel): string
  /** « et » / « ha » ou « hag » devant une voyelle */
  et(mot?: string): string
  ou(): string
  /** « que Léo », « qu'Emma » */
  que(mot: string): string
  de(mot: string): string
  /** article défini avec ses mutations : « le chat », « l'école », « ar c'hi », « an daol » */
  le(mot: string, genre?: 'm' | 'f'): string
  /** mutations (breton) ; absentes dans les langues qui n'en ont pas */
  adoucir?(mot: string): string
  spirer?(mot: string): string
}
export interface NomPluriel { s: string, p?: string }

/** Données d'une langue régionale : ce qu'il faut pour l'afficher et, plus tard, pour écrire ses fiches. */
export interface DonneesRegionales {
  /** Alphabet (lettres et digrammes dans l'ordre) et lettres qui s'ajoutent à l'alphabet latin */
  alphabet: readonly string[]
  lettresEnPlus: readonly string[]
  titreAlphabet: string
  /** Mot illustré par lettre : [mot, nom de l'emoji (src/images/tables.ts)] */
  mots: Readonly<Record<string, readonly [string, NomEmoji]>>
  /** Nombre en lettres (0 à 9999) */
  enLettres(n: number): string
  /** Listes de mots : jours, mois, nombres… `libelle` : nom de la liste dans chaque langue d'interface */
  listes: readonly ListeDeMots[]
  /** À qui s'adresse la langue (« l'école bilingue ou Diwan »), dans chaque langue d'interface */
  ecoles: Readonly<Record<string, string>>
  /** Fiches d'écriture publiées pour la langue (src/exercices/ecriture/publiees.ts) */
  fichesEcriture: FichesEcritureRegionales
}
/**
 * Les fiches d'écriture toutes prêtes d'une langue régionale : l'alphabet, une fiche par lettre, et des listes de mots. Les slugs
 * en découlent (`fiche-ecriture-<motLettre>-<lettre>`, `fiche-ecriture-<slug>-<nom>`) : ils sont publiés, ils ne changent pas.
 */
export interface FichesEcritureRegionales {
  /** mot « lettre » dans la langue : slug des fiches d'une lettre (`fiche-ecriture-lizherenn-a`) */
  motLettre: string
  /** titre imprimé d'une fiche d'une lettre (« Al lizherenn » → « Al lizherenn A a ») */
  titreLettre: string
  listes: readonly {
    slug: string
    /** listes de `listes` mises bout à bout (les deux séries de jours) */
    listes: readonly string[]
    court: string
    titre: string
    resume: string
    classes: readonly Classe[]
    /** lignes à copier seul (défaut 0) */
    copie?: 0 | 1 | 2 | 3
    /** la compétence de la langue régionale du thème de la liste (src/data/programme.ts) : les jours, les mois, les nombres jusqu'à 10 */
    competence: 'jours-langue-regionale' | 'mois-saisons-langue-regionale' | 'nombres-jusqua-10-langue-regionale'
  }[]
}
export interface ListeDeMots { id: string, libelle: Readonly<Record<string, string>>, titre: string, mots: readonly string[] }

/** Synthèse vocale : la langue est-elle lue par le navigateur ? (le breton ne l'est pas) */
export interface Voix { disponible: boolean, bcp47: string }

/**
 * Définition d'une langue. `L` : les codes des langues d'interface (pour `nom`). Le registre (registre.ts) en tire
 * l'union `Langue` : il n'y a pas d'autre liste de codes dans le code.
 */
export interface LangueDef<L extends string = string> {
  /** code court (`fr`, `br`) : celui qu'on stocke et qu'on passe aux fonctions */
  code: L
  /** étiquette BCP 47 (attribut `lang`, `Intl`) */
  bcp47: string
  /** nom de la langue dans chaque langue d'interface (« breton » / « brezhoneg ») */
  nom: Readonly<Record<L, string>>
  /** nom dans la langue elle-même */
  nomLocal: string
  /** drapeau (SVG en texte) */
  drapeau: string
  regles: Regles
  /** la traduction de l'interface a-t-elle été relue par un locuteur ? (non : avis de traduction automatique) */
  traductionRelue: boolean
  /** textes de l'interface dans cette langue (même forme que le français) */
  textes: object
  voix: Voix
  /** présent pour une langue régionale (qu'on peut activer, enseigner) */
  donnees?: DonneesRegionales
  /** niveau de confiance de la traduction de chaque exercice et affiche (src/langues/confiance.ts) ; absent : langue source, ou rien d'évalué */
  confiance?: TableConfiance
  /** emplacement du futur programme de la langue (compétences propres) ; `null` tant qu'il n'existe pas */
  programme: null
}
