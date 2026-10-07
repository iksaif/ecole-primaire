// Les figures planes — LE dessin (SVG en chaînes, pur : lisible par node). Partagé par l'exercice « Les formes » (maternelle), l'exercice
// « Géométrie » (figures, angles droits) et l'affiche des figures planes (src/affiches/formes/) : un polygone, une marque d'angle
// droit ou d'égalité de côtés se dessine partout de la même façon. Les solides sont dans solides.ts.
//   polygone(points, opts)                    un polygone (fond, trait)
//   marqueAngleDroit(a, b, c, opts)           le petit équerre au sommet b (côtés ba et bc)
//   marqueEgalite(p, q, n) / marqueParallele  n traits au milieu du côté pq / le double chevron des côtés parallèles
//   FIGURES_ICONES[id](fond, marques)         les figures de l'affiche, dans une case de 60 × 60 (avec leurs marques : toutes ou choisies)
//   svgForme(id, opts)                        les quatre formes de la maternelle (disque, carré, triangle, rectangle), dans 100 × 100

export type Point = readonly [number, number]

/** Arrondi à la décimale (la géométrie écrit ses coordonnées ainsi ; l'affiche garde les valeurs exactes). */
export const arrondi1 = (n: number): number => Math.round(n * 10) / 10

export interface OptionsPolygone {
  fond: string
  /** couleur du trait (défaut : noir de l'affiche) */
  trait?: string
  epaisseur?: number
  /** mise en forme des coordonnées (défaut : telles quelles) */
  arrondi?: (n: number) => number
}

/** Un polygone fermé, aux angles arrondis. */
export function polygone(points: readonly Point[], { fond, trait = '#222', epaisseur = 1.2, arrondi = n => n }: OptionsPolygone): string {
  return `<polygon points="${points.map(p => `${arrondi(p[0])},${arrondi(p[1])}`).join(' ')}" fill="${fond}" stroke="${trait}" stroke-width="${epaisseur}" stroke-linejoin="round"/>`
}

export interface OptionsMarque {
  /** longueur des côtés de l'équerre */
  t?: number
  couleur?: string
  epaisseur?: number
  arrondi?: (n: number) => number
}

/** L'angle droit au sommet `b` : une équerre dessinée entre les côtés [b a] et [b c]. */
export function marqueAngleDroit(a: Point, b: Point, c: Point, { t = 5, couleur = '#d9480f', epaisseur = 1, arrondi = n => n }: OptionsMarque = {}): string {
  const lu = Math.hypot(a[0] - b[0], a[1] - b[1]), lw = Math.hypot(c[0] - b[0], c[1] - b[1])
  const u = [(a[0] - b[0]) / lu * t, (a[1] - b[1]) / lu * t], w = [(c[0] - b[0]) / lw * t, (c[1] - b[1]) / lw * t]
  const pt = (x: number, y: number): string => `${arrondi(x)},${arrondi(y)}`
  return `<polyline points="${pt(b[0] + u[0], b[1] + u[1])} ${pt(b[0] + u[0] + w[0], b[1] + u[1] + w[1])} ${pt(b[0] + w[0], b[1] + w[1])}" fill="none" stroke="${couleur}" stroke-width="${epaisseur}"/>`
}

/** `n` petits traits au milieu du côté [p q] : les côtés qui portent le même nombre de traits ont la même longueur. */
export function marqueEgalite(p: Point, q: Point, n: number): string {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy)
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux
  return Array.from({ length: n }, (_, k) => {
    const o = (k - (n - 1) / 2) * 2.2
    return `<line x1="${mx + ux * o - nx * 2.2}" y1="${my + uy * o - ny * 2.2}" x2="${mx + ux * o + nx * 2.2}" y2="${my + uy * o + ny * 2.2}" stroke="#d9480f" stroke-width="1"/>`
  }).join('')
}

/** Côtés parallèles : un double chevron au milieu du côté [p q], pointé de p vers q (le même sens sur les deux côtés). */
export function marqueParallele(p: Point, q: Point): string {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy)
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux, t = 2.2
  return [-1.1, 1.1].map(o => {
    const cx = mx + ux * o, cy = my + uy * o
    return `<polyline points="${cx - ux * t + nx * t},${cy - uy * t + ny * t} ${cx},${cy} ${cx - ux * t - nx * t},${cy - uy * t - ny * t}" fill="none" stroke="#d9480f" stroke-width="1" stroke-linejoin="round"/>`
  }).join('')
}

// ── Les figures de l'affiche : chacune dans une case de 60 × 60, avec ses marques (côtés égaux, angles droits, parallèles) ──

/** Côté de la case de dessin des figures et des solides. */
export const CASE = 60

export const FIGURES_ICONES_IDS = ['disque', 'carre', 'rectangle', 'triangle', 'triangle-rectangle', 'isocele', 'equilateral', 'losange', 'trapeze', 'pentagone', 'hexagone'] as const
export type FigureIcone = typeof FIGURES_ICONES_IDS[number]

const poly = (pts: readonly Point[], fond: string): string => polygone(pts, { fond })
const regulier = (n: number, cx: number, cy: number, r: number, depart: number): Point[] =>
  Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i * (360 / n) + depart) * Math.PI / 180), cy + r * Math.sin((i * (360 / n) + depart) * Math.PI / 180)] as const)

