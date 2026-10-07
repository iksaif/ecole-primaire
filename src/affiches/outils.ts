// Outils communs aux affiches : réglages valides, visibilité, groupes du formulaire, préréglages, changement de variante, jeux
// de réglages des tests, et l'adaptateur qui laisse <ChoixReglage> (fait pour les exercices) lire une affiche. Purs, lisibles
// par node. La politique des réglages (options, bonus, hors programme, valeurs reportées) est celle des exercices :
// src/noyau/politique.ts, qu'on ne recopie pas.
import { defautsDe, optionsDe as optionsDuNiveau, reglagesReportes, valeurValide } from '../noyau/politique.ts'
import type { Reglages, ValeurOption, ValeurReglage, DefinitionExercice } from '../noyau/types.ts'
import type { Champ, Condition, ConfigAffiche, DefinitionAffiche, Orientation, TypePolice, VarianteAffiche } from './types.ts'

export const ORIENTATIONS: readonly Orientation[] = ['portrait', 'landscape']
/** La police de base : celle du titre et de l'interface, et le défaut du contenu. */
export const POLICE_BASE = 'Andika'
/**
 * Les polices livrées avec le site (OFL, CC BY) : les seules qu'une adresse partagée transmet (une police de l'ordinateur ou
 * ajoutée depuis un fichier n'existerait pas chez un autre). Les mêmes que POLICES_INCLUSES de src/utils/impression.js, qui
 * importe les fichiers et ne se lit pas sous node ; le test les compare à la table des métriques (metriques.ts).
 */
export const POLICES_LIVREES: readonly string[] = [POLICE_BASE, 'Luciole', 'OpenDyslexic', 'Playwrite FR Trad']
/** Le titre personnalisé est limité (il tient sur une ligne). */
export const LONGUEUR_TITRE = 80
export const GRAINE_DEFAUT = 1

/** La variante d'identifiant `id`, sinon la première. */
export const varianteDe = (definition: DefinitionAffiche, id?: unknown): VarianteAffiche =>
  definition.variantes[String(id)] ?? Object.values(definition.variantes)[0]

/** Réglages à choix d'une variante : options communes, complétées (et remplacées) par celles de la variante. */
export const optionsDe = (definition: DefinitionAffiche, variante: VarianteAffiche): Record<string, readonly ValeurOption[]> =>
  ({ ...optionsDuNiveau(definition.options, variante) })

/** Champs libres (texte, nombre) d'une variante : ceux de l'affiche, complétés par ceux de la variante. */
export const champsDe = (definition: DefinitionAffiche, variante: VarianteAffiche): Record<string, Champ> =>
  ({ ...definition.champs, ...variante.champs })

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

/** Un champ lu ramené à une valeur valide : texte limité en longueur ; nombre entier ou non, dans ses bornes, au pas près. */
export function valeurDeChamp(champ: Champ, defaut: ValeurReglage, lue: unknown): string | number {
  if (champ.sorte === 'texte') return typeof lue === 'string' ? lue.slice(0, champ.max) : defaut as string
  const n = typeof lue === 'number' ? lue : typeof lue === 'string' && lue.trim() !== '' ? Number(lue) : NaN
  if (!Number.isFinite(n)) return defaut as number
  const borne = Math.min(champ.max, Math.max(champ.min, n))
  // au pas près depuis `min` ; l'arrondi décimal est volontairement limité (pas = 0,5, 0,25…)
  const k = Math.round((borne - champ.min) / champ.pas)
  return Math.min(champ.max, Math.round((champ.min + k * champ.pas) * 1e6) / 1e6)
}

/**
 * Valeurs d'un réglage à choix après restriction dynamique (`offertes` de la spec) : celles des options déclarées que la
 * fonction propose. Le défaut est gardé s'il reste proposé, sinon c'est la première valeur proposée.
 */
function restreindre(defaut: ValeurReglage, declarees: readonly ValeurOption[], proposees: readonly ValeurOption[], lue: unknown): ValeurReglage {
  const permises = declarees.filter(v => proposees.includes(v))
  if (!permises.length) return lue as ValeurReglage
  const dans = (v: unknown) => permises.includes(v as ValeurOption)
  const nouveau = Array.isArray(defaut) ? ((d => (d.length ? d : permises.slice(0, 1)))(defaut.filter(dans))) : dans(defaut) ? defaut : permises[0]
  return valeurValide(nouveau as ValeurReglage, permises, lue)
}

