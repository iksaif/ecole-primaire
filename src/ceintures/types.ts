// Les ceintures de compétences : types communs (plan 15 : plans/15-ceintures.md). Purs : lus par node (tests, build des fiches) comme par le navigateur.
// Une ceinture est un palier de couleur ; une piste est une suite de ceintures sur une compétence ou un exercice ; un brevet valide une ceinture.

/** Les motifs qui remplacent la couleur à l'impression en noir et blanc : chaque ceinture se reconnaît sans couleur (le nom reste écrit à côté). */
export type Motif = 'uni' | 'rayures' | 'hachures' | 'points' | 'lignes' | 'gris' | 'plein' | 'quadrillage'

/** Une couleur de ceinture : son identifiant (clé de texte `ceintures.ceinture.<id>`), sa teinte et son motif. */
export interface CouleurCeinture {
  id: string
  hex: string
  motif: Motif
}

/** Une palette : la suite des couleurs, de la première ceinture à la dernière. */
export interface Palette {
  id: PaletteId
  couleurs: readonly CouleurCeinture[]
}

export type PaletteId = 'judo' | 'judo-rouge' | 'rose-violet' | 'paliers'

/** La forme de la ceinture dessinée : ruban noué, bandeau simple, rond (gommette, case du tableau). */
export type StyleCeinture = 'ruban' | 'bandeau' | 'rond'

export type Chronometre = 'aucun' | 'doux' | 'strict'

/** Les réglages communs des ceintures, mémorisés sur l'appareil (src/ceintures/reglages.ts). Un type (pas une interface) : lu par chargerReglages. */
export type ReglagesCeintures = {
  palette: PaletteId
  style: StyleCeinture
  /** impression en noir et blanc : les motifs remplacent les couleurs */
  noirEtBlanc: boolean
  /** nombre de ceintures d'une piste (3 à 8, borné par la palette) */
  nbCeintures: number
  /** part de bonnes réponses qui valide un brevet (50 à 100) */
  seuil: number
  /** nombre de questions d'un brevet (5 à 30) */
  questions: number
  chronometre: Chronometre
}
