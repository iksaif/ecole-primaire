// Tracer à la règle — « construire » (CE1, CE2) : une figure donnée par ses mesures, à tracer. À l'écran, sur le quadrillage, en carreaux ; sur la
// fiche, sur papier uni, en centimètres, à la règle et à l'équerre. Les exemples du BO (c2maths p. 36) : « un rectangle de longueur 7 cm et
// de largeur 3 cm », « un carré dont les côtés ont pour longueur 6 cm », « un triangle rectangle dont les côtés de l'angle droit mesurent
// 10 cm et 4 cm ». Pur.
import type { Pt } from './figures.ts'
import { memePoint } from './figures.ts'

export type FigureAConstruire = 'rectangle' | 'carre' | 'triangleRectangle'
export const FIGURES_A_CONSTRUIRE: readonly FigureAConstruire[] = ['rectangle', 'carre', 'triangleRectangle']

/** Les mesures demandées : la longueur et la largeur (rectangle), le côté (carré, `b` = `a`), les côtés de l'angle droit (triangle rectangle). */
export interface Mesures { a: number, b: number }

/**
 * Ce qu'on tire : des nombres entiers dans ces bornes (en carreaux à l'écran, en centimètres sur la fiche). Les cadres de la fiche font 12 cm
 * (rectangle) et 8,5 cm (carré, triangle) de large sur 7 cm de haut : une figure y tient dans les deux sens. Au CE1, des mesures plus petites.
 */
export const BORNES: Readonly<Record<'ecran' | 'ficheCE1' | 'ficheCE2', Readonly<Record<FigureAConstruire, { a: readonly [number, number], b: readonly [number, number] }>>>> = {
  ecran: { rectangle: { a: [3, 5], b: [1, 4] }, carre: { a: [2, 4], b: [2, 4] }, triangleRectangle: { a: [2, 5], b: [2, 4] } },
  ficheCE1: { rectangle: { a: [4, 7], b: [2, 3] }, carre: { a: [3, 4], b: [3, 4] }, triangleRectangle: { a: [3, 5], b: [2, 4] } },
  ficheCE2: { rectangle: { a: [5, 9], b: [2, 4] }, carre: { a: [3, 5], b: [3, 5] }, triangleRectangle: { a: [4, 6], b: [3, 5] } },
}

/** Le carré de la longueur d'un côté (on compare des carrés : un côté oblique a une longueur qui n'est pas entière). */
const longueur2 = (u: Pt, v: Pt): number => (u.x - v.x) ** 2 + (u.y - v.y) ** 2
/** L'angle en `s` (entre s→a et s→b) est-il droit ? */
const droit = (a: Pt, s: Pt, b: Pt): boolean => (a.x - s.x) * (b.x - s.x) + (a.y - s.y) * (b.y - s.y) === 0
/** Trois points alignés (le point du milieu n'est pas un sommet) ? */
const alignes = (a: Pt, s: Pt, b: Pt): boolean => (s.x - a.x) * (b.y - a.y) - (s.y - a.y) * (b.x - a.x) === 0

/** Les sommets d'un tracé fermé : sans les points touchés deux fois de suite, sans les points au milieu d'un côté ; `null` s'il n'est pas fermé. */
export function sommetsDuTrace(trace: readonly Pt[]): Pt[] | null {
  const sans = trace.filter((q, i) => i === 0 || !memePoint(q, trace[i - 1]))
  if (sans.length < 4 || !memePoint(sans[0], sans[sans.length - 1])) return null
  let sommets = sans.slice(0, -1)
  // on retire les points au milieu d'un côté, jusqu'à ce qu'il n'y en ait plus
  for (let change = true; change && sommets.length > 2;) {
    change = false
    for (let i = 0; i < sommets.length; i++) {
      const avant = sommets[(i + sommets.length - 1) % sommets.length], apres = sommets[(i + 1) % sommets.length]
      if (alignes(avant, sommets[i], apres)) {
        sommets = sommets.filter((_, k) => k !== i)
        change = true
        break
      }
    }
  }
  return sommets
}

/** Le tracé est-il la figure demandée, avec ses mesures (dans n'importe quel sens, n'importe où sur le quadrillage) ? */
export function constructionJuste(figure: FigureAConstruire, mesures: Mesures, trace: readonly Pt[]): boolean {
  const s = sommetsDuTrace(trace)
  if (!s) return false
  const cotes = s.map((q, i) => longueur2(q, s[(i + 1) % s.length]))
  if (figure === 'triangleRectangle') {
    if (s.length !== 3) return false
    // le sommet de l'angle droit : ses deux côtés ont les mesures demandées
    return s.some((q, i) => {
      const avant = s[(i + 2) % 3], apres = s[(i + 1) % 3]
      const lesDeux = [longueur2(q, avant), longueur2(q, apres)].sort((x, y) => x - y)
      const attendus = [mesures.a ** 2, mesures.b ** 2].sort((x, y) => x - y)
      return droit(avant, q, apres) && lesDeux[0] === attendus[0] && lesDeux[1] === attendus[1]
    })
  }
  if (s.length !== 4) return false
  const tousDroits = s.every((q, i) => droit(s[(i + 3) % 4], q, s[(i + 1) % 4]))
  const tries = [...cotes].sort((x, y) => x - y)
  const attendus = [mesures.a ** 2, mesures.a ** 2, mesures.b ** 2, mesures.b ** 2].sort((x, y) => x - y)
  return tousDroits && tries.every((c, i) => c === attendus[i])
}

/** Un tracé juste (pour les tests) : la figure posée dans le coin du quadrillage, refermée. */
export function constructionModele(figure: FigureAConstruire, { a, b }: Mesures): Pt[] {
  if (figure === 'triangleRectangle') return [{ x: 0, y: 0 }, { x: a, y: 0 }, { x: 0, y: b }, { x: 0, y: 0 }]
  return [{ x: 0, y: 0 }, { x: a, y: 0 }, { x: a, y: b }, { x: 0, y: b }, { x: 0, y: 0 }]
}
