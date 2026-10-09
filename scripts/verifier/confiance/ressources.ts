// Les exercices et les affiches qui ont du texte dans une langue régionale, avec leur niveau de confiance (src/langues/confiance.ts).
// Lu par `npm run confiance` (le tableau) et par tests/confiance.test.mjs.
import { REGISTRE as EXERCICES } from '../../../src/exercices/index.ts'
import { REGISTRE as AFFICHES } from '../../../src/affiches/index.ts'
import { languesDe } from '../../../src/langues/catalogue.ts'
import { cleRessource } from '../../../src/langues/confiance.ts'
import type { CleRessource, Confiance } from '../../../src/langues/confiance.ts'
import { langue as definition, REGIONALES } from '../../../src/langues/registre.ts'
import type { Langue } from '../../../src/langues/registre.ts'

export interface LigneConfiance {
  cle: CleRessource
  titre: string
  /** l'évaluation faite, ou `undefined` : jamais évaluée (niveau 0) */
  evaluation: Confiance | undefined
}

/** Toutes les clés de ressources qui existent (avec ou sans traduction) : pour vérifier qu'une table ne cite rien d'inconnu. */
export function clesConnues(): Set<string> {
  return new Set([
    ...EXERCICES.map(e => cleRessource('exercice', e.definition.id)),
    ...AFFICHES.map(a => cleRessource('affiche', a.definition.id)),
  ])
}

/** Les ressources réelles (hors exemples) qui ont des textes dans la langue, dans l'ordre des registres. */
export function ressourcesTraduites(langue: Langue): LigneConfiance[] {
  const table = definition(langue).confiance ?? {}
  const exercices = EXERCICES.filter(e => !e.exemple && languesDe(e.textes).includes(langue))
    .map(e => ({ cle: cleRessource('exercice', e.definition.id), titre: e.definition.id }))
  const affiches = AFFICHES.filter(a => langue in a.textes)
    .map(a => ({ cle: cleRessource('affiche', a.definition.id), titre: a.definition.id }))
  return [...exercices, ...affiches].map(r => ({ ...r, evaluation: table[r.cle] }))
}

/** Les langues régionales dont on évalue la traduction. */
export const LANGUES_EVALUEES: readonly Langue[] = REGIONALES
