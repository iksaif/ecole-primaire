// Les motifs organisés (cycle 1, programme.ts : motifs-maternelle) : types par niveau et suites. Pur, sans dépendance (lisible par node).
// Un motif est une suite d'indices (0, 1, 2…) dans une liste d'éléments (couleurs, images).
//   PS : alternance AB (BO n° 41 p. 71 : « motif répétitif très simple ») ;
//   MS : motifs répétitifs AB, ABB, AAB, ABC ;
//   GS : + AABB, ABCD et motifs évolutifs (A B AA BB AAA BBB…), réservés à 5 ans (p. 70).
import type { Classe, Rng } from '../../noyau/types.ts'

export type TypeMotif = 'AB' | 'ABB' | 'AAB' | 'ABC' | 'AABB' | 'ABCD' | 'evolutif'

export const TYPES_DU_NIVEAU: Readonly<Partial<Record<Classe, readonly TypeMotif[]>>> = {
  ps: ['AB'],
  ms: ['AB', 'ABB', 'AAB', 'ABC'],
  gs: ['AB', 'ABB', 'AAB', 'ABC', 'AABB', 'ABCD', 'evolutif'],
}
const LETTRES = 'ABCD'

/** Les `n` premiers éléments d'un motif (indices) ; « evolutif » : A B AA BB AAA BBB… */
export function suite(type: TypeMotif, n: number): number[] {
  if (type === 'evolutif') {
    const res: number[] = []
    for (let k = 1; res.length < n; k++) for (const e of [0, 1]) for (let i = 0; i < k && res.length < n; i++) res.push(e)
    return res
  }
  const periode = [...type].map(c => LETTRES.indexOf(c))
  return Array.from({ length: n }, (_, i) => periode[i % periode.length])
}

/** Nombre d'éléments différents d'un motif. */
export const nbElements = (type: TypeMotif): number => (type === 'evolutif' ? 2 : new Set(type).size)

export type ModeMotif = 'apres' | 'trou'

/** Le motif montré, sa « case ? » et l'élément attendu (indice dans la liste d'éléments). */
export interface QuestionMotif { type: TypeMotif, motif: number[], place: number, attendu: number }

/** Une question : le motif montré, l'élément attendu et sa place (« apres » : à la fin ; « trou » : au milieu). */
export function questionMotif(niveau: Classe, mode: ModeMotif, rng: Rng): QuestionMotif {
  const types = TYPES_DU_NIVEAU[niveau] ?? TYPES_DU_NIVEAU.ms!
  const type = types[rng.entier(0, types.length - 1)]
  // au moins deux périodes et demie visibles (PS : 6 éléments)
  const visibles = type === 'evolutif' ? 9 : Math.max(niveau === 'ps' ? 6 : 7, Math.ceil(type.length * 2.5))
  const s = suite(type, visibles + 1)
  if (mode === 'trou') {
    const place = type.length + rng.entier(0, Math.max(1, visibles - 2 * type.length) - 1)
    return { type, motif: s.slice(0, visibles), place, attendu: s[place] }
  }
  return { type, motif: s.slice(0, visibles), place: visibles, attendu: s[visibles] }
}
