// Les ceintures — ce que la fiche écrit : le titre de la piste et la liste des objectifs, un par ceinture. Rien n'est tiré au hasard (`aleatoire: false`).
// Piste fournie : ses objectifs viennent des textes de contenu (textes.ts) ; piste libre : ceux que l'enseignant·e a écrits (un par ligne).
import type { Contraintes, ParamsGenerateur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { objectifsDe } from '../../ceintures/pistes.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Ce que tire la fiche : la piste, son titre écrit (piste libre seulement : vide, la fiche écrit le titre de la piste) et ses objectifs, de la première à la dernière ceinture. */
export interface TirageFiche { piste: Reglages['piste'], titreLibre: string, objectifs: string[] }

export function questionsFiche({ reglages, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche {
  if (reglages.piste === 'libre') return { piste: 'libre', titreLibre: reglages.intitule.trim(), objectifs: objectifsDe(reglages.objectifs) }
  return { piste: reglages.piste, titreLibre: '', objectifs: objectifsDe(T(`piste.${reglages.piste}.objectifs` as Cle)) }
}

/** Écarts au programme : aucun (outil de classe, hors programme : voir definition.ts). */
export const ecartsAuProgramme = (_tirage: TirageFiche, _contraintes: Contraintes): string[] => []