/** Valeurs proposées pour le réglage `cle` d'une config : options déclarées, restreintes par `offertes` s'il y en a une. */
export function valeursProposees(definition: DefinitionAffiche, cle: string, config: Record<string, unknown>): readonly ValeurOption[] {
  const declarees = optionsDe(definition, varianteDe(definition, config.variante))[cle] ?? []
  const f = definition.offertes[cle]
  if (!f) return declarees
  const proposees = f(config)
  return declarees.filter(v => proposees.includes(v))
}

/**
 * Réglages complets et valides d'une affiche : variante connue (sinon la première), format, orientation et langues
 * permis (sinon les défauts de la définition), titre, polices, graine, puis chaque réglage de la définition. Un réglage à
 * choix (qui a des options) garde la valeur lue si elle est proposée, sinon son défaut (un choix multiple garde les
 * valeurs proposées) ; un champ libre est ramené à ses bornes ; un réglage sans options ni champ (`max` de la variante…)
 * vaut toujours le défaut de la variante : c'est ce qui rattache le dessin à sa variante. Les valeurs qui dépendent des
 * autres réglages (`offertes`) sont restreintes une fois les autres lus. Un réglage invisible (`visibleSi`) reprend son
 * défaut ; les conditions sont évaluées dans l'ordre où elles sont déclarées.
 * @param lus réglages lus (mémorisés, lien, test…) ; les clés inconnues sont ignorées
 * @param disponibles familles de police permises en plus de la police de base (le navigateur sait lesquelles) ; sans
 *   elle, toute chaîne non vide est acceptée
 */
export function reglagesDe<R extends object>(definition: DefinitionAffiche<R>, lus: Record<string, unknown> = {}, disponibles?: readonly string[]): ConfigAffiche<R> {
  const def = definition as DefinitionAffiche
  const variante = varianteDe(def, lus.variante)
  const id = Object.keys(def.variantes).find(k => def.variantes[k] === variante)!
  const defauts = defautsDe(def.reglages, variante)
  const offertes = optionsDe(def, variante)
  const champs = champsDe(def, variante)
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
    format: def.formats.find(f => f === lus.format) ?? variante.format ?? def.formats[0],
    orientation: def.orientations.find(o => o === lus.orientation) ?? variante.orientation ?? def.orientations[0],
    langue: langues[0], langues,
    titre: typeof lus.titre === 'string' ? lus.titre.slice(0, LONGUEUR_TITRE) : '',
    polices, graine,
  }
  for (const [cle, defaut] of Object.entries(defauts)) {
    res[cle] = champs[cle] ? valeurDeChamp(champs[cle], defaut, lus[cle]) : offertes[cle] ? valeurValide(defaut, offertes[cle], lus[cle]) : defaut
  }
  for (const [cle, f] of Object.entries(def.offertes)) if (cle in res) res[cle] = restreindre(defauts[cle], offertes[cle] ?? [], f(res), res[cle])
  // un réglage invisible reprend son défaut (ses conditions portent sur les valeurs ci-dessus)
  for (const cle of Object.keys(def.formulaire.visibleSi ?? {})) {
    if (visible(def, cle, res)) continue
    if (cle in defauts) res[cle] = defauts[cle]
    else if (cle === 'graine') res.graine = GRAINE_DEFAUT
    else if (cle === 'langues') { res.langues = [def.langues[0]]; res.langue = def.langues[0] }
    else if (cle === 'titre') res.titre = ''
    else if (cle.startsWith('polices.')) { const type = cle.slice(8) as TypePolice; polices[type] = policeParDefaut(def, type) }
  }
  return res as ConfigAffiche<R>
}

/** Une condition est-elle remplie par ces réglages ? */
export function evaluer(c: Condition, config: Record<string, unknown>): boolean {
  if ('tous' in c) return c.tous.every(x => evaluer(x, config))
  if ('un' in c) return c.un.some(x => evaluer(x, config))
  const v = config[c.reglage]
  if ('valeur' in c) return v === c.valeur
  if ('dans' in c) return c.dans.includes(v as ValeurOption)
  return Array.isArray(v) && (v as unknown[]).includes(c.contient)
}

/** Les réglages dont dépend une condition. */
export const reglagesDeCondition = (c: Condition): string[] =>
  ('tous' in c ? c.tous.flatMap(reglagesDeCondition) : 'un' in c ? c.un.flatMap(reglagesDeCondition) : [c.reglage])

/** Le réglage `cle` est-il proposé (sa condition `visibleSi`, s'il en a une, est-elle remplie) ? */
export function visible(definition: DefinitionAffiche, cle: string, config: Record<string, unknown>): boolean {
  const c = definition.formulaire.visibleSi?.[cle]
  return !c || evaluer(c, config)
}

