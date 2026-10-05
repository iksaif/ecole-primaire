// Réglages d'un exercice du noyau, fonctions pures (lisibles par node, utilisées par les tests et le build) :
// réglages valides d'un niveau, politique de changement de niveau, jeux de réglages à essayer, marques « bonus » et
// « hors programme ». Même politique que l'ancien src/exercices/outils.js (les deux mondes se lisent entre eux).
import type { Classe, Config, DefinitionExercice, NiveauExercice, Reglages, ValeurOption, Verdict, VerdictLu } from './types.ts'

// Un niveau de la définition par son id (une clé lue d'un réglage mémorisé ou d'un lien peut être n'importe quoi)
const niveauDe = (definition: DefinitionExercice, niveau: unknown): NiveauExercice | undefined =>
  (definition.niveaux as Record<string, NiveauExercice | undefined>)[String(niveau)]

// Réglages à choix d'un niveau : options communes (`definition.options`) et du niveau, la seconde l'emportant
const optionsDe = (definition: DefinitionExercice, niv: NiveauExercice): Record<string, readonly ValeurOption[]> =>
  ({ ...definition.options, ...niv.options } as Record<string, readonly ValeurOption[]>)

const defautsDe = (definition: DefinitionExercice, niv: NiveauExercice): Reglages =>
  ({ ...definition.reglages, ...niv.reglages } as Reglages)

/**
 * Réglages complets et valides pour un niveau : niveau connu (sinon celui par défaut), défauts communs et du niveau,
 * réglages à options ramenés aux options proposées : une liste (choix multiple) garde ses valeurs offertes (vide →
 * défaut) ; une valeur simple (choix unique) non offerte reprend le défaut.
 * @param reglages réglages lus (mémorisés, lien, fiche…)
 */
export function reglagesDuNiveau<R extends Reglages>(definition: DefinitionExercice<R>, reglages: Record<string, unknown> = {}): Config<R> {
  const def = definition as DefinitionExercice
  const niveau = niveauDe(def, reglages.niveau) ? String(reglages.niveau) : def.niveauDefaut
  const niv = niveauDe(def, niveau)!
  const defauts = defautsDe(def, niv)
  const res = { ...defauts, ...reglages, niveau } as Reglages
  for (const [cle, offertes] of Object.entries(optionsDe(def, niv))) {
    const defaut = defauts[cle]
    if (!Array.isArray(defaut)) { if (!offertes.includes(res[cle] as ValeurOption)) res[cle] = defaut; continue }
    const lue = res[cle]
    const choisies = Array.isArray(lue) ? lue.filter(v => offertes.includes(v)) : []
    res[cle] = choisies.length ? choisies : [...defaut]
  }
  return res as Config<R>
}

/**
 * Réglages après un changement de niveau — la politique commune à tous les exercices :
 * - un réglage à choix multiple du niveau (liste) reprend les défauts du nouveau niveau (son programme) ;
 * - un réglage à choix unique est gardé s'il est proposé et au programme du nouveau niveau, sinon il reprend le
 *   défaut (une valeur « bonus » ou « hors programme » n'est jamais reportée d'un niveau à l'autre) ;
 * - les réglages communs sans rapport avec le niveau (nombre de questions, aides…) sont gardés.
 */
export function reglagesApresNiveau<R extends Reglages>(definition: DefinitionExercice<R>, reglages: Record<string, unknown>, niveau: Classe): Config<R> {
  const def = definition as DefinitionExercice
  const niv = niveauDe(def, niveau)
  if (!niv) return reglagesDuNiveau(definition, reglages)
  const res: Record<string, unknown> = { ...reglages, niveau }
  for (const cle of Object.keys(niv.options ?? {})) {
    const v = res[cle]
    if (Array.isArray(niv.reglages[cle]) || estBonus(def, niveau, cle, v) || raisonHorsProgramme(def, niveau, cle, v)) delete res[cle]
  }
  return reglagesDuNiveau(definition, res)
}

/**
 * Toutes les options au programme d'un niveau (sans les bonus) : pour les tests et les fiches « tout ». Un réglage à
 * choix unique garde son défaut (les tests essaient ses autres valeurs une à une : jeuxDeReglages).
 */
