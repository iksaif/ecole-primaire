// La géométrie — questions sur quadrillage : la symétrie (compléter une figure). Pur. Une case est
// une clé « colonne,ligne » ; l'ordre des tirages est celui de l'ancienne vue (mêmes fiches).
import type { Rng } from '../../noyau/types.ts'
import type { Contexte, QSymetrie } from './types.ts'

export const k = (c: number, r: number): string => c + ',' + r
export const dek = (cle: string): [number, number] => cle.split(',').map(Number) as [number, number]

// Figure connexe (cases voisines par un côté) de n cases dans une zone
function figureConnexe(rng: Rng, n: number, dansZone: (c: number, r: number) => boolean, departs: string[]): string[] {
  const set = new Set([rng.choisir(departs)])
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let essais = 0
  while (set.size < n && essais < 1000) {
    essais++
    const [c, r] = dek(rng.choisir([...set]))
    const [dc, dr] = rng.choisir(dirs)
    if (dansZone(c + dc, r + dr)) set.add(k(c + dc, r + dr))
  }
  return [...set].sort()
}

/** Symétrie : compléter la figure de l'autre côté de l'axe. `horizontal` : axe horizontal (sinon vertical). */
export function genSymetrie({ rng, T, niv }: Contexte, horizontal: boolean): QSymetrie {
  const p = niv.symetrie!
  const axe = horizontal ? 'h' : 'v'
  // Axe horizontal : on tourne la grille (moitiés de même taille)
  const cols = axe === 'v' ? p.cols : p.rows
  const rows = axe === 'v' ? p.rows : p.cols
  const premier = rng.vrai(0.5)   // modèle à gauche / en haut
  const moitie = (axe === 'v' ? cols : rows) / 2
  const dansZone = (c: number, r: number): boolean => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false
    const pos = axe === 'v' ? c : r
    return premier ? pos < moitie : pos >= moitie
  }
  const bord = premier ? moitie - 1 : moitie
  const departs: string[] = []
  const toucheAxe = rng.vrai(p.toucheAxe ?? 0.65)
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    if (!dansZone(c, r)) continue
    if (toucheAxe && (axe === 'v' ? c : r) !== bord) continue
    departs.push(k(c, r))
  }
  const modele = figureConnexe(rng, rng.entier(...p.nbCases), dansZone, departs)
  const cellules = modele.map(cle => {
    const [c, r] = dek(cle)
    return axe === 'v' ? k(cols - 1 - c, r) : k(c, rows - 1 - r)
  }).sort()
  return {
    type: 'symetrie', cle: 'sym-' + axe + '-' + modele.join(';'),
    axe, cols, rows, premier, modele, cellules,
    texte: T(axe === 'v' ? 'symetrieV' : 'symetrieH'), consigne: T('symetrieConsigne'),
    attendu: T('nCases', { n: cellules.length }),
  }
}
