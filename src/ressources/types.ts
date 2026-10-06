// Types des ressources (plan 13) : tout ce que le site propose, dans un seul format, pour les pages (matière, programme,
// compétence, fiches prêtes) et la recherche. Un catalogue est une liste de `Ressource`, construite par `catalogue.ts`.
// Pur : lisible par node (aucune dépendance à Vue). Les identifiants (classe, domaine, compétence, matière) viennent du
// programme : un identifiant inconnu ne compile pas.
//
// Quatre sortes de ressources de contenu, un exercice et son générateur de fiche étant UNE ressource à deux badges :
//   exercice    un exercice du registre : se joue à l'écran (badge `jeu`) et/ou s'imprime (badge `imprimable`)
//   affiche     une affiche du registre des affiches (à apprendre, à imprimer)
//   fiche       une fiche toute prête (PDF), lue dans l'index `fiches/index.json`
// Deux sortes de navigation, que la recherche cherche aussi : `competence` (du programme) et `page` (une page du site).
import type { Classe } from '../data/classes.ts'
import type { CompetenceId, DomaineId, Matiere } from '../data/programme.ts'
import type { CleTexte } from '../langues/traduire.ts'
import type { Langue } from '../langues/registre.ts'
import type { Texte, Usage } from '../telechargements/types.ts'

export type { Classe, CompetenceId, DomaineId, Matiere, Langue, Usage }

/**
 * Un texte à afficher, sans texte en dur : une clé de l'interface (typée : une clé inconnue ne compile pas), ou le texte
 * dans chaque langue quand il vient de données (catalogue de contenu d'une affiche, index des fiches, libellé officiel d'une
 * compétence). Se lit avec `texteDe` (textes.ts).
 */
export type Libelle = { readonly cle: CleTexte } | { readonly texte: Texte }

/** Ce que toute ressource dit d'elle-même. */
interface Commun {
  /** stable et unique dans un catalogue : `<type>:<identifiant>` (`exercice:heure`, `fiche:affiche-bande-ms`…) */
  readonly id: string
  readonly titre: Libelle
  /** une phrase, ou `null` quand la ressource n'en a pas (rien n'est inventé) */
  readonly description: Libelle | null
  readonly emoji: string
  /** classes concernées (une ressource multi-classes y est une seule fois) ; vide pour une page : toutes les classes */
  readonly classes: readonly Classe[]
  readonly competences: readonly CompetenceId[]
  /** langues de contenu, restreintes à celles du site */
  readonly langues: readonly Langue[]
  /** adresse de la ressource dans le site */
  readonly route: string
  /** ressource d'exemple : développement seulement */
  readonly exemple: boolean
}

/** Ce que l'on peut faire d'une ressource de contenu : la jouer en ligne, l'imprimer. */
export interface Badges {
  readonly jeu: boolean
  readonly imprimable: boolean
}

/** Une ressource de contenu : rangée dans un domaine du programme, pour apprendre ou s'entraîner. */
interface Contenu extends Commun {
  readonly matiere: Matiere
  readonly domaine: DomaineId
  readonly badges: Badges
  readonly usage: Usage
}

export interface RessourceExercice extends Contenu { readonly type: 'exercice' }
export interface RessourceAffiche extends Contenu { readonly type: 'affiche' }
export interface RessourceFiche extends Contenu {
  readonly type: 'fiche'
  /** slug publié (`/telechargements/<slug>/`) */
  readonly slug: string
  /** slug du bilan dont cette fiche est une compétence ; `null` pour une fiche autonome ou un bilan */
  readonly parent: string | null
}

/** Une compétence du programme, vue comme une ressource à chercher (`/competence/<id>`). */
export interface RessourceCompetence extends Commun {
  readonly type: 'competence'
  readonly matiere: Matiere
  readonly domaine: DomaineId
}

/** Une page du site (Programme, Réglages, À propos…) : fournie par la table des routes, pas par les registres. */
export interface RessourcePage extends Commun { readonly type: 'page' }

/** Une ressource de contenu : ce que contient un catalogue, ce que les pages de matière listent. */
export type RessourceDeContenu = RessourceExercice | RessourceAffiche | RessourceFiche

export type Ressource = RessourceDeContenu | RessourceCompetence | RessourcePage

export type TypeRessource = Ressource['type']

/** Les types, dans l'ordre où la recherche les présente. */
export const TYPES_RESSOURCE = ['exercice', 'affiche', 'fiche', 'competence', 'page'] as const satisfies readonly TypeRessource[]
