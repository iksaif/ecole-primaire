// Types internes du build des fiches : ce qui passe d'un module à l'autre (registres → rendu → assemblage → écriture).
// Le schéma publié (ce qui est écrit dans les JSON) est dans src/telechargements/types.ts.
import type { Entree, Format, Orientation, Texte, Variante } from '../../../src/telechargements/types.ts'

/** Ce que l'entrée sait avant tout rendu : tout sauf les fichiers, les tailles et les liens entre entrées. */
export type MetaFiche = Pick<Entree,
  'slug' | 'titre' | 'titreCourt' | 'description' | 'descriptionLongue' | 'niveaux' | 'domaine' | 'genre' | 'langues'
  | 'parent' | 'personnaliser' | 'exemple' | 'competences' | 'reglages' | 'confiance'> & {
  /** exercice ou affiche d'où vient la fiche : sert à rapprocher les voisines (pas publié) */
  famille: string
}

/** Un document à produire (une variante) : un HTML complet par format de papier et par sens. */
export interface DocumentSource {
  id: string
  titre: Texte | null
  graine: number | null
  /** le premier format est celui par défaut (et celui des aperçus) */
  formats: { format: Format, orientation: Orientation, html: string }[]
}

/** Une fiche telle que les registres la décrivent : métadonnées et documents. */
export interface FicheSource {
  meta: MetaFiche
  documents: DocumentSource[]
}

/** Un fichier à écrire dans `<outDir>/fiches/`, chemin relatif à ce dossier. */
export interface FichierRendu {
  chemin: string
  octets: Uint8Array
}

/** Le rendu d'un document par le navigateur. */
export interface DocumentRendu {
  /** un PDF par format et par sens, dans l'ordre de `formats` */
  pdfs: { format: Format, orientation: Orientation, octets: Uint8Array, nbPages: number }[]
  /** aperçu de chaque page (JPEG), au premier format */
  pages: { octets: Uint8Array, largeur: number, hauteur: number }[]
}

/** Une fiche rendue : les fichiers à écrire, et la variante qui les décrit dans le JSON. */
export interface FicheRendue {
  source: FicheSource
  variantes: Variante[]
  fichiers: FichierRendu[]
  miniature: { chemin: string, largeur: number, hauteur: number }
}