export function toutAuProgramme<R extends Reglages>(definition: DefinitionExercice<R>, niveau: Classe): Config<R> {
  const def = definition as DefinitionExercice
  const niv = niveauDe(def, niveau)!
  const res = { ...defautsDe(def, niv), niveau } as Reglages
  for (const [cle, offertes] of Object.entries(niv.options ?? {}) as [string, readonly ValeurOption[]][]) {
    if (Array.isArray(niv.reglages[cle])) res[cle] = offertes.filter(v => !(niv.bonus as Record<string, readonly ValeurOption[]> | undefined)?.[cle]?.includes(v) && !raisonHorsProgramme(def, niveau, cle, v)) as string[]
  }
  return res as Config<R>
}

/**
 * Jeux de réglages à essayer pour un niveau (tests) : `defauts`, `tout` (toutes les options au programme),
 * `<cle>=<valeur>` pour chaque autre valeur d'un réglage à choix unique (avec tout le reste au programme) et
 * `fiche-<id>` pour chaque fiche de la définition. Tous passent par reglagesDuNiveau, comme les réglages mémorisés.
 * @param choix horsProgramme : essayer aussi les valeurs bonus / hors programme (jamais pour les tests de programme)
 */
export function jeuxDeReglages<R extends Reglages>(definition: DefinitionExercice<R>, niveau: Classe, { horsProgramme = false }: { horsProgramme?: boolean } = {}): Record<string, Config<R>> {
  const def = definition as DefinitionExercice
  const niv = niveauDe(def, niveau)!
  const tout = reglagesDuNiveau(definition, toutAuProgramme(definition, niveau))
  const jeux: Record<string, Config<R>> = { defauts: reglagesDuNiveau(definition, { niveau }), tout }
  const defauts = defautsDe(def, niv)
  for (const [cle, offertes] of Object.entries(optionsDe(def, niv))) {
    if (Array.isArray(defauts[cle])) continue
    for (const v of offertes) {
      const hors = estBonus(def, niveau, cle, v) || !!raisonHorsProgramme(def, niveau, cle, v)
      if (v !== defauts[cle] && (horsProgramme || !hors)) jeux[`${cle}=${v}`] = reglagesDuNiveau(definition, { ...tout, [cle]: v })
    }
  }
  for (const f of definition.fiches.filter(x => x.niveau === niveau)) jeux[`fiche-${f.id}`] = reglagesDuNiveau(definition, { niveau, ...f.reglages })
  return jeux
}

/** Langue du contenu d'un exercice (énoncés, fiche) : 'fr' pour un exercice de français, sinon celle de l'interface. */
export const langueContenuDe = (definition: DefinitionExercice, langueInterface: string): string =>
  (definition.contenu === 'fr' ? 'fr' : langueInterface)

/** Verdict d'une réponse, quelle que soit la forme rendue par `verifier` : un booléen, ou `{ ok, nuance }`. */
export function lireVerdict(resultat: Verdict | null | undefined): VerdictLu {
  if (resultat && typeof resultat === 'object') return { ok: !!resultat.ok, nuance: resultat.nuance ?? null }
  return { ok: !!resultat, nuance: null }
}

/** Valeur d'un réglage marquée « bonus » (hors programme du niveau, jamais par défaut) ? */
export const estBonus = (definition: DefinitionExercice, niveau: string, cle: string, valeur: unknown): boolean =>
  !!(niveauDe(definition, niveau)?.bonus as Record<string, readonly ValeurOption[]> | undefined)?.[cle]?.includes(valeur as ValeurOption)

/** Raison d'une valeur de réglage déclarée hors programme (`horsProgramme: [{ reglage, option, raison }]`), sinon null. */
export const raisonHorsProgramme = (definition: DefinitionExercice, niveau: string, cle: string, valeur: unknown): string | null =>
  niveauDe(definition, niveau)?.horsProgramme?.find(h => h.reglage === cle && h.option === valeur)?.raison ?? null

/**
 * Valeurs proposées pour un réglage à un niveau : `niveau` → les classes de la définition ; sinon les options du
 * niveau, à défaut les options communes. Liste vide si le réglage n'a pas d'options déclarées.
 */
export const valeursDe = (definition: DefinitionExercice, niveau: string, cle: string): readonly ValeurOption[] => {
  if (cle === 'niveau') return Object.keys(definition.niveaux)
  const niv = niveauDe(definition, niveau)
  return (niv?.options as Record<string, readonly ValeurOption[]> | undefined)?.[cle]
    ?? (definition.options as Record<string, readonly ValeurOption[]> | undefined)?.[cle] ?? []
}
