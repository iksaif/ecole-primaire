// Les jeux de couleurs des ceintures : deux seulement (plans/15-ceintures.md §22 ; la recherche du 2026-10-12 a montré qu'il n'y a aucun standard, les autres variantes n'apportaient rien).
//   judo      blanche, jaune, orange, verte, bleue, marron, noire : la plus répandue (7 ceintures)
//   paliers   six niveaux sans couleur (gris de plus en plus foncés) : contraste, daltonisme, impression économe (6 ceintures)
// Le nom d'une couleur est toujours écrit à côté de la ceinture (texte `ceintures.ceinture.<id>`) : la couleur ne porte jamais seule l'information.
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
  'paliers': {
    id: 'paliers',
    couleurs: [c('palier1', '#e8e8e8', 'uni'), c('palier2', '#cfcfcf', 'rayures'), c('palier3', '#aaaaaa', 'hachures'), c('palier4', '#808080', 'points'), c('palier5', '#505050', 'lignes'), c('palier6', '#222222', 'plein')],
  },
}

export const IDS_PALETTES = Object.keys(PALETTES) as PaletteId[]
export const PALETTE_PAR_DEFAUT: PaletteId = 'judo'

/** Les couleurs d'une piste de `nb` ceintures : les premières de la palette (au plus celles qu'elle a, au moins une). */
export function couleursDe(palette: PaletteId, nb: number): readonly CouleurCeinture[] {
  const toutes = PALETTES[palette].couleurs
  return toutes.slice(0, Math.max(1, Math.min(nb, toutes.length)))
}