/** Les marques qu'on dessine sur une figure : côtés égaux, angles droits, côtés parallèles, centre et rayon du disque (toutes par défaut). */
export interface Marques { egalite: boolean, angles: boolean, paralleles: boolean, rayon: boolean }
export const TOUTES_MARQUES: Marques = { egalite: true, angles: true, paralleles: true, rayon: true }

export const FIGURES_ICONES: Readonly<Record<FigureIcone, (fond: string, m?: Marques) => string>> = {
  disque: (f, m = TOUTES_MARQUES) => `<circle cx="30" cy="30" r="24" fill="${f}" stroke="#222" stroke-width="1.2"/>${m.rayon ? '<circle cx="30" cy="30" r="1.5" fill="#d9480f"/><line x1="30" y1="30" x2="54" y2="30" stroke="#d9480f" stroke-width="1"/>' : ''}`,
  carre: (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[10, 10], [50, 10], [50, 50], [10, 50]]
    return poly(P, f) + P.map((p, i) => (m.egalite ? marqueEgalite(p, P[(i + 1) % 4], 1) : '') + (m.angles ? marqueAngleDroit(P[(i + 3) % 4], p, P[(i + 1) % 4]) : '')).join('')
  },
  rectangle: (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[4, 14], [56, 14], [56, 46], [4, 46]]
    return poly(P, f) + (m.angles ? P.map((p, i) => marqueAngleDroit(P[(i + 3) % 4], p, P[(i + 1) % 4])).join('') : '')
      + (m.egalite ? marqueEgalite(P[0], P[1], 1) + marqueEgalite(P[2], P[3], 1) + marqueEgalite(P[1], P[2], 2) + marqueEgalite(P[3], P[0], 2) : '')
  },
  triangle: f => poly([[8, 50], [52, 50], [24, 8]], f),
  'triangle-rectangle': (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[10, 50], [50, 50], [10, 10]]
    return poly(P, f) + (m.angles ? marqueAngleDroit(P[2], P[0], P[1]) : '')
  },
  isocele: (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[8, 50], [52, 50], [30, 8]]
    return poly(P, f) + (m.egalite ? marqueEgalite(P[0], P[2], 2) + marqueEgalite(P[2], P[1], 2) : '')
  },
  equilateral: (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[8, 49], [52, 49], [30, 11]]
    return poly(P, f) + (m.egalite ? marqueEgalite(P[0], P[1], 1) + marqueEgalite(P[1], P[2], 1) + marqueEgalite(P[2], P[0], 1) : '')
  },
  losange: (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[30, 6], [54, 30], [30, 54], [6, 30]]
    return poly(P, f) + (m.egalite ? P.map((p, i) => marqueEgalite(p, P[(i + 1) % 4], 1)).join('') : '')
  },
  trapeze: (f, m = TOUTES_MARQUES) => {
    const P: Point[] = [[4, 48], [56, 48], [44, 14], [18, 14]]
    return poly(P, f) + (m.paralleles ? marqueParallele(P[0], P[1]) + marqueParallele(P[3], P[2]) : '')
  },
  pentagone: f => poly(regulier(5, 30, 31, 25, -90), f),
  hexagone: f => poly(regulier(6, 30, 30, 25, 0), f),
}

// ── Les quatre formes de la maternelle : le disque, le carré, le triangle, le rectangle, dans une case de 100 × 100 ──

export const FORMES_MATERNELLE_IDS = ['disque', 'carre', 'triangle', 'rectangle'] as const
export type FormeMaternelle = typeof FORMES_MATERNELLE_IDS[number]

// le dessin de chaque forme et sa couleur ordinaire ; `{fill}` : l'endroit où l'on pose le remplissage
const CORPS_FORMES: Readonly<Record<FormeMaternelle, { fond: string, dessin: (remplissage: string) => string }>> = {
  disque: { fond: '#4a90e2', dessin: r => `<circle cx="50" cy="50" r="40" ${r}/>` },
  carre: { fond: '#e74c3c', dessin: r => `<rect x="15" y="15" width="70" height="70" ${r}/>` },
  triangle: { fond: '#2ecc71', dessin: r => `<polygon points="50,10 90,90 10,90" ${r}/>` },
  rectangle: { fond: '#f39c12', dessin: r => `<rect x="10" y="25" width="80" height="50" ${r}/>` },
}

export interface OptionsForme {
  /** côté du carré qui contient la forme (défaut : 100) */
  taille?: number
  /** rotation en degrés : écrite dans le style (absente : la forme reste droite, sans style) */
  angle?: number
  /** remplissage (défaut : la couleur ordinaire de la forme) ; ignoré pour un contour */
  fond?: string
  /** forme au trait, à colorier */
  contour?: boolean
}

/** Une forme de la maternelle : pleine (légèrement transparente) ou, avec `contour`, au trait à colorier. */
export function svgForme(forme: FormeMaternelle, { taille = 100, angle, fond, contour = false }: OptionsForme = {}): string {
  const c = CORPS_FORMES[forme]
  const remplissage = contour ? 'fill="none" stroke="#222" stroke-width="3.5" stroke-linejoin="round"' : `fill="${fond ?? c.fond}" opacity=".85"`
  const style = angle === undefined ? '' : ` style="transform: rotate(${angle}deg)"`
  return `<svg viewBox="0 0 100 100" width="${taille}" height="${taille}"${style}>${c.dessin(remplissage)}</svg>`
}
