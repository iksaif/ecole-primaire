// Les brevets de ceintures — ce que la fiche écrit : la piste, le numéro de la ceinture et les questions du brevet (tirées de la graine). Les questions sont
// celles de src/ceintures/brevets.ts ; la fiche en garde autant que le réglage commun `questions`.
import type { Contraintes, ParamsGenerateur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { NB_CEINTURES_BREVET, brevetDe, tablesDuBrevet } from '../../ceintures/brevets.ts'
import type { OptionsTables } from '../../ceintures/brevets.ts'
import type { LigneBrevet, PisteAvecBrevet } from '../../ceintures/brevets.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Ce que tire la fiche : la piste, l'indice de la ceinture (0 pour la première), ses tables et toutes les questions de cette ceinture, mélangées. */
export interface TirageFiche { piste: PisteAvecBrevet, indice: number, tables: number[], questions: LigneBrevet[] }

export function questionsFiche({ reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb' | 'T'> & { T?: unknown }): TirageFiche {
  // la ceinture demandée, ramenée aux ceintures de la piste
  const indice = Math.min(Math.max(reglages.ceinture, 1), NB_CEINTURES_BREVET[reglages.piste]) - 1
  const options: OptionsTables = { tables: reglages.tablesPerso ? reglages.tables.map(Number) : null, divisions: reglages.divisions, jusqu: reglages.jusqu }
  return { piste: reglages.piste, indice, tables: tablesDuBrevet(indice, options), questions: brevetDe(reglages.piste, indice, rng, options) }
}

/** Écarts au programme : aucun (les tables de 1 à 10, au programme du CE1 au CM2). */
export const ecartsAuProgramme = (_tirage: TirageFiche, _contraintes: Contraintes): string[] => []
