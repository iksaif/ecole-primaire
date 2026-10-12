// Les réglages communs des ceintures : valeurs par défaut, bornes, et lecture avec méfiance (stockage, adresse). Pur : lu par node comme par le navigateur.
// Mémorisés par useCeintures (clé `ceintures`) ; les PDF publiés prennent DEFAUT_CEINTURES.
import { IDS_PALETTES, PALETTES } from './palettes.ts'
import type { Chronometre, ReglagesCeintures, StyleCeinture } from './types.ts'

export const STYLES_CEINTURE: readonly StyleCeinture[] = ['ruban', 'bandeau', 'rond']
export const CHRONOMETRES: readonly Chronometre[] = ['aucun', 'doux', 'strict']

export const BORNES = {
  nbCeintures: { min: 3, max: 8 },
  seuil: { min: 50, max: 100 },
  questions: { min: 5, max: 30 },
} as const

export const DEFAUT_CEINTURES: ReglagesCeintures = {
  palette: 'judo',
  style: 'ruban',
  noirEtBlanc: false,
  nbCeintures: 6,
  seuil: 90,
  questions: 10,
  chronometre: 'aucun',
}

/** Un nombre entier dans ses bornes ; sinon le défaut. */
function entierBorne(valeur: unknown, min: number, max: number, defaut: number): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return defaut
  return Math.min(max, Math.max(min, Math.round(valeur)))
}

/** Des réglages lus avec méfiance : chaque champ inconnu, du mauvais type ou hors bornes reprend sa valeur par défaut (ou la borne). */
export function assainirCeintures(valeur: unknown): ReglagesCeintures {
  const lu = (typeof valeur === 'object' && valeur !== null ? valeur : {}) as Partial<Record<keyof ReglagesCeintures, unknown>>
  const palette = IDS_PALETTES.find(p => p === lu.palette) ?? DEFAUT_CEINTURES.palette
  const nb = entierBorne(lu.nbCeintures, BORNES.nbCeintures.min, BORNES.nbCeintures.max, DEFAUT_CEINTURES.nbCeintures)
  return {
    palette,
    style: STYLES_CEINTURE.find(s => s === lu.style) ?? DEFAUT_CEINTURES.style,
    noirEtBlanc: typeof lu.noirEtBlanc === 'boolean' ? lu.noirEtBlanc : DEFAUT_CEINTURES.noirEtBlanc,
    nbCeintures: Math.min(nb, PALETTES[palette].couleurs.length),
    seuil: entierBorne(lu.seuil, BORNES.seuil.min, BORNES.seuil.max, DEFAUT_CEINTURES.seuil),
    questions: entierBorne(lu.questions, BORNES.questions.min, BORNES.questions.max, DEFAUT_CEINTURES.questions),
    chronometre: CHRONOMETRES.find(c => c === lu.chronometre) ?? DEFAUT_CEINTURES.chronometre,
  }
}

/** Le brevet est-il réussi ? `bonnes` sur `total`, au seuil en pourcentage (une marge d'arrondi ne pénalise pas : 9 sur 10 vaut 90 %). */
export const brevetReussi = (bonnes: number, total: number, seuil: number): boolean => total > 0 && bonnes * 100 >= seuil * total
