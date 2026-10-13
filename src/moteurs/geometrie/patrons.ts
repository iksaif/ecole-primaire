// La géométrie — patrons du cube (CE2) : les 35 hexaminos, ceux qui se plient en cube, la question « est-ce un patron ? ». Pur ; l'ordre des
// tirages est celui de l'ancienne vue (mêmes fiches).
import { avecChoix } from './choix.ts'
import type { Contexte, QPatron } from './types.ts'

/** Une case d'un patron : [colonne, ligne]. */
export type CasePatron = [number, number]
type Isometrie = (p: CasePatron) => CasePatron

// Les 8 isométries du plan (rotations et symétries) d'une case [colonne, ligne]
export const SYMETRIES: readonly Isometrie[] = [
  ([c, r]) => [c, r], ([c, r]) => [-r, c], ([c, r]) => [-c, -r], ([c, r]) => [r, -c],
  ([c, r]) => [-c, r], ([c, r]) => [r, c], ([c, r]) => [c, -r], ([c, r]) => [-r, -c],
]
export function normaliserCases(cells: readonly CasePatron[]): CasePatron[] {
  const minC = Math.min(...cells.map(p => p[0])), minR = Math.min(...cells.map(p => p[1]))
  return cells.map(([c, r]): CasePatron => [c - minC, r - minR]).sort((x, y) => x[1] - y[1] || x[0] - y[0])
}
const cleCases = (cells: readonly CasePatron[]): string => normaliserCases(cells).map(p => p.join(',')).join(';')
const canonique = (cells: readonly CasePatron[]): string => SYMETRIES.map(f => cleCases(cells.map(f))).sort()[0]
// Les 35 hexaminos (6 carrés accolés par un côté), à une rotation / symétrie près
function hexaminos(): CasePatron[][] {
  let formes = new Map<string, CasePatron[]>([['0,0', [[0, 0]]]])
  for (let n = 1; n < 6; n++) {
    const suivantes = new Map<string, CasePatron[]>()
    for (const cells of formes.values()) {
      const occ = new Set(cells.map(p => p.join(',')))
      for (const [c, r] of cells) for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (occ.has((c + dc) + ',' + (r + dr))) continue
        const nc = normaliserCases([...cells, [c + dc, r + dr]])
        const kk = canonique(nc)
        if (!suivantes.has(kk)) suivantes.set(kk, nc)
      }
    }
    formes = suivantes
  }
  return [...formes.values()]
}

type Orientation = { bas: number, haut: number, nord: number, sud: number, est: number, ouest: number }
// On « fait rouler » un cube sur le patron : c'est un patron si les 6 cases touchent 6 faces différentes.
function estPatronCube(cells: readonly CasePatron[]): boolean {
  const occ = new Map(cells.map(p => [p.join(','), p] as const))
  const etat = new Map<string, Orientation>()
  const depart = cells[0].join(',')
  etat.set(depart, { bas: 0, haut: 1, nord: 2, sud: 3, est: 4, ouest: 5 })
  const file = [depart]
  const rouler = (o: Orientation, dir: 'est' | 'ouest' | 'nord' | 'sud'): Orientation => {
    if (dir === 'est') return { ...o, bas: o.est, est: o.haut, haut: o.ouest, ouest: o.bas }
    if (dir === 'ouest') return { ...o, bas: o.ouest, ouest: o.haut, haut: o.est, est: o.bas }
    if (dir === 'nord') return { ...o, bas: o.nord, nord: o.haut, haut: o.sud, sud: o.bas }
    return { ...o, bas: o.sud, sud: o.haut, haut: o.nord, nord: o.bas }
  }
  while (file.length) {
    const cle = file.shift()!
    const [c, r] = occ.get(cle)!
    for (const [dc, dr, dir] of [[1, 0, 'est'], [-1, 0, 'ouest'], [0, -1, 'nord'], [0, 1, 'sud']] as const) {
      const v = (c + dc) + ',' + (r + dr)
      if (occ.has(v) && !etat.has(v)) { etat.set(v, rouler(etat.get(cle)!, dir)); file.push(v) }
    }
  }
  return new Set([...etat.values()].map(o => o.bas)).size === 6
}
let hexa: { valides: CasePatron[][], invalides: CasePatron[][] } | null = null
/** Les hexaminos qui se plient en cube, et les autres (calculés une fois). */
export function patrons(): { valides: CasePatron[][], invalides: CasePatron[][] } {
  if (!hexa) {
    const toutes = hexaminos()
    hexa = { valides: toutes.filter(estPatronCube), invalides: toutes.filter(h => !estPatronCube(h)) }
  }
  return hexa
}

/** Patron du cube ou non ? `cases` : le patron tourné ou retourné au hasard. */
export function genPatron({ rng, T }: Contexte): QPatron {
  const { valides, invalides } = patrons()
  const valide = rng.vrai(0.5)
  const liste = valide ? valides : invalides
  const i = rng.entier(0, liste.length - 1)
  const cases = normaliserCases(liste[i].map(rng.choisir(SYMETRIES)))
  const reponse = valide ? T('oui') : T('non')
  return avecChoix({ type: 'patron' as const, cle: `pat-${valide ? 'v' : 'i'}-${i}`, cases, valide, texte: T('patronQ'), attendu: reponse },
    [T('oui'), T('non')], reponse)
}
