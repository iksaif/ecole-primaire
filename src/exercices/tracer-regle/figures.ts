// Tracer à la règle — la géométrie des points : les figures à reproduire (sommets sur les points d'un papier pointé ou d'un quadrillage), et ce
// qu'il faut pour comparer deux tracés (segments élémentaires, translation). Pur.

/** Un point. Sur papier pointé : colonne et ligne d'un point de la grille ; pour les points alignés : des millimètres. */
export interface Pt { x: number, y: number }

/** Une figure à reproduire : ses sommets, dans l'ordre du tracé (la figure se referme), et le nom de la figure du programme qu'elle est. */
export interface FigureAReproduire {
  id: string
  sommets: readonly Pt[]
  /** la figure de référence du programme (src/data/programme.ts, FIGURES_*) ; `null` pour un assemblage (maison, flèche…) */
  programme: 'carre' | 'rectangle' | 'triangle' | 'triangle-rectangle' | 'losange' | null
  /**
   * la première classe qui la reproduit : au CP, les carrés et les rectangles suivent les lignes (c2maths p. 32) ; au CE1, « les côtés
   * peuvent suivre les lignes du quadrillage ou être obliques » et le triangle rectangle arrive (p. 34)
   */
  depuis: 'cp' | 'ce1' | 'ce2'
}

const p = (x: number, y: number): Pt => ({ x, y })

// CP : « les rectangles et les carrés ont des côtés qui suivent les lignes du quadrillage » (c2maths p. 32) ; triangles et assemblages
// (« un carré, un rectangle, un triangle ou un assemblage de ces figures »)
export const FIGURES: readonly FigureAReproduire[] = [
  { id: 'carre', sommets: [p(0, 0), p(3, 0), p(3, 3), p(0, 3)], programme: 'carre', depuis: 'cp' },
  { id: 'petit-carre', sommets: [p(0, 0), p(2, 0), p(2, 2), p(0, 2)], programme: 'carre', depuis: 'cp' },
  { id: 'rectangle', sommets: [p(0, 0), p(4, 0), p(4, 2), p(0, 2)], programme: 'rectangle', depuis: 'cp' },
  { id: 'rectangle-debout', sommets: [p(0, 0), p(2, 0), p(2, 4), p(0, 4)], programme: 'rectangle', depuis: 'cp' },
  { id: 'triangle', sommets: [p(0, 3), p(2, 0), p(4, 3)], programme: 'triangle', depuis: 'cp' },
  { id: 'triangle-coin', sommets: [p(0, 0), p(3, 3), p(0, 3)], programme: 'triangle', depuis: 'cp' },
  { id: 'maison', sommets: [p(0, 4), p(0, 2), p(2, 0), p(4, 2), p(4, 4)], programme: null, depuis: 'cp' },
  { id: 'escalier', sommets: [p(0, 0), p(1, 0), p(1, 1), p(2, 1), p(2, 2), p(3, 2), p(3, 3), p(0, 3)], programme: null, depuis: 'cp' },
  { id: 'l', sommets: [p(0, 0), p(1, 0), p(1, 3), p(3, 3), p(3, 4), p(0, 4)], programme: null, depuis: 'cp' },
  // CE1 : carrés et rectangles aux côtés obliques, triangle rectangle, assemblages obliques
  { id: 'carre-penche', sommets: [p(1, 0), p(3, 1), p(2, 3), p(0, 2)], programme: 'carre', depuis: 'ce1' },
  { id: 'rectangle-penche', sommets: [p(0, 1), p(1, 0), p(4, 3), p(3, 4)], programme: 'rectangle', depuis: 'ce1' },
  { id: 'triangle-rectangle-penche', sommets: [p(0, 2), p(2, 0), p(4, 2)], programme: 'triangle-rectangle', depuis: 'ce1' },
  { id: 'fleche', sommets: [p(0, 1), p(2, 1), p(2, 0), p(4, 2), p(2, 4), p(2, 3), p(0, 3)], programme: null, depuis: 'ce1' },
  // CE2 : le losange (« reconnaitre, nommer et décrire […] le losange », c2maths p. 36) ; quatre côtés de même longueur, sans angle droit
  { id: 'losange', sommets: [p(0, 2), p(2, 1), p(4, 2), p(2, 3)], programme: 'losange', depuis: 'ce2' },
  { id: 'losange-debout', sommets: [p(1, 0), p(2, 2), p(1, 4), p(0, 2)], programme: 'losange', depuis: 'ce2' },
]

