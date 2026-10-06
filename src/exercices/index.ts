// LE registre des exercices de la base saine (modèle : src/exercices/exemple/). Un seul, en TypeScript : l'app, le build des
// fiches (scripts/fiches/registres.ts), les tests (exercices, instantanés, noyau) et la page /dev le lisent.
//   - exercices réels : la liste BASE ci-dessous (`npm run nouveau -- exercice …` y inscrit le nouveau) ;
//   - exemples (exemple, exemple-corpus) : marqués `exemple: true`, chargés seulement si AVEC_DEV (src/dev.ts) par import
//     dynamique : ni leurs modules ni leurs textes n'entrent dans un build de production.
// Les anciens exercices (JavaScript, format de l'ancien monde) sont dans ancien.js, hors de ce registre, tant qu'ils ne sont
// pas reportés ; un exercice reporté passe de ancien.js à BASE.
// Les vues n'importent pas ce registre (il entraînerait tous les générateurs) : chacune importe son dossier.
import type { ModuleExercice } from '../noyau/types.ts'
import { AVEC_DEV } from '../dev.ts'
import { module as calculMental } from './calcul-mental/index.ts'
// nouveau:imports

/** Un exercice, quelles que soient ses questions et ses réglages (le registre les mêle ; chaque module reste typé précisément). */
export type ModuleQuelconque = ModuleExercice<any, any, any, any>

/** Une entrée du registre : un exercice ; `exemple: true` pour les exemples (jamais en production, jamais au catalogue public). */
export type EntreeRegistre = ModuleQuelconque & { readonly exemple?: true }

// Exercices réels de la base (un exercice reporté de ancien.js y entre).
const BASE: readonly EntreeRegistre[] = [
  calculMental,
  // nouveau:registre
]

// Les exemples : import dynamique, absent d'un build de production
// La condition est écrite ici avec les littéraux de Vite (src/dev.ts explique pourquoi) ; node n'a pas `import.meta.env` : AVEC_DEV.
const EXEMPLES: readonly EntreeRegistre[] = (import.meta.env ? (import.meta.env.DEV || import.meta.env.VITE_AVEC_DEV) : AVEC_DEV) ? (await import('./dev.ts')).EXEMPLES : []

export const REGISTRE: readonly EntreeRegistre[] = [...BASE, ...EXEMPLES]

/** L'exercice d'identifiant `id`, ou null. */
export const exerciceDe = (id: string): EntreeRegistre | null => REGISTRE.find(e => e.definition.id === id) ?? null
