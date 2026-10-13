// Le repérage — les dessins (SVG en chaînes), les mêmes à l'écran et sur la fiche : le quadrillage, le robot (un rond et une pointe qui montre
// où il regarde), l'étoile d'arrivée, le chemin, et les flèches des instructions. Unité : une case = 10 (des millimètres sur la fiche). Pur.
import type { Case, Instruction, Robot } from './generateur.ts'

/** La taille d'une case, en unités du dessin (un centimètre sur la fiche). */
export const CASE = 10
const BLEU = '#1d4e9e'

/** Le centre d'une case. */
const centre = (c: Case): { x: number, y: number } => ({ x: c.x * CASE + CASE / 2, y: c.y * CASE + CASE / 2 })

/** Le quadrillage : `colonnes` × `lignes` cases. */
export function quadrillage(colonnes: number, lignes: number): string {
  let traits = ''
  for (let c = 0; c <= colonnes; c++) traits += `<line x1="${c * CASE}" y1="0" x2="${c * CASE}" y2="${lignes * CASE}"/>`
  for (let l = 0; l <= lignes; l++) traits += `<line x1="0" y1="${l * CASE}" x2="${colonnes * CASE}" y2="${l * CASE}"/>`
  return `<g stroke="#8a96a3" stroke-width="0.35">${traits}</g>`
}

/** Le robot : un corps carré arrondi, deux yeux à l'avant et une pointe devant lui (on voit d'un coup d'œil où il regarde). */
export function robot(r: Robot): string {
  const { x, y } = centre(r)
  return `<g transform="translate(${x} ${y}) rotate(${r.dir * 90})">`
    + `<path d="M0 -4.7 L2.2 -2.9 L-2.2 -2.9 Z" fill="${BLEU}"/>`
    + `<rect x="-3" y="-2.8" width="6" height="6" rx="1.4" fill="${BLEU}"/>`
    + `<circle cx="-1.25" cy="-1.3" r="0.85" fill="#fff"/><circle cx="1.25" cy="-1.3" r="0.85" fill="#fff"/>`
    + `<circle cx="-1.25" cy="-1.5" r="0.4" fill="#111"/><circle cx="1.25" cy="-1.5" r="0.4" fill="#111"/></g>`
}

/** Un rocher : une case que le robot ne peut pas traverser. */
export function rocher(c: Case): string {
  const { x, y } = centre(c)
  return `<path d="M${x - 3.8} ${y + 2.6} Q${x - 4.2} ${y - 1.2} ${x - 1.6} ${y - 2.8} Q${x + 0.6} ${y - 4} ${x + 2.4} ${y - 2.2} Q${x + 4.4} ${y - 0.6} ${x + 3.8} ${y + 2.6} Z" fill="#8d8d8d" stroke="#555" stroke-width="0.4"/>`
    + `<path d="M${x - 1.6} ${y - 1.2} q1 -0.8 2.2 -0.2" fill="none" stroke="#b5b5b5" stroke-width="0.4"/>`
}

/** L'étoile d'arrivée. */
export function etoile(c: Case, couleur = '#e8a33d'): string {
  const { x, y } = centre(c)
  const pointes = Array.from({ length: 10 }, (_, k) => {
    const angle = -Math.PI / 2 + (k * Math.PI) / 5
    const rayon = k % 2 === 0 ? 3.8 : 1.6
    return `${(x + rayon * Math.cos(angle)).toFixed(2)},${(y + rayon * Math.sin(angle)).toFixed(2)}`
  })
  return `<polygon points="${pointes.join(' ')}" fill="${couleur}" stroke="#a86b12" stroke-width="0.3"/>`
}

/** Le chemin du robot, de centre de case en centre de case. */
export function chemin(cases: readonly Case[], couleur = BLEU): string {
  if (cases.length < 2) return ''
  const points = cases.map(c => { const p = centre(c); return `${p.x},${p.y}` }).join(' ')
  return `<polyline points="${points}" fill="none" stroke="${couleur}" stroke-width="1" stroke-dasharray="2 1.2" stroke-linejoin="round"/>`
}

/** Les cases du trajet numérotées dans l'ordre (corrigé : on rejoue le programme case par case). Une case traversée deux fois garde le dernier numéro. */
export function numerosDuChemin(cases: readonly Case[]): string {
  return cases.slice(1).map((c, i) => {
    const { x, y } = centre(c)
    return `<text x="${x + 2.6}" y="${y - 1.6}" font-size="3.4" font-weight="700" text-anchor="middle" fill="#1d4e9e" font-family="inherit">${i + 1}</text>`
  }).join('')
}

/** Une case coloriée (l'arrivée, au corrigé). */
export const caseColoriee = (c: Case, couleur: string): string =>
  `<rect x="${c.x * CASE}" y="${c.y * CASE}" width="${CASE}" height="${CASE}" fill="${couleur}"/>`

/** Le dessin d'une instruction dans un carré de 10 : une flèche droite (avancer), une flèche qui tourne (pivoter), et le nombre de cases. */
export function flecheInstruction(instruction: Instruction, n = 1): string {
  if (instruction === 'avancer') {
    // « avancer de n » : la flèche à gauche, le nombre en grand à droite
    if (n > 1) {
      return `<path d="M3.4 8.6 V2.4 M1.4 4.4 L3.4 1.6 L5.4 4.4" fill="none" stroke="#222" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`
        + `<text x="7.4" y="7.6" font-size="5.2" text-anchor="middle" font-weight="800" font-family="inherit">${n}</text>`
    }
    return `<path d="M5 8.6 V2.4 M2.4 4.6 L5 1.6 L7.6 4.6" fill="none" stroke="#222" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`
  }
  // une flèche coudée (↱ à droite, ↰ à gauche, comme sur les robots de classe) : on part tout droit, puis on tourne
  const coude = instruction === 'droite'
    ? 'M3.4 8.6 V5.2 Q3.4 3.2 5.4 3.2 H7.8 M6 1.4 L8 3.2 L6 5'
    : 'M6.6 8.6 V5.2 Q6.6 3.2 4.6 3.2 H2.2 M4 1.4 L2 3.2 L4 5'
  return `<path d="${coude}" fill="none" stroke="#222" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`
}

/** Une instruction dans sa case (la fiche, la légende) : un carré de `taille` mm. */
export const caseInstruction = (instruction: Instruction | null, n: number, taille: number): string =>
  `<svg width="${taille}mm" height="${taille}mm" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect x="0.3" y="0.3" width="9.4" height="9.4" rx="1.2" fill="#fff" stroke="#888" stroke-width="0.4"/>${instruction ? flecheInstruction(instruction, n) : ''}</svg>`

/** Le quadrillage, le robot, et ce qu'on y ajoute ; `largeur` en mm (fiche) ou rien (écran : le CSS décide). */
export function plan(colonnes: number, lignes: number, contenu: string, largeur?: number): string {
  const taille = largeur ? ` width="${largeur}mm" height="${(largeur * lignes) / colonnes}mm"` : ''
  return `<svg viewBox="-0.5 -0.5 ${colonnes * CASE + 1} ${lignes * CASE + 1}"${taille} xmlns="http://www.w3.org/2000/svg">${quadrillage(colonnes, lignes)}${contenu}</svg>`
}
