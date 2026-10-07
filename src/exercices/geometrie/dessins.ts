// La géométrie — dessins SVG (chaînes, purs : écran, fiche et corrigé) : figures, cercle, patron, quadrillage. Les figures (polygone,
// angle droit) et les solides sont ceux de src/dessins/ (partagés avec l'exercice « Les formes » et l'affiche des figures planes).
import { arrondi1, marqueAngleDroit, polygone } from '../../dessins/figures.ts'
import { svgSolide as svgSolideCommun } from '../../dessins/solides.ts'
import type { SolideGeo } from './donnees.ts'
import { dek, LETTRES } from './quadrillage.ts'
import type { QCercle, QSolide } from './types.ts'

const f1 = arrondi1
const FOND_FIGURE = '#ffe08a'
const TRAIT_FIGURE = '#2c3e50'

/** Une figure : polygone ou cercle, avec les lettres des sommets (`lettres`) et les angles droits marqués (`marquerAngles`). */
export function svgFigure(q: { forme: string, points: readonly [number, number][], rayon: number, anglesDroits: readonly number[], lettres?: readonly string[] },
  marquerAngles = false, taille = 220): string {
  let corps = ''
  const lettres = q.lettres || null
  if (q.forme === 'cercle') {
    corps = `<circle cx="100" cy="100" r="${q.rayon}" fill="${FOND_FIGURE}" stroke="${TRAIT_FIGURE}" stroke-width="3"/>`
  } else {
    const pts = q.points
    corps = polygone(pts, { fond: FOND_FIGURE, trait: TRAIT_FIGURE, epaisseur: 3, arrondi: f1 })
    if (lettres) {
      const gx = pts.reduce((a, p) => a + p[0], 0) / pts.length, gy = pts.reduce((a, p) => a + p[1], 0) / pts.length
      pts.forEach((P, i) => {
        const dx = P[0] - gx, dy = P[1] - gy, l = Math.hypot(dx, dy) || 1
        corps += `<text x="${f1(P[0] + dx / l * 15)}" y="${f1(P[1] + dy / l * 15)}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="17" font-weight="bold" fill="#1a5fb4">${lettres[i]}</text>`
      })
    }
    if (marquerAngles) {
      const n = pts.length
      for (const i of q.anglesDroits) corps += marqueAngleDroit(pts[(i + n - 1) % n], pts[i], pts[(i + 1) % n], { t: 13, couleur: '#e74c3c', epaisseur: 2, arrondi: f1 })
    }
  }
  const vb = lettres ? '-15 -15 230 230' : '0 0 200 200'
  return `<svg viewBox="${vb}" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`
}

/** Cercle de centre O (CE2). Positions de base (degrés) : diamètre 200°/20°, rayon 110°, corde 250°/350°. */
export function svgCercle(q: Pick<QCercle, 'sous' | 'rot' | 'pts' | 'cible'>, taille = 220): string {
  const R = 70
  const pt = (deg: number): [number, number] => { const a = (deg + q.rot) * Math.PI / 180; return [f1(100 + R * Math.cos(a)), f1(100 + R * Math.sin(a))] }
  const lab = (deg: number, l: string): string => { const a = (deg + q.rot) * Math.PI / 180; return `<text x="${f1(100 + (R + 15) * Math.cos(a))}" y="${f1(100 + (R + 15) * Math.sin(a))}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="16" font-weight="bold" fill="#1a5fb4">${l}</text>` }
  const pointSur = (deg: number, l: string): string => { const [x, y] = pt(deg); return `<circle cx="${x}" cy="${y}" r="3.5" fill="#2c3e50"/>` + lab(deg, l) }
  const seg = (A: readonly number[], B: readonly number[], coul = '#2c3e50'): string => `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${coul}" stroke-width="3" stroke-linecap="round"/>`
  const O = [100, 100], { a, b, c, d, e } = q.pts
  let s = `<circle cx="100" cy="100" r="${R}" fill="#eaf4ff" stroke="#2c3e50" stroke-width="3"/>`
  if (q.sous === 'centre') s += seg(O, pt(110), '#999') + pointSur(110, a)
  if (q.sous === 'segment') {
    if (q.cible === 'rayon') s += seg(O, pt(110), '#e74c3c') + pointSur(110, a)
    else s += seg(pt(200), pt(20), '#e74c3c') + pointSur(200, b) + pointSur(20, c)
  }
  if (q.sous === 'lequel') {
    s += seg(O, pt(110)) + seg(pt(200), pt(20)) + seg(pt(250), pt(350))
      + pointSur(110, a) + pointSur(200, b) + pointSur(20, c) + pointSur(250, d) + pointSur(350, e)
  }
  if (q.sous === 'mesure') s += seg(O, pt(110), '#999')
  // centre O (étiquette décalée pour ne pas chevaucher les segments)
  const ao = (155 + q.rot) * Math.PI / 180
  s += `<circle cx="100" cy="100" r="3.5" fill="#2c3e50"/><text x="${f1(100 + 14 * Math.cos(ao))}" y="${f1(100 + 14 * Math.sin(ao))}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="16" font-weight="bold" fill="#c0392b">O</text>`
  return `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}

/** Patron : cases en px (écran) ou en cm (impression, unite = 'cm'). */
export function svgPatron(cells: readonly (readonly [number, number])[], { cote = 36, unite = '' }: { cote?: number, unite?: string } = {}): string {
  const cols = Math.max(...cells.map(p => p[0])) + 1, rows = Math.max(...cells.map(p => p[1])) + 1
  const m = 0.2
  let s = ''
  for (const [c, r] of cells) s += `<rect x="${c + m}" y="${r + m}" width="1" height="1" fill="${unite ? '#fff' : '#cfe2ff'}" stroke="#2c3e50" stroke-width="0.05"/>`
  const W = cols + 2 * m, H = rows + 2 * m
  const dim = unite ? `width="${f1(W * cote)}${unite}" height="${f1(H * cote)}${unite}"` : `width="${f1(W * cote)}" height="${f1(H * cote)}"`
  return `<svg viewBox="0 0 ${W} ${H}" ${dim} xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}

