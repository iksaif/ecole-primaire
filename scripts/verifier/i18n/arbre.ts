// Lire un catalogue de textes comme une liste de « feuilles » (clé pointée → texte), et l'afficher dans la relecture.
import { CODES, LANGUE_SOURCE } from '../../../src/langues/registre.ts'
// Une feuille est un texte, une liste de textes ou un pluriel (objet avec `other`) : en dessous, c'est un sous-arbre.
export interface Arbre { [cle: string]: unknown }

const estFeuille = (v: unknown): boolean =>
  typeof v === 'string' || Array.isArray(v) || (typeof v === 'object' && v !== null && 'other' in v)

/** Les feuilles d'un catalogue, clés pointées : `{ a: { b: 'x' } }` → `[['a.b', 'x']]`. */
export function feuilles(arbre: Arbre, prefixe = ''): [string, unknown][] {
  return Object.entries(arbre).flatMap(([k, v]): [string, unknown][] =>
    estFeuille(v) ? [[prefixe + k, v]] : feuilles(v as Arbre, `${prefixe}${k}.`))
}

/** Le texte d'une valeur de catalogue, tel qu'on l'affiche dans le tableau de relecture. */
export function texte(v: unknown): string {
  if (typeof v === 'function') return `ƒ ${v.toString().replace(/\s+/g, ' ')}`
  if (Array.isArray(v)) return v.join(' · ')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

/** Ce que chaque vérification rend : ses comptes, et les lignes du tableau de relecture (vides sans `--relecture`). */
export interface Bilan {
  /** textes du catalogue français */
  textes: number
  /** textes bretons marqués « br: à relire » */
  aRelire: number
  /** catalogues ou clés en désaccord : fait échouer la commande */
  problemes: number
  lignes: string[]
}

/** La langue comparée au français (la première autre langue du registre). */
export const AUTRE = CODES.find(c => c !== LANGUE_SOURCE) ?? LANGUE_SOURCE
