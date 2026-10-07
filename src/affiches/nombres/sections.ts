// Les sections de l'affiche des nombres : quels nombres, et ce que la représentation en matériel montre. Pur.
// `unites` (0 → 9), `jusqua10` (0 → 10 : la comptine), `onze`, `dizaines`, `centaines`, `milliers`, `cent` ; `d1`…`d9` : une dizaine
// (10 → 20, 20 → 30…) ; `perso` : de, à, pas.
import type { TypeRepresentation } from '../../dessins/base10.ts'

export const plage = (de: number, a: number, pas = 1): number[] =>
  Array.from({ length: Math.max(0, Math.floor((a - de) / pas) + 1) }, (_, k) => de + k * pas)

/** Les dizaines : d1 = 10 → 20, d2 = 20 → 30… */
export const DIZAINES = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9'] as const
export const SECTIONS = ['unites', 'jusqua10', 'onze', 'dizaines', 'centaines', 'milliers', 'cent', 'perso', ...DIZAINES] as const
export type Section = (typeof SECTIONS)[number]

/** Les nombres de la section (hors `perso`, que les champs de, à et pas décident). */
export const NOMBRES: Readonly<Record<Exclude<Section, 'perso'>, readonly number[]>> = {
  unites: plage(0, 9),
  jusqua10: plage(0, 10),
  onze: plage(10, 20),
  dizaines: plage(10, 100, 10),
  centaines: plage(100, 1000, 100),
  milliers: plage(1000, 9000, 1000),
  cent: plage(0, 100),
  d1: plage(10, 20), d2: plage(20, 30), d3: plage(30, 40), d4: plage(40, 50), d5: plage(50, 60),
  d6: plage(60, 70), d7: plage(70, 80), d8: plage(80, 90), d9: plage(90, 100),
}

/** Sections qui ont une représentation en matériel (unités, barres, plaques). */
export const REPRESENTATION: Partial<Readonly<Record<Section, TypeRepresentation>>> = { unites: 'unites', jusqua10: 'unites', dizaines: 'dizaines', centaines: 'centaines' }

/** Les nombres de la section `perso` : de, à (au moins de), pas ; 200 au plus. */
export function nombresPerso(de: number, a: number, pas: number): number[] {
  const debut = Math.max(0, Math.min(9999, de || 0))
  return plage(debut, Math.max(debut, Math.min(9999, a || 0)), Math.max(1, pas || 1)).slice(0, 200)
}
