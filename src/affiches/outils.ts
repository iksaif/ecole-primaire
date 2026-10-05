// Outils communs aux affiches : réglages valides, visibilité, groupes du formulaire, changement de variante, jeux de
// réglages des tests, et l'adaptateur qui laisse <ChoixReglage> (fait pour les exercices) lire une affiche. Purs, lisibles
// par node. Même vocabulaire et même politique que src/noyau/reglages.ts : options, bonus, horsProgramme.
import type { Reglages, ValeurOption, DefinitionExercice } from '../noyau/types.ts'
import type { ConfigAffiche, DefinitionAffiche, Orientation, TypePolice, VarianteAffiche } from './types.ts'

export const ORIENTATIONS: readonly Orientation[] = ['portrait', 'landscape']
/** La police de base : celle du titre et de l'interface, et le défaut du contenu. */
export const POLICE_BASE = 'Andika'
/** Le titre personnalisé est limité (il tient sur une ligne). */
export const LONGUEUR_TITRE = 80
export const GRAINE_DEFAUT = 1

/** La variante d'identifiant `id`, sinon la première. */
export const varianteDe = (definition: DefinitionAffiche, id?: unknown): VarianteAffiche =>
  definition.variantes[String(id)] ?? Object.values(definition.variantes)[0]

/** Réglages à choix d'une variante : options communes, complétées (et remplacées) par celles de la variante. */
export const optionsDe = (definition: DefinitionAffiche, variante: VarianteAffiche): Record<string, readonly ValeurOption[]> =>
  ({ ...definition.options, ...variante.options } as Record<string, readonly ValeurOption[]>)

/** Les types de police de l'affiche : `['unique']` en mode unique. */
export const typesDePolice = (definition: DefinitionAffiche): readonly (TypePolice | 'unique')[] =>
  (definition.police.mode === 'unique' ? ['unique'] : definition.police.types)

/** Police par défaut d'un type (celle de l'affiche, sinon la police de base). */
export const policeParDefaut = (definition: DefinitionAffiche, type: TypePolice | 'unique'): string =>
  (definition.police.mode === 'unique' ? definition.police.defaut : definition.police.defauts[type as TypePolice]) ?? POLICE_BASE

/** Les langues choisies : dans l'ordre de la définition, sans doublon ; une seule si l'affiche n'est pas bilingue. */
function languesChoisies(definition: DefinitionAffiche, lus: Record<string, unknown>): string[] {
  const demandees = Array.isArray(lus.langues) ? lus.langues : [lus.langue]
  const valides = definition.langues.filter(l => demandees.includes(l))
  if (!valides.length) return [definition.langues[0]]
  return definition.bilingue ? valides : [valides[0]]
}

/**
 * Réglages complets et valides d'une affiche : variante connue (sinon la première), format, orientation et langues
 * permis (sinon les défauts de la définition), titre, polices, graine, puis chaque réglage de la définition. Un réglage à
 * choix (qui a des options) garde la valeur lue si elle est proposée, sinon son défaut ; un réglage sans options (`max`
 * de la variante…) vaut toujours le défaut de la variante : c'est ce qui rattache le dessin à sa variante. Un réglage
 * invisible (`visibleSi`) reprend son défaut.
 * @param lus réglages lus (mémorisés, lien, test…) ; les clés inconnues sont ignorées
 * @param disponibles familles de police permises en plus de la police de base (le navigateur sait lesquelles) ; sans
 *   elle, toute chaîne non vide est acceptée
 */
export function reglagesDe<R extends Reglages>(definition: DefinitionAffiche<R>, lus: Record<string, unknown> = {}, disponibles?: readonly string[]): ConfigAffiche<R> {
  const def = definition as DefinitionAffiche
  const variante = varianteDe(def, lus.variante)
  const id = Object.keys(def.variantes).find(k => def.variantes[k] === variante)!
  const defauts: Reglages = { ...def.reglages, ...variante.reglages } as Reglages
  const offertes = optionsDe(def, variante)
  const langues = languesChoisies(def, lus)
  const lusPolices = (typeof lus.polices === 'object' && lus.polices !== null ? lus.polices : {}) as Record<string, unknown>
  const polices: Record<string, string> = {}
  for (const type of typesDePolice(def)) {
    const lue = lusPolices[type]
    polices[type] = typeof lue === 'string' && lue && (!disponibles || lue === POLICE_BASE || disponibles.includes(lue)) ? lue : policeParDefaut(def, type)
  }
  const graine = typeof lus.graine === 'number' && Number.isInteger(lus.graine) && lus.graine >= 1 ? lus.graine : GRAINE_DEFAUT
  const res: Record<string, unknown> = {
    variante: id,
    format: def.formats.find(f => f === lus.format) ?? def.formats[0],
    orientation: ORIENTATIONS.find(o => o === lus.orientation) ?? def.orientation,
    langue: langues[0], langues,
    titre: typeof lus.titre === 'string' ? lus.titre.slice(0, LONGUEUR_TITRE) : '',
    polices, graine,
  }
  for (const [cle, defaut] of Object.entries(defauts)) res[cle] = offertes[cle]?.includes(lus[cle] as ValeurOption) ? lus[cle] : defaut
  // un réglage invisible reprend son défaut (ses conditions portent sur les valeurs ci-dessus)
  for (const cle of Object.keys(def.formulaire.visibleSi ?? {})) {
    if (visible(def, cle, res)) continue
    if (cle in defauts) res[cle] = defauts[cle]
    else if (cle === 'graine') res.graine = GRAINE_DEFAUT
    else if (cle === 'langues') { res.langues = [def.langues[0]]; res.langue = def.langues[0] }
    else if (cle === 'titre') res.titre = ''
  }
  return res as ConfigAffiche<R>
}

