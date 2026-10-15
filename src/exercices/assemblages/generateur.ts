// Assemblages de formes — générateur (fiche seule) : QUELS modèles poser. Pur : le hasard vient de `rng`, donc lisible par node.
//   questionsFiche({ niveau, reglages, rng })   les modèles de la fiche, tous différents, et comment les présenter
//   ecartsAuProgramme(tirage, contraintes)      ce qui sort du programme du niveau (tests)
import type { Classe, Contraintes, ParamsGenerateur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import { MODELES } from './formes.ts'
import type { Modele } from './formes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** Nombre maximal de pièces d'un modèle par classe (BO n° 41 p. 69 : 4 éléments en petite section, 8 formes planes à 5 ans). */
export const PIECES_MAX: Readonly<Partial<Record<Classe, number>>> = { ps: 4, ms: 5, gs: 8 }
/** Le côté d'une case en cm : plus petit quand les modèles sont plus grands. */
export const COTE_CASE: Readonly<Partial<Record<Classe, number>>> = { ps: 3.4, ms: 2.6, gs: 2.2 }

/** Ce que tire la fiche : la classe (qui règle la présentation) et ses modèles. */
export interface TirageFiche { niveau: Classe, modeles: Modele[] }

export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages>, 'nb'>): TirageFiche {
  const disponibles = MODELES[niveau] ?? []
  // des modèles tous différents ; au plus ceux que le corpus a
  const modeles = rng.melanger([...disponibles]).slice(0, reglages.nbFiche)
  return { niveau, modeles }
}

export function ecartsAuProgramme(tirage: TirageFiche, contraintes: Contraintes): string[] {
  const max = PIECES_MAX[contraintes.niveau] ?? 0
  return tirage.modeles.filter(m => m.pieces.length > max).map(m => `« ${m.id} » : ${m.pieces.length} pièces > ${max} en ${contraintes.niveau}`)
}
