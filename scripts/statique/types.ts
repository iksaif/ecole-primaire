// Types des pages statiques : ce que les modules se passent. Tout est pur et sérialisable ; le contexte est construit une
// fois (lire.ts) et lu par chaque gabarit.
import type { Langue } from '../../src/langues/registre.ts'
import type { Site } from '../../src/sites.ts'
import type { Entree, IndexFiches } from '../../src/telechargements/types.ts'

/** Un fichier à écrire : chemin relatif à `<outDir>` et contenu. */
export interface FichierStatique {
  chemin: string
  contenu: string
}

/** Tout ce qu'un gabarit lit. */
export interface ContexteStatique {
  site: Site
  /** base de l'app dans le site, avec les barres (« / » sur les VPS) ; lue dans le `index.html` construit */
  base: string
  /** `<outDir>/index.html` construit par Vite : les balises de l'app (script d'entrée, styles, icônes) */
  modele: string
  index: IndexFiches
  /** les entrées, par slug (une par fiche de l'index, jamais d'exemple sans `avecExemples`) */
  entrees: ReadonlyMap<string, Entree>
  /** date (AAAA-MM-JJ) de `index.genereLe` : `lastmod` du sitemap et `dateModified` */
  date: string
  avecExemples: boolean
}

/** Une page statique à écrire, et ce que le sitemap et les tests en savent. */
export interface PageStatique {
  /** chemin de l'adresse publique, sans base, avec barre finale : `telechargements/<slug>/` */
  adresse: string
  /** `<html lang>` */
  langue: Langue
  /** adresse absolue de référence (canonical) */
  canonique: string
  /** titre du document, et description : ceux de l'entrée */
  titre: string
  description: string
  html: string
}
