// Outils communs aux affiches : réglages valides, changement de variante, jeux de réglages des tests, et l'adaptateur qui
// laisse <ChoixReglage> (fait pour les exercices) lire une affiche. Purs, lisibles par node.
// Même vocabulaire et même politique que src/noyau/reglages.ts : options, bonus, horsProgramme.
import type { Reglages, ValeurOption, DefinitionExercice } from '../noyau/types.ts'
import type { ConfigAffiche, DefinitionAffiche, Orientation, VarianteAffiche } from './types.ts'

export const ORIENTATIONS: readonly Orientation[] = ['portrait', 'landscape']

/** La variante d'identifiant `id`, sinon la première. */
export const varianteDe = (definition: DefinitionAffiche, id?: unknown): VarianteAffiche =>
  definition.variantes[String(id)] ?? Object.values(definition.variantes)[0]

/** Réglages à choix d'une variante : options communes, complétées (et remplacées) par celles de la variante. */
export const optionsDe = (definition: DefinitionAffiche, variante: VarianteAffiche): Record<string, readonly ValeurOption[]> =>
  ({ ...definition.options, ...variante.options } as Record<string, readonly ValeurOption[]>)

/**
 * Réglages complets et valides d'une affiche : variante connue (sinon la première), format, orientation et langue
 * permis (sinon les défauts de la définition), puis chaque réglage de la définition. Un réglage à choix (qui a des
 * options) garde la valeur lue si elle est proposée, sinon son défaut ; un réglage sans options (`max` de la variante…)
 * vaut toujours le défaut de la variante : c'est ce qui rattache le dessin à sa variante.
 * @param lus réglages lus (mémorisés, lien, test…) ; les clés inconnues sont ignorées
 */
export function reglagesDe<R extends Reglages>(definition: DefinitionAffiche<R>, lus: Record<string, unknown> = {}): ConfigAffiche<R> {
  const def = definition as DefinitionAffiche
  const variante = varianteDe(def, lus.variante)
  const id = Object.keys(def.variantes).find(k => def.variantes[k] === variante)!
  const defauts: Reglages = { ...def.reglages, ...variante.reglages } as Reglages
  const offertes = optionsDe(def, variante)
  const res: Record<string, unknown> = {
    variante: id,
    format: def.formats.find(f => f === lus.format) ?? def.formats[0],
    orientation: ORIENTATIONS.find(o => o === lus.orientation) ?? def.orientation,
    langue: def.langues.find(l => l === lus.langue) ?? def.langues[0],
  }
  for (const [cle, defaut] of Object.entries(defauts)) res[cle] = offertes[cle]?.includes(lus[cle] as ValeurOption) ? lus[cle] : defaut
  return res as ConfigAffiche<R>
}

/** Valeur de réglage marquée « bonus » (au-delà du programme de la variante, jamais par défaut) ? */
export const estBonus = (definition: DefinitionAffiche, variante: string, cle: string, valeur: unknown): boolean =>
  !!(varianteDe(definition, variante).bonus as Record<string, readonly ValeurOption[]> | undefined)?.[cle]?.includes(valeur as ValeurOption)

/** Raison d'une valeur déclarée hors programme (`horsProgramme: [{ reglage, option, raison }]`), sinon null. */
export const raisonHorsProgramme = (definition: DefinitionAffiche, variante: string, cle: string, valeur: unknown): string | null =>
  varianteDe(definition, variante).horsProgramme?.find(h => h.reglage === cle && h.option === valeur)?.raison ?? null

/**
 * Réglages après un changement de variante : les choix de l'élève sont gardés s'ils sont proposés par la nouvelle
 * variante et au programme (une valeur bonus ou hors programme n'est jamais reportée) ; format, orientation et langue
 * sont gardés. Même politique que reglagesApresNiveau des exercices.
 */
export function reglagesApresVariante<R extends Reglages>(definition: DefinitionAffiche<R>, reglages: Record<string, unknown>, variante: string): ConfigAffiche<R> {
  const def = definition as DefinitionAffiche
  const res: Record<string, unknown> = { ...reglages, variante }
  for (const cle of Object.keys(optionsDe(def, varianteDe(def, variante)))) {
    if (estBonus(def, variante, cle, res[cle]) || raisonHorsProgramme(def, variante, cle, res[cle])) delete res[cle]
  }
  return reglagesDe(definition, res)
}

/**
 * Jeux de réglages à essayer pour une variante (tests) : `defauts`, `<cle>=<valeur>` pour chaque autre valeur d'un
 * réglage à choix (bonus et hors programme seulement avec `horsProgramme`), puis chaque autre format et l'autre orientation.
 */
export function jeuxDeReglages<R extends Reglages>(definition: DefinitionAffiche<R>, variante: string, { horsProgramme = false }: { horsProgramme?: boolean } = {}): Record<string, ConfigAffiche<R>> {
  const def = definition as DefinitionAffiche
  const defauts = reglagesDe(definition, { variante })
  const jeux: Record<string, ConfigAffiche<R>> = { defauts }
  for (const [cle, offertes] of Object.entries(optionsDe(def, varianteDe(def, variante)))) {
    for (const valeur of offertes) {
      const hors = estBonus(def, variante, cle, valeur) || !!raisonHorsProgramme(def, variante, cle, valeur)
      if (valeur !== (defauts as Reglages)[cle] && (horsProgramme || !hors)) jeux[`${cle}=${valeur}`] = reglagesDe(definition, { ...defauts, [cle]: valeur })
    }
  }
  for (const format of def.formats.slice(1)) jeux[`format=${format}`] = reglagesDe(definition, { ...defauts, format })
  const autre = ORIENTATIONS.find(o => o !== defauts.orientation)
  jeux[`orientation=${autre}`] = reglagesDe(definition, { ...defauts, orientation: autre })
  return jeux
}

/**
 * La définition vue comme celle d'un exercice (une variante joue le rôle d'un niveau) : <ChoixReglage> et ses marques
 * « (bonus) » / « (hors programme) » fonctionnent alors sans changement, avec `:niveau="config.variante"`.
 */
export const commeExercice = (definition: DefinitionAffiche): DefinitionExercice => ({
  id: definition.id, route: definition.route, domaine: definition.domaine, contenu: 'interface',
  niveauDefaut: Object.keys(definition.variantes)[0] as DefinitionExercice['niveauDefaut'],
  reglages: definition.reglages, options: definition.options, fiches: [],
  // un seul point de conversion : les clés sont des variantes, pas des classes
  niveaux: definition.variantes as unknown as DefinitionExercice['niveaux'],
})
