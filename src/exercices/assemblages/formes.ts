// Assemblages de formes — les trois pièces et les modèles. Pur (lisible par node). Tout est sur une grille de cases : une pièce
// est un carré (1 × 1), un rectangle (2 × 1, couché ou debout) ou un triangle rectangle isocèle (la moitié d'une case : deux
// triangles font un carré, ou, côte à côte, un toit). `x`, `y` : la case en haut à gauche de la pièce (y vers le bas).
import type { Classe } from '../../noyau/types.ts'

export type FormePiece = 'carre' | 'rectangle' | 'triangle'
/** Le coin de l'angle droit d'un triangle : bas ou haut, gauche ou droite. */
export type CoinDroit = 'bg' | 'bd' | 'hg' | 'hd'

export interface Piece { forme: FormePiece, x: number, y: number, couche?: boolean, coin?: CoinDroit }
export interface Modele { id: string, pieces: readonly Piece[] }

const c = (x: number, y: number): Piece => ({ forme: 'carre', x, y })
const rh = (x: number, y: number): Piece => ({ forme: 'rectangle', x, y, couche: true })
const rv = (x: number, y: number): Piece => ({ forme: 'rectangle', x, y, couche: false })
const t = (x: number, y: number, coin: CoinDroit): Piece => ({ forme: 'triangle', x, y, coin })

/** Les modèles de chaque classe (BO n° 41 p. 69 : jusqu'à 4 éléments avant 4 ans, jusqu'à 8 formes planes à 5 ans). */
export const MODELES: Readonly<Partial<Record<Classe, readonly Modele[]>>> = {
  ps: [
    { id: 'long', pieces: [c(0, 0), c(1, 0)] },
    { id: 'carre-deux-triangles', pieces: [t(0, 0, 'bd'), t(0, 0, 'hg')] },
    { id: 'escalier', pieces: [rh(0, 1), t(0, 0, 'bd')] },
    { id: 'coin', pieces: [c(0, 0), c(0, 1), c(1, 1)] },
    { id: 'pied', pieces: [rv(0, 0), c(1, 1)] },
    { id: 'montagne', pieces: [t(0, 0, 'bd'), t(1, 0, 'bg')] },
  ],
  ms: [
    { id: 'maison', pieces: [c(0, 1), c(1, 1), t(0, 0, 'bd'), t(1, 0, 'bg')] },
    { id: 'toit-large', pieces: [rh(0, 1), t(0, 0, 'bd'), t(1, 0, 'bg')] },
    { id: 'fusee', pieces: [t(0, 0, 'bd'), t(1, 0, 'bg'), rv(0, 1), rv(1, 1)] },
    { id: 'te', pieces: [c(0, 1), c(1, 1), c(1, 0), c(2, 1)] },
    { id: 'train', pieces: [rh(0, 1), rh(2, 1), c(0, 0), c(2, 0)] },
    { id: 'porte', pieces: [rv(0, 0), rv(1, 0), c(0, 2), c(1, 2)] },
  ],
  gs: [
    { id: 'grande-maison', pieces: [t(0, 0, 'bd'), t(1, 0, 'bg'), rh(0, 1), c(0, 2), c(1, 2)] },
    { id: 'fusee-ailes', pieces: [t(0, 0, 'bd'), t(1, 0, 'bg'), rv(0, 1), rv(1, 1), t(-1, 2, 'bd'), t(2, 2, 'bg')] },
    { id: 'chateau', pieces: [c(0, 0), c(2, 0), c(4, 0), rh(0, 1), rh(2, 1), rh(4, 1)] },
    { id: 'bateau', pieces: [rh(0, 2), rh(2, 2), rv(1, 0), t(2, 0, 'bg'), t(2, 1, 'bg')] },
    { id: 'escalier-geant', pieces: [c(0, 2), c(1, 2), c(2, 2), c(1, 1), c(2, 1), c(2, 0)] },
    { id: 'poisson', pieces: [t(0, 0, 'bd'), c(1, 0), c(2, 0), t(3, 0, 'bg'), c(1, 1)] },
  ],
}

export const COULEURS: Readonly<Record<FormePiece, string>> = { carre: '#e53935', rectangle: '#1e88e5', triangle: '#fdd835' }

