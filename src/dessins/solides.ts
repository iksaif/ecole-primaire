// Les solides — LE dessin (SVG en chaînes, pur : lisible par node). Partagé par l'exercice « Géométrie » (jeu et fiche) et l'affiche des
// solides (src/affiches/formes/) : un cube, un cylindre… se dessine partout pareil. Perspective cavalière (fuyantes vers le haut à
// droite), arêtes cachées en pointillés (programme du CE2) : on dessine les faces vues, puis les arêtes qui partent du sommet caché.
//   solide(id, fond)   le dessin d'un solide dans une case de 60 × 60 (CASE, figures.ts), à mettre dans un <svg viewBox="0 0 60 60">
//   svgSolide(id, taille, fond)   le <svg> complet, `taille` en pixels

import { CASE } from './figures.ts'
import type { Point } from './figures.ts'

export const SOLIDES_IDS = ['cube', 'pave', 'boule', 'cylindre', 'cone', 'pyramide', 'prisme'] as const
export type SolideId = typeof SOLIDES_IDS[number]

const trait = (p: Point, q: Point, pointille: boolean): string =>
  `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#222" stroke-width="1.2"${pointille ? ' stroke-dasharray="2.5 2"' : ''}/>`
const face = (pts: readonly Point[], fond: string, opacite?: string): string =>
  `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fond}"${opacite ? ` fill-opacity="${opacite}"` : ''} stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`

// cube et pavé : faces avant, dessus et droite vues ; sommet caché = arrière en bas à gauche (b[3])
function boite(a: readonly Point[], d: number, f: string): string {
  const b = a.map(([x, y]) => [x + d, y - d] as const)
  return face(a, f) + face([a[0], b[0], b[1], a[1]], f, '.7') + face([a[1], b[1], b[2], a[2]], f, '.45')
    + trait(a[3], b[3], true) + trait(b[3], b[2], true) + trait(b[3], b[0], true)
}

const DESSINS: Readonly<Record<SolideId, (f: string) => string>> = {
  cube: f => boite([[8, 22], [38, 22], [38, 52], [8, 52]], 14, f),
  pave: f => boite([[4, 24], [42, 24], [42, 50], [4, 50]], 14, f),
  boule: f => `<circle cx="30" cy="30" r="24" fill="${f}" stroke="#222" stroke-width="1.2"/><ellipse cx="30" cy="30" rx="24" ry="7" fill="none" stroke="#222" stroke-width=".8" stroke-dasharray="2.5 2"/>`,
  cylindre: f => `<path d="M10 14 v32 a20 7 0 0 0 40 0 v-32" fill="${f}" stroke="#222" stroke-width="1.2"/><ellipse cx="30" cy="14" rx="20" ry="7" fill="${f}" fill-opacity=".6" stroke="#222" stroke-width="1.2"/>`,
  cone: f => `<path d="M10 44 L30 6 L50 44 a20 7 0 0 1 -40 0" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 44 a20 7 0 0 0 40 0" fill="none" stroke="#222" stroke-width=".8" stroke-dasharray="2.5 2"/>`,
  pyramide: f => {
    const base: Point[] = [[8, 44], [38, 44], [52, 34], [22, 34]], s: Point = [30, 6]
    return face([base[0], base[1], s], f) + face([base[1], base[2], s], f, '.55')
      + trait(base[0], base[3], true) + trait(base[3], base[2], true) + trait(base[3], s, true)
  },
  prisme: f => {
    // triangle avant a, triangle arrière b ; faces vues : le triangle avant et le rectangle de droite (a1 b1 b2 a2) ;
    // sommet caché : b[0] (arrière en bas à gauche) → 3 arêtes cachées
    const a: Point[] = [[6, 46], [36, 46], [21, 22]], d = 16, b = a.map(([x, y]) => [x + d, y - d + 4] as const)
    return face(a, f) + face([a[1], b[1], b[2], a[2]], f, '.5') + trait(b[0], a[0], true) + trait(b[0], b[1], true) + trait(b[0], b[2], true)
  },
}

/** Le solide `id` rempli de `fond`, dans une case de 60 × 60. */
export const solide = (id: SolideId, fond: string): string => DESSINS[id](fond)

/** Le solide dans son <svg> (carré de `taille` pixels). */
export const svgSolide = (id: SolideId, taille: number, fond: string): string =>
  `<svg viewBox="0 0 ${CASE} ${CASE}" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${solide(id, fond)}</svg>`
