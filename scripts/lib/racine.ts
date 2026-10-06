// La racine du dépôt et un raccourci pour y construire des chemins : tous les scripts de scripts/ lisent des fichiers du
// dépôt, et aucun ne doit dépendre du dossier d'où on le lance (npm run, CI ou à la main).
import { join } from 'node:path'

/** Dossier racine du dépôt (scripts/lib/ est à deux niveaux). */
export const racine: string = join(import.meta.dirname, '..', '..')

/** Chemin absolu d'un fichier ou dossier du dépôt : `chemin('src', 'noyau', 'ids.ts')`. */
export const chemin = (...morceaux: string[]): string => join(racine, ...morceaux)