/** Les cases de la pièce : largeur et hauteur. */
export function tailleDe(p: Piece): { l: number, h: number } {
  if (p.forme === 'rectangle') return p.couche ? { l: 2, h: 1 } : { l: 1, h: 2 }
  return { l: 1, h: 1 }
}

/** Les sommets de la pièce, en cases (origine : la case 0,0 du modèle). */
export function sommets(p: Piece): [number, number][] {
  const { l, h } = tailleDe(p)
  const { x, y } = p
  if (p.forme !== 'triangle') return [[x, y], [x + l, y], [x + l, y + h], [x, y + h]]
  switch (p.coin) {
    case 'bd': return [[x, y + 1], [x + 1, y + 1], [x + 1, y]]
    case 'bg': return [[x, y + 1], [x + 1, y + 1], [x, y]]
    case 'hd': return [[x, y], [x + 1, y], [x + 1, y + 1]]
    default: return [[x, y], [x + 1, y], [x, y + 1]]
  }
}

/** La boîte qui contient le modèle : sa première case et sa taille en cases. */
export function boiteDe(pieces: readonly Piece[]): { x: number, y: number, l: number, h: number } {
  const xs = pieces.flatMap(p => sommets(p).map(s => s[0]))
  const ys = pieces.flatMap(p => sommets(p).map(s => s[1]))
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, l: Math.max(...xs) - x, h: Math.max(...ys) - y }
}

/** Combien de pièces de chaque forme il faut pour fabriquer les modèles un par un : le maximum sur les modèles. */
export function jeuDePieces(modeles: readonly Modele[]): Record<FormePiece, number> {
  const jeu: Record<FormePiece, number> = { carre: 0, rectangle: 0, triangle: 0 }
  for (const m of modeles) {
    for (const forme of Object.keys(jeu) as FormePiece[]) {
      jeu[forme] = Math.max(jeu[forme], m.pieces.filter(p => p.forme === forme).length)
    }
  }
  return jeu
}

// ── Dessin SVG (1 case = 100 unités du dessin ; la taille réelle en cm vient de `cote`, la case en cm) ──
const U = 100
const TRAIT = 3

const pointsDe = (s: [number, number][], dx: number, dy: number): string => s.map(([x, y]) => `${(x - dx) * U + TRAIT},${(y - dy) * U + TRAIT}`).join(' ')

/** Le dessin d'un modèle : en couleurs, ou en silhouette grise (PS : on pose les formes dessus). `cote` : la case en cm. */
export function svgModele(pieces: readonly Piece[], cote: number, rendu: 'couleur' | 'silhouette'): string {
  const b = boiteDe(pieces)
  const formes = pieces.map(p => {
    const remplissage = rendu === 'couleur' ? COULEURS[p.forme] : '#eceff1'
    const trait = rendu === 'couleur' ? '#333' : '#78909c'
    return `<polygon points="${pointsDe(sommets(p), b.x, b.y)}" fill="${remplissage}" stroke="${trait}" stroke-width="${TRAIT}" stroke-linejoin="round"/>`
  }).join('')
  return enveloppe(formes, b.l, b.h, cote)
}

/** Un cadre en pointillés de la taille du modèle : l'enfant y reproduit le modèle avec ses formes. */
export function svgCadre(pieces: readonly Piece[], cote: number): string {
  const { l, h } = boiteDe(pieces)
  const forme = `<rect x="${TRAIT}" y="${TRAIT}" width="${l * U}" height="${h * U}" fill="none" stroke="#90a4ae" stroke-width="${TRAIT}" stroke-dasharray="14 10" rx="8"/>`
  return enveloppe(forme, l, h, cote)
}

/** Une pièce seule, à découper (trait plein : on découpe sur la ligne). */
export function svgPiece(forme: FormePiece, cote: number): string {
  const piece: Piece = forme === 'triangle' ? t(0, 0, 'bd') : forme === 'rectangle' ? rh(0, 0) : c(0, 0)
  return svgModele([piece], cote, 'couleur')
}

function enveloppe(contenu: string, l: number, h: number, cote: number): string {
  const largeur = l * U + 2 * TRAIT
  const hauteur = h * U + 2 * TRAIT
  const cm = (n: number): string => `${((n / U) * cote).toFixed(2)}cm`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${cm(largeur)}" height="${cm(hauteur)}" aria-hidden="true">${contenu}</svg>`
}
