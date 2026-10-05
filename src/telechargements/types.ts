// Schéma des fiches « toutes prêtes » (PDF) : ce que le build écrit (scripts/fiches/) et ce que la page /telechargements
// lit (src/views/Telechargements*.vue, useFiches). Un seul jeu de types pour les deux côtés ; tout est de la donnée pure,
// sérialisable en JSON (pas de Date, de Map ni de fonction). Spécification : README.md de ce dossier.
//
// Les identifiants viennent du programme : une classe, un domaine ou une compétence inconnus ne compilent pas.
import type { Classe } from '../data/classes.ts'
import type { CompetenceId, DomaineId, Source } from '../data/programme.ts'
import type { ValeurReglage } from '../noyau/types.ts'
import type { Format } from '../utils/page.ts'

export type { Classe, CompetenceId, DomaineId, Source, ValeurReglage, Format }

/** Numéro du schéma. Il monte à chaque changement incompatible ; la page refuse un index d'une autre version. */
export const VERSION_SCHEMA = 1

/** Dossier des fiches dans le site, et noms des fichiers qui l'organisent. */
export const DOSSIER_FICHES = 'fiches'
export const FICHIER_INDEX = 'index.json'

// ── Genre et usage ──

/** affiche : à apprendre et afficher ; fiche : à remplir, écrite à la main ; exercice : fiche tirée d'un exercice du site. */
export const GENRES = ['affiche', 'fiche', 'exercice'] as const
export type Genre = (typeof GENRES)[number]

/** Pour apprendre (affiches) ou pour s'entraîner (fiches et exercices). */
export const USAGES = ['apprendre', 'sentrainer'] as const
export type Usage = (typeof USAGES)[number]

/** L'usage se déduit du genre : il n'est jamais déclaré à part. */
export const usageDe = (genre: Genre): Usage => (genre === 'affiche' ? 'apprendre' : 'sentrainer')

// ── Briques ──

/**
 * Un texte dans plusieurs langues de contenu, indexé par code de langue. Le français est toujours là : c'est le repli
 * quand la langue demandée manque.
 */
export type Texte = { fr: string } & Record<string, string>

/** Une image du site (aperçu d'une page, miniature). `chemin` : voir « Chemins » dans le README. */
export interface Image {
  chemin: string
  largeur: number
  hauteur: number
}

/** Un PDF dans un format de papier. `taille` en octets. */
export interface FichierPdf {
  chemin: string
  format: Format
  taille: number
  nbPages: number
}

/** Le lien « Personnaliser » : une route de l'app (hash router) et sa requête, sans le `#` ni le `?`. */
export interface LienPersonnaliser {
  route: string
  requete: Record<string, string>
}

/** Un lien vers le programme officiel, pour des classes qui partagent la même adresse (un cycle). */
export interface LienProgramme {
  classes: Classe[]
  /** nom officiel du domaine à ce cycle */
  nom: string
  url: string
}

/** Un domaine du programme tel que la page l'affiche. `id: null` : hors programme (culture générale). */
export interface DomaineDeFiche {
  id: DomaineId | null
  nom: Texte
  matiere: 'maths' | 'francais' | 'autres'
  /** position dans la liste (les maths, puis le français, puis le reste) */
  rang: number
  programme: LienProgramme[]
}

/** Une compétence du programme visée par une fiche. */
export interface CompetenceVisee {
  id: CompetenceId
  /** libellé du programme (français : c'est un texte officiel) */
  libelle: string
  niveaux: Classe[]
  source: Source | null
}

// ── Index ──

/** Ce que la grille, les filtres et la recherche ont besoin de connaître d'une fiche. */
export interface EntreeIndex {
  /** identifiant publié, aussi le nom de `<slug>.json` ; ne change jamais une fois publié */
  slug: string
  titre: Texte
  titreCourt: Texte
  /** une ou deux phrases */
  description: Texte
  /** classes concernées, dans l'ordre de l'école (jamais du texte : la page en fait « CE1 », « GS · CP ») */
  niveaux: Classe[]
  domaine: DomaineId | null
  genre: Genre
  /** dérivé de `genre` (usageDe) ; répété pour que le filtre n'ait pas à le recalculer */
  usage: Usage
  /** langues du contenu de la fiche (codes) : ['fr'], ['br'], ['fr', 'br'] pour une fiche bilingue */
  langues: string[]
  /** pages d'un document de la fiche */
  nbPages: number
  /** nombre de documents différents (exercices : plusieurs fiches tirées avec des graines différentes) */
  nbVariantes: number
  /** taille du premier PDF, en octets */
  taillePdf: number
  miniature: Image
  /** slug du bilan dont cette fiche est une compétence ; null pour une fiche autonome ou un bilan */
  parent: string | null
  personnaliser: LienPersonnaliser | null
  /** entrée d'exemple (développement) : jamais dans un build de production */
  exemple: boolean
  /** texte cherché (titres, descriptions, classes, domaine, compétences), minuscules sans accents */
  recherche: string
}

/** Les valeurs qui existent dans l'index, pour construire les filtres sans parcourir les entrées. */
export interface FiltresIndex {
  classes: Classe[]
  langues: string[]
  usages: Usage[]
  domaines: DomaineDeFiche[]
}

/** `fiches/index.json`. */
export interface IndexFiches {
  version: typeof VERSION_SCHEMA
  /** date ISO 8601 de la génération */
  genereLe: string
  /** site (mode Vite du build : 'ecoleprimaire', 'skoolik', 'exemples'…) */
  site: string
  filtres: FiltresIndex
  /** triées : domaine (rang), usage, puis ordre du registre */
  entrees: EntreeIndex[]
}

// ── Entrée ──

/** Un document de la fiche : une affiche, ou une des fiches d'un exercice (graine propre). */
export interface Variante {
  id: string
  /** « Fiche 2 »… : absent quand il n'y en a qu'une */
  titre: Texte | null
  /** graine qui a tiré les questions ; null pour une affiche */
  graine: number | null
  /** un PDF par format de papier proposé ; le premier est celui par défaut */
  pdfs: FichierPdf[]
  /** aperçu de chaque page, dans l'ordre, au premier format */
  pages: Image[]
}

/** `fiches/<slug>.json` : tout l'index, plus ce que la page d'une fiche affiche. */
export interface Entree extends EntreeIndex {
  descriptionLongue: Texte
  competences: CompetenceVisee[]
  variantes: Variante[]
  /** réglages qui ont produit la fiche (ceux de l'affiche ou du niveau de l'exercice) */
  reglages: Record<string, ValeurReglage>
  /** slugs d'entrées proches : même exercice dans d'autres classes, puis même domaine */
  voisines: string[]
}
