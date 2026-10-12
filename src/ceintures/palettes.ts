// Les palettes de couleurs des ceintures. Aucun standard : celles qu'on trouve en classe (recherche du 2026-10-12, plans/15-ceintures.md §2).
//   judo         blanche, jaune, orange, verte, bleue, marron, noire : la plus répandue
//   judo-rouge   la même, plus la rouge (livrets de calcul mental de collège)
//   rose-violet  rose, jaune, orange, verte, bleue, violette (ceintures de calcul CM1)
//   paliers      cinq paliers sans couleur (gris de plus en plus foncés) : contraste, daltonisme, impression économe
// Le nom d'une couleur est toujours écrit à côté de la ceinture (texte `ceintures.couleur.<id>`) : la couleur ne porte jamais seule l'information.
import type { CouleurCeinture, Motif, Palette, PaletteId } from './types.ts'

const c = (id: string, hex: string, motif: Motif): CouleurCeinture => ({ id, hex, motif })

const BLANCHE = c('blanche', '#f2f2f2', 'uni')
const JAUNE = c('jaune', '#f6d33b', 'rayures')
const ORANGE = c('orange', '#f08a24', 'hachures')
const VERTE = c('verte', '#3aa655', 'points')
const BLEUE = c('bleue', '#2f6fd6', 'lignes')
const MARRON = c('marron', '#8a5a34', 'gris')
const NOIRE = c('noire', '#222222', 'plein')

export const PALETTES: Readonly<Record<PaletteId, Palette>> = {
  'judo': { id: 'judo', couleurs: [BLANCHE, JAUNE, ORANGE, VERTE, BLEUE, MARRON, NOIRE] },
  'judo-rouge': { id: 'judo-rouge', couleurs: [BLANCHE, JAUNE, ORANGE, VERTE, BLEUE, MARRON, NOIRE, c('rouge', '#d6372f', 'quadrillage')] },
  'rose-violet': { id: 'rose-violet', couleurs: [c('rose', '#f4a6c0', 'uni'), JAUNE, ORANGE, VERTE, BLEUE, c('violette', '#8a4fbf', 'gris')] },
  'paliers': { id: 'paliers', couleurs: [c('palier1', '#e4e4e4', 'uni'), c('palier2', '#bbbbbb', 'rayures'), c('palier3', '#888888', 'points'), c('palier4', '#555555', 'lignes'), c('palier5', '#222222', 'plein')] },
}

export const IDS_PALETTES = Object.keys(PALETTES) as PaletteId[]
export const PALETTE_PAR_DEFAUT: PaletteId = 'judo'

/** Les couleurs d'une piste de `nb` ceintures : les premières de la palette (au plus celles qu'elle a, au moins une). */
export function couleursDe(palette: PaletteId, nb: number): readonly CouleurCeinture[] {
  const toutes = PALETTES[palette].couleurs
  return toutes.slice(0, Math.max(1, Math.min(nb, toutes.length)))
}