/** Un élément du formulaire : un réglage à choix, un champ libre, ou un réglage de la feuille. */
export type ElementFormulaire = { sorte: 'choix' | 'champ' | 'langues' | 'graine' | 'titre' | 'polices', cle: string }

/**
 * Les groupes du formulaire d'après la définition : d'abord les réglages à choix et les champs qu'aucun groupe ne place
 * (sans titre), puis les groupes déclarés, dans leur ordre. Les éléments invisibles et les groupes vides sont retirés. Les
 * réglages de la feuille (`langues`, `graine`, `titre`, `polices`) non placés vont dans le groupe final « feuille » (id null).
 */
export function groupesDuFormulaire(definition: DefinitionAffiche, config: Record<string, unknown>): { id: string | null, elements: ElementFormulaire[] }[] {
  const variante = varianteDe(definition, config.variante)
  const champs = champsDe(definition, variante)
  const choix = [...Object.keys(optionsDe(definition, variante)), ...Object.keys(champs)]
  const feuille = ['langues', 'titre', 'polices', 'graine'].filter(cle =>
    (cle !== 'langues' || (definition.bilingue && definition.langues.length > 1)) && (cle !== 'graine' || definition.hasard))
  const sorte = (cle: string): ElementFormulaire => ({ sorte: (feuille.includes(cle) ? cle : cle in champs ? 'champ' : 'choix') as ElementFormulaire['sorte'], cle })
  const placees = new Set((definition.formulaire.groupes ?? []).flatMap(g => g.reglages))
  const groupes: { id: string | null, elements: ElementFormulaire[] }[] = [
    { id: null, elements: choix.filter(c => !placees.has(c)).map(sorte) },
    ...(definition.formulaire.groupes ?? []).map(g => ({ id: g.id, elements: g.reglages.filter(c => feuille.includes(c) || choix.includes(c)).map(sorte) })),
    { id: 'feuille', elements: feuille.filter(c => !placees.has(c)).map(sorte) },
  ]
  return groupes.map(g => ({ ...g, elements: g.elements.filter(e => visible(definition, e.cle, config)) })).filter(g => g.elements.length)
}

/** Les types de police proposés dans le formulaire (mode `parType`) : ceux dont la condition `polices.<type>` est remplie. */
export const typesDePoliceVisibles = (definition: DefinitionAffiche, config: Record<string, unknown>): readonly TypePolice[] =>
  (definition.police.mode === 'parType' ? definition.police.types.filter(t => visible(definition, `polices.${t}`, config)) : [])

/** Réglages après avoir choisi un préréglage : ses valeurs, validées comme n'importe quels réglages lus (donc modifiables ensuite). */
export const appliquerPrereglage = <R extends object>(definition: DefinitionAffiche<R>, config: Record<string, unknown>, id: string): ConfigAffiche<R> =>
  reglagesDe(definition, { ...config, ...(definition as DefinitionAffiche).prereglages[id] })

/** Le préréglage est-il celui des réglages actuels (toutes ses valeurs sont les leurs) ? */
export const prereglageActif = (definition: DefinitionAffiche, config: Record<string, unknown>, id: string): boolean =>
  Object.entries(definition.prereglages[id] ?? {}).every(([cle, v]) => JSON.stringify(config[cle]) === JSON.stringify(v))

/**
 * Réglages après un changement de variante : les choix de l'élève sont gardés s'ils sont proposés par la nouvelle
 * variante et au programme (une valeur bonus ou hors programme n'est jamais reportée, un choix multiple reprend les
 * défauts de la variante) ; champs libres, format, orientation, langues, titre, polices et graine sont gardés. Même
 * politique que reglagesApresNiveau des exercices (src/noyau/politique.ts).
 */
export function reglagesApresVariante<R extends object>(definition: DefinitionAffiche<R>, reglages: Record<string, unknown>, variante: string): ConfigAffiche<R> {
  const def = definition as DefinitionAffiche
  const v = varianteDe(def, variante)
  const gardes = reglagesReportes({ ...reglages, variante }, { ...v, options: optionsDe(def, v) }, defautsDe(def.reglages, v))
  // un réglage que l'une des deux variantes redéfinit (« une lettre par page » fixe la disposition, « attaché » les écritures) prend
  // le défaut de la nouvelle variante, sauf si le lecteur l'avait modifié depuis le défaut de la précédente : sinon, un réglage
  // mémorisé qui vaut l'ancien défaut garderait la variante sans effet
  const avant = varianteDe(def, reglages.variante)
  const defautsAvant = defautsDe(def.reglages, avant)
  for (const cle of new Set([...Object.keys(avant.reglages ?? {}), ...Object.keys(v.reglages ?? {})])) {
    if (JSON.stringify(gardes[cle]) === JSON.stringify(defautsAvant[cle])) delete gardes[cle]
  }
  return reglagesDe(definition, gardes)
}