// la couleur de chaque solide (le dessin lui-même : src/dessins/solides.ts)
const FOND_SOLIDE: Readonly<Record<SolideGeo, string>> = { cube: '#cfe2ff', pave: '#cfe2ff', pyramide: '#ffd8a8', cylindre: '#b8e0c2', cone: '#f5c6e0', boule: '#f5b7b1' }

/** Un solide, dans son <svg> de `taille` pixels. */
export const svgSolide = (solide: QSolide['solide'] | SolideGeo, taille = 220): string => svgSolideCommun(solide, taille, FOND_SOLIDE[solide])

/** Quadrillage pour l'impression : 1 unité = 1 cm réel (× echelle : grilles réduites du corrigé). */
export function svgGrilleCm({ cols, rows, pleines = [], axe = null, repere = null, symboles = {}, entetes = false, echelle = 1 }: {
  cols: number, rows: number, pleines?: readonly string[], axe?: 'v' | 'h' | null, repere?: string | null, symboles?: Readonly<Record<string, string>>, entetes?: boolean, echelle?: number
}): string {
  const m = 0.5, off = entetes ? 1 : 0
  const W = cols + off + 2 * m, H = rows + off + 2 * m
  const x0 = m + off, y0 = m + off
  let s = ''
  for (const cle of pleines) {
    const [c, r] = dek(cle)
    s += `<rect x="${x0 + c}" y="${y0 + r}" width="1" height="1" fill="#b5b5b5"/>`
  }
  for (let c = 0; c <= cols; c++) s += `<line x1="${x0 + c}" y1="${y0}" x2="${x0 + c}" y2="${y0 + rows}" stroke="#555" stroke-width="0.02"/>`
  for (let r = 0; r <= rows; r++) s += `<line x1="${x0}" y1="${y0 + r}" x2="${x0 + cols}" y2="${y0 + r}" stroke="#555" stroke-width="0.02"/>`
  if (entetes) {
    for (let c = 0; c < cols; c++) s += `<text x="${x0 + c + 0.5}" y="${y0 - 0.3}" font-size="0.55" font-weight="bold" text-anchor="middle" font-family="Arial">${LETTRES[c]}</text>`
    for (let r = 0; r < rows; r++) s += `<text x="${x0 - 0.5}" y="${y0 + r + 0.7}" font-size="0.55" font-weight="bold" text-anchor="middle" font-family="Arial">${r + 1}</text>`
  }
  if (axe === 'v') s += `<line x1="${x0 + cols / 2}" y1="${y0 - 0.4}" x2="${x0 + cols / 2}" y2="${y0 + rows + 0.4}" stroke="#d00" stroke-width="0.09"/>`
  if (axe === 'h') s += `<line x1="${x0 - 0.4}" y1="${y0 + rows / 2}" x2="${x0 + cols + 0.4}" y2="${y0 + rows / 2}" stroke="#d00" stroke-width="0.09"/>`
  if (repere) { const [c, r] = dek(repere); s += `<circle cx="${x0 + c + 0.5}" cy="${y0 + r + 0.5}" r="0.14" fill="#000"/>` }
  for (const [cle, sym] of Object.entries(symboles)) {
    const [c, r] = dek(cle)
    s += `<text x="${x0 + c + 0.5}" y="${y0 + r + 0.72}" font-size="0.65" text-anchor="middle" font-family="Arial">${sym}</text>`
  }
  return `<svg width="${f1(W * echelle)}cm" height="${f1(H * echelle)}cm" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}