/** Le plus grand commun diviseur (positif) de deux entiers. */
function pgcd(a: number, b: number): number {
  let x = Math.abs(a), y = Math.abs(b)
  while (y) [x, y] = [y, x % y]
  return x
}

/** La clé d'un segment élémentaire, la même dans les deux sens. */
function cleSegment(a: Pt, b: Pt): string {
  const [u, v] = a.x < b.x || (a.x === b.x && a.y < b.y) ? [a, b] : [b, a]
  return `${u.x},${u.y}-${v.x},${v.y}`
}

/**
 * Les segments élémentaires d'un tracé (une suite de points reliés dans l'ordre) : un segment qui passe par d'autres points de la grille est
 * coupé à chacun d'eux. Deux tracés qui dessinent les mêmes traits ont les mêmes segments, quel que soit l'ordre des clics.
 */
export function segmentsElementaires(trace: readonly Pt[]): Set<string> {
  const res = new Set<string>()
  for (let i = 1; i < trace.length; i++) {
    const a = trace[i - 1], b = trace[i]
    const n = pgcd(b.x - a.x, b.y - a.y)
    if (n === 0) continue   // le même point touché deux fois
    const pas = { x: (b.x - a.x) / n, y: (b.y - a.y) / n }
    for (let k = 0; k < n; k++) res.add(cleSegment(p(a.x + k * pas.x, a.y + k * pas.y), p(a.x + (k + 1) * pas.x, a.y + (k + 1) * pas.y)))
  }
  return res
}

/** Le polygone refermé : ses sommets, puis le premier sommet. */
export const referme = (sommets: readonly Pt[]): Pt[] => [...sommets, sommets[0]]

/** Les segments ramenés au coin en haut à gauche de leur dessin : deux figures égales à une translation près ont la même liste. */
export function aLOrigine(segments: ReadonlySet<string>): string[] {
  const nombres = [...segments].map(s => s.split(/[-,]/).map(Number))
  const minX = Math.min(...nombres.map(n => Math.min(n[0], n[2])))
  const minY = Math.min(...nombres.map(n => Math.min(n[1], n[3])))
  return nombres.map(([x1, y1, x2, y2]) => `${x1 - minX},${y1 - minY}-${x2 - minX},${y2 - minY}`).sort()
}

/** Le tracé reproduit-il la figure, à une translation près ? */
export function memeFigure(trace: readonly Pt[], sommets: readonly Pt[]): boolean {
  const traces = segmentsElementaires(trace)
  if (!traces.size) return false
  return aLOrigine(traces).join(' ') === aLOrigine(segmentsElementaires(referme(sommets))).join(' ')
}

/** La largeur et la hauteur d'une liste de points (en unités de la grille). */
export function encombrement(points: readonly Pt[]): { largeur: number, hauteur: number } {
  const xs = points.map(q => q.x), ys = points.map(q => q.y)
  return { largeur: Math.max(...xs) - Math.min(...xs), hauteur: Math.max(...ys) - Math.min(...ys) }
}

export const memePoint = (a: Pt, b: Pt): boolean => a.x === b.x && a.y === b.y
export const ajoute = (a: Pt, b: Pt): Pt => p(a.x + b.x, a.y + b.y)
export const retire = (a: Pt, b: Pt): Pt => p(a.x - b.x, a.y - b.y)