/**
 * Les ensembles de langues sous lesquels une affiche est publiée : chaque langue seule et, si l'affiche est bilingue,
 * toutes ensemble. Chaque ensemble est une entrée de catalogue.
 */
export const ensemblesDeLangues = (definition: DefinitionAffiche): readonly (readonly string[])[] =>
  [...definition.langues.map(l => [l]), ...(definition.bilingue && definition.langues.length > 1 ? [definition.langues] : [])]

/**
 * Jeux de réglages à essayer pour une variante (tests) : `defauts`, `<cle>=<valeur>` pour chaque autre valeur d'un
 * réglage à choix proposée (bonus et hors programme seulement avec `horsProgramme`), `<cle>=min|max` pour un nombre,
 * `<cle>=texte` pour un texte (long, avec des caractères à échapper), chaque autre format et orientation permis, chaque
 * ensemble de langues, chaque préréglage, un titre personnalisé et une autre graine (affiche à hasard).
 */
export function jeuxDeReglages<R extends object>(definition: DefinitionAffiche<R>, variante: string, { horsProgramme = false }: { horsProgramme?: boolean } = {}): Record<string, ConfigAffiche<R>> {
  const def = definition as DefinitionAffiche
  const v = varianteDe(def, variante)
  const defauts = reglagesDe(definition, { variante }) as ConfigAffiche<Reglages>
  const jeux: Record<string, ConfigAffiche<R>> = { defauts: defauts as ConfigAffiche<R> }
  const essayer = (nom: string, lus: Record<string, unknown>) => { jeux[nom] = reglagesDe(definition, { ...defauts, ...lus }) }
  for (const cle of Object.keys(optionsDe(def, v))) {
    for (const valeur of valeursProposees(def, cle, defauts)) {
      const hors = !!v.bonus?.[cle as never]?.includes(valeur as never) || !!v.horsProgramme?.some(h => 'reglage' in h && h.reglage === cle && h.option === valeur)
      if (valeur !== defauts[cle] && (horsProgramme || !hors)) essayer(`${cle}=${valeur}`, { [cle]: valeur })
    }
  }
  for (const [cle, champ] of Object.entries(champsDe(def, v))) {
    if (champ.sorte === 'texte') essayer(`${cle}=texte`, { [cle]: `<b>&"é'`.repeat(Math.ceil(champ.max / 6)).slice(0, champ.max) })
    else for (const [nom, valeur] of [['min', champ.min], ['max', champ.max]] as const) if (valeur !== defauts[cle]) essayer(`${cle}=${nom}`, { [cle]: valeur })
  }
  for (const format of def.formats.slice(1)) essayer(`format=${format}`, { format })
  for (const orientation of def.orientations.slice(1)) essayer(`orientation=${orientation}`, { orientation })
  for (const ensemble of ensemblesDeLangues(def)) if (ensemble.join() !== defauts.langues.join()) essayer(`langues=${ensemble.join('+')}`, { langues: ensemble })
  for (const id of Object.keys(def.prereglages)) jeux[`prereglage=${id}`] = appliquerPrereglage(definition, defauts, id)
  essayer('titre', { titre: 'Mon <titre> & "autre"' })
  if (def.hasard) essayer('graine=2', { graine: 2 })
  return jeux
}

/**
 * La définition vue comme celle d'un exercice (une variante joue le rôle d'un niveau) : <ChoixReglage> et ses marques
 * « (bonus) » / « (hors programme) » fonctionnent alors sans changement, avec `:niveau="config.variante"`.
 */
export const commeExercice = (definition: DefinitionAffiche): DefinitionExercice => ({
  id: definition.id, route: definition.route, domaine: definition.domaine, contenu: 'interface',
  // jamais lu par ChoixReglage : une vraie classe, la première de la première variante (les clés de `niveaux` sont des variantes)
  niveauDefaut: Object.values(definition.variantes)[0].classes[0],
  reglages: definition.reglages, options: definition.options, fiches: [],
  niveaux: definition.variantes,
})