/** Le réglage `cle` est-il proposé (sa condition `visibleSi`, s'il en a une, est-elle remplie) ? */
export function visible(definition: DefinitionAffiche, cle: string, config: Record<string, unknown>): boolean {
  const c = definition.formulaire.visibleSi?.[cle]
  return !c || config[c.reglage] === c.valeur
}

/** Un élément du formulaire : un réglage à choix, ou un réglage de la feuille. */
export type ElementFormulaire = { sorte: 'choix' | 'langues' | 'graine' | 'titre' | 'polices', cle: string }

/**
 * Les groupes du formulaire d'après la définition : d'abord les réglages à choix qu'aucun groupe ne place (sans titre),
 * puis les groupes déclarés, dans leur ordre. Les éléments invisibles et les groupes vides sont retirés. Les réglages de
 * la feuille (`langues`, `graine`, `titre`, `polices`) non placés vont dans le groupe final « feuille » (id null).
 */
export function groupesDuFormulaire(definition: DefinitionAffiche, config: Record<string, unknown>): { id: string | null, elements: ElementFormulaire[] }[] {
  const choix = Object.keys(optionsDe(definition, varianteDe(definition, config.variante)))
  const feuille = ['langues', 'titre', 'polices', 'graine'].filter(cle =>
    (cle !== 'langues' || (definition.bilingue && definition.langues.length > 1)) && (cle !== 'graine' || definition.hasard))
  const sorte = (cle: string): ElementFormulaire => ({ sorte: (feuille.includes(cle) ? cle : 'choix') as ElementFormulaire['sorte'], cle })
  const placees = new Set((definition.formulaire.groupes ?? []).flatMap(g => g.reglages))
  const groupes: { id: string | null, elements: ElementFormulaire[] }[] = [
    { id: null, elements: choix.filter(c => !placees.has(c)).map(sorte) },
    ...(definition.formulaire.groupes ?? []).map(g => ({ id: g.id, elements: g.reglages.filter(c => feuille.includes(c) || choix.includes(c)).map(sorte) })),
    { id: 'feuille', elements: feuille.filter(c => !placees.has(c)).map(sorte) },
  ]
  return groupes.map(g => ({ ...g, elements: g.elements.filter(e => visible(definition, e.cle, config)) })).filter(g => g.elements.length)
}

/** Valeur de réglage marquée « bonus » (au-delà du programme de la variante, jamais par défaut) ? */
export const estBonus = (definition: DefinitionAffiche, variante: string, cle: string, valeur: unknown): boolean =>
  !!(varianteDe(definition, variante).bonus as Record<string, readonly ValeurOption[]> | undefined)?.[cle]?.includes(valeur as ValeurOption)

/** Raison d'une valeur déclarée hors programme (`horsProgramme: [{ reglage, option, raison }]`), sinon null. */
export const raisonHorsProgramme = (definition: DefinitionAffiche, variante: string, cle: string, valeur: unknown): string | null =>
  varianteDe(definition, variante).horsProgramme?.find(h => h.reglage === cle && h.option === valeur)?.raison ?? null

/**
 * Réglages après un changement de variante : les choix de l'élève sont gardés s'ils sont proposés par la nouvelle
 * variante et au programme (une valeur bonus ou hors programme n'est jamais reportée) ; format, orientation, langues,
 * titre, polices et graine sont gardés. Même politique que reglagesApresNiveau des exercices.
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
 * Les ensembles de langues sous lesquels une affiche est publiée : chaque langue seule et, si l'affiche est bilingue,
 * toutes ensemble. Chaque ensemble est une entrée de catalogue.
 */
export const ensemblesDeLangues = (definition: DefinitionAffiche): readonly (readonly string[])[] =>
  [...definition.langues.map(l => [l]), ...(definition.bilingue && definition.langues.length > 1 ? [definition.langues] : [])]

/**
 * Jeux de réglages à essayer pour une variante (tests) : `defauts`, `<cle>=<valeur>` pour chaque autre valeur d'un
 * réglage à choix (bonus et hors programme seulement avec `horsProgramme`), chaque autre format, l'autre orientation,
 * chaque ensemble de langues, un titre personnalisé et une autre graine (affiche à hasard).
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
  for (const ensemble of ensemblesDeLangues(def)) if (ensemble.join() !== defauts.langues.join()) jeux[`langues=${ensemble.join('+')}`] = reglagesDe(definition, { ...defauts, langues: ensemble })
  jeux['titre'] = reglagesDe(definition, { ...defauts, titre: 'Mon <titre> & "autre"' })
  if (def.hasard) jeux['graine=2'] = reglagesDe(definition, { ...defauts, graine: 2 })
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
