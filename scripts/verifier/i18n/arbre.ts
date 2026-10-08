// Lire un catalogue de textes comme une liste de « feuilles » (clé pointée → texte), et l'afficher dans la relecture.
import { CODES, LANGUE_SOURCE } from '../../../src/langues/registre.ts'
// Les fonctions de lecture vivent dans src/langues/relecture.ts (pur : la page /dev/relecture-breton les lit aussi).
export type { Arbre } from '../../../src/langues/relecture.ts'
export { feuilles, texteBrut as texte } from '../../../src/langues/relecture.ts'

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
