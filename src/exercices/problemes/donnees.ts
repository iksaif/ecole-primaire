// Problèmes — les données partagées par la définition et le générateur : catégories offertes par niveau, champs numériques,
// tables de multiplication. Pur.
import type { Categorie } from './contexte.ts'

const COMMUNES = ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage'] as const satisfies readonly Categorie[]
/** Les catégories de problèmes offertes par niveau (« fois plus » et les produits par 10 et 100 : CE2). */
export const CATEGORIES_CE1 = [...COMMUNES, 'deuxEtapes'] as const satisfies readonly Categorie[]
export const CATEGORIES_CE2 = [...COMMUNES, 'foisPlus', 'deuxEtapes'] as const satisfies readonly Categorie[]
export const CATEGORIES: Readonly<Record<string, readonly Categorie[]>> = { ce1: CATEGORIES_CE1, ce2: CATEGORIES_CE2 }

/** Plus grand nombre des données, par plage (réglage `plage`). */
export const PLAGES = { petits: 20, moyens: 100, grands: 1000, tresGrands: 10000 } as const
export type Plage = keyof typeof PLAGES

/** Tables de multiplication utilisées par niveau (programme : tables de 2, 3, 4, 5 et 10 au CE1). */
export const TABLES: Readonly<Record<string, readonly number[]>> = { ce1: [2, 3, 4, 5, 10], ce2: [2, 3, 4, 5, 6, 7, 8, 9, 10] }
