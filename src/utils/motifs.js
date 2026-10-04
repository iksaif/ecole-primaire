// Motifs organisés (cycle 1, programme.js : motifs-maternelle). Fonctions pures, sans dépendance (lues aussi par
// node dans les tests). Un motif est une suite d'indices (0, 1, 2…) dans une liste d'éléments (couleurs, images).
//   PS : alternance AB (BO n° 41 p. 71 : « motif répétitif très simple ») ;
//   MS : motifs répétitifs AB, ABB, AAB, ABC ;
//   GS : + AABB, ABCD et motifs évolutifs (A B AA BB AAA BBB…), réservés à 5 ans (p. 70).
export const TYPES_DU_NIVEAU = {
  ps: ['AB'],
  ms: ['AB', 'ABB', 'AAB', 'ABC'],
  gs: ['AB', 'ABB', 'AAB', 'ABC', 'AABB', 'ABCD', 'evolutif'],
}
const LETTRES = 'ABCD'

// Les n premiers éléments d'un motif (indices) ; « evolutif » : A B AA BB AAA BBB…
export function suite(type, n) {
  if (type === 'evolutif') {
    const res = []
    for (let k = 1; res.length < n; k++) for (const e of [0, 1]) for (let i = 0; i < k && res.length < n; i++) res.push(e)
    return res
  }
  const periode = [...type].map(c => LETTRES.indexOf(c))
  return Array.from({ length: n }, (_, i) => periode[i % periode.length])
}

// nombre d'éléments différents d'un motif
export const nbElements = type => (type === 'evolutif' ? 2 : new Set(type).size)
// longueur de la période (evolutif : pas de période)
export const periode = type => (type === 'evolutif' ? Infinity : type.length)

// Une question : le motif montré, l'élément attendu (indice) et sa place (« apres » : à la fin ; « trou » : au milieu)
// alea : fonction qui renvoie un nombre dans [0, 1[ (Math.random par défaut)
export function question(niveau, mode = 'apres', alea = Math.random) {
  const types = TYPES_DU_NIVEAU[niveau] ?? TYPES_DU_NIVEAU.ms
  const type = types[Math.floor(alea() * types.length)]
  // au moins deux périodes et demie visibles (PS : 6 éléments)
  const visibles = type === 'evolutif' ? 9 : Math.max(niveau === 'ps' ? 6 : 7, Math.ceil(type.length * 2.5))
  const s = suite(type, visibles + 1)
  if (mode === 'trou') {
    const place = type.length + Math.floor(alea() * Math.max(1, visibles - 2 * type.length))
    return { type, motif: s.slice(0, visibles), place, attendu: s[place] }
  }
  return { type, motif: s.slice(0, visibles), place: visibles, attendu: s[visibles] }
}
