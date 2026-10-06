// Parcours et lecture des fichiers du dépôt. Les chemins rendus sont RELATIFS à la racine, avec des « / » (« src/views/A.vue ») :
// c'est la forme que les compteurs de qualité comparent, et celle des messages.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chemin, racine } from './racine.ts'

/** Les fichiers d'un dossier du dépôt (récursif), triés par le système de fichiers ; `extensions` : sans le point, ex. `['js', 'ts']`. */
export function listerFichiers(dossier: string, extensions: readonly string[]): string[] {
  return readdirSync(chemin(dossier)).flatMap(nom => {
    const relatif = `${dossier}/${nom}`
    if (statSync(chemin(relatif)).isDirectory()) return listerFichiers(relatif, extensions)
    return extensions.some(e => nom.endsWith(`.${e}`)) ? [relatif] : []
  })
}

/** Le texte d'un fichier du dépôt (chemin relatif à la racine). */
export const lire = (fichier: string): string => readFileSync(join(racine, fichier), 'utf8')

/** Nombre de correspondances d'une expression globale (`/x/g`) dans un texte. */
export const compter = (texte: string, re: RegExp): number => (texte.match(re) ?? []).length
