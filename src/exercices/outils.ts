// @ts-check
// Outils communs aux exercices au format « définition » (src/exercices/README.md). Purs, lisibles par node.

// Réglages à choix d'un niveau : options communes (`definition.options`) et du niveau, la seconde l'emportant
const optionsDe = (definition, niv) => ({ ...definition.options, ...niv.options })

/**
 * Réglages complets et valides pour un niveau : niveau connu (sinon celui par défaut), défauts communs et du
 * niveau, réglages à options ramenés aux options proposées (communes ou du niveau) : une liste (choix multiple) garde
 * ses valeurs offertes (vide → défaut) ; une valeur simple (choix unique) non offerte reprend le défaut.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {Record<string, any>} reglages réglages lus (mémorisés, lien, fiche…)
 */
export function reglagesDuNiveau(definition, reglages = {}) {
  const niveau = definition.niveaux[reglages.niveau] ? reglages.niveau : definition.niveauDefaut
  const niv = definition.niveaux[niveau]
  const defauts = { ...definition.reglages, ...niv.reglages }
  const res = { ...defauts, ...reglages, niveau }
  for (const [cle, offertes] of Object.entries(optionsDe(definition, niv))) {
    const defaut = defauts[cle]
    if (!Array.isArray(defaut)) { if (!offertes.includes(res[cle])) res[cle] = defaut; continue }
    const choisies = Array.isArray(res[cle]) ? res[cle].filter(v => offertes.includes(v)) : []
    res[cle] = choisies.length ? choisies : [...defaut]
  }
  return res
}

/**
 * Réglages après un changement de niveau — la politique commune à tous les exercices :
 * - un réglage à choix multiple du niveau (liste) reprend les défauts du nouveau niveau (son programme) ;
 * - un réglage à choix unique est gardé s'il est proposé et au programme du nouveau niveau, sinon il reprend le
 *   défaut (une valeur « bonus » ou « hors programme » n'est jamais reportée d'un niveau à l'autre) ;
 * - les réglages communs sans rapport avec le niveau (nombre de questions, aides…) sont gardés.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {Record<string, any>} reglages réglages courants
 * @param {string} niveau nouveau niveau
 */
export function reglagesApresNiveau(definition, reglages, niveau) {
  const niv = definition.niveaux[niveau]
  if (!niv) return reglagesDuNiveau(definition, reglages)
  const res = { ...reglages, niveau }
  for (const cle of Object.keys(niv.options ?? {})) {
    const v = res[cle]
    if (Array.isArray(niv.reglages[cle]) || estBonus(definition, niveau, cle, v) || raisonHorsProgramme(definition, niveau, cle, v)) delete res[cle]
  }
  return reglagesDuNiveau(definition, res)
}

/**
 * Toutes les options au programme d'un niveau (sans les bonus) : pour les tests et les fiches « tout ». Un réglage à
 * choix unique garde son défaut (les tests essaient ses autres valeurs une à une : jeuxDeReglages).
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 */
export function toutAuProgramme(definition, niveau) {
  const niv = definition.niveaux[niveau]
  const res = { ...definition.reglages, ...niv.reglages, niveau }
  for (const [cle, offertes] of Object.entries(niv.options ?? {})) {
    if (Array.isArray(niv.reglages[cle])) res[cle] = offertes.filter(v => !niv.bonus?.[cle]?.includes(v) && !raisonHorsProgramme(definition, niveau, cle, v))
  }
  return res
}

/**
 * Jeux de réglages à essayer pour un niveau (tests/exercices.test.mjs, tests/instantanes.test.mjs) : `defauts`,
 * `tout` (toutes les options au programme), `<cle>=<valeur>` pour chaque autre valeur d'un réglage à choix unique
 * (communes ou du niveau, avec tout le reste au programme) et `fiche-<id>` pour chaque fiche de la définition.
 * Tous passent par reglagesDuNiveau, comme les réglages mémorisés que lit la vue.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 * @param {{ horsProgramme?: boolean }} [choix] horsProgramme : essayer aussi les valeurs bonus / hors programme
 *   (instantanés : la fiche ne doit pas changer ; jamais pour les tests de programme)
 * @returns {Record<string, Record<string, any>>}
 */
export function jeuxDeReglages(definition, niveau, { horsProgramme = false } = {}) {
  const niv = definition.niveaux[niveau]
  const tout = reglagesDuNiveau(definition, toutAuProgramme(definition, niveau))
  /** @type {Record<string, Record<string, any>>} */
  const jeux = { defauts: reglagesDuNiveau(definition, { niveau }), tout }
  const defauts = { ...definition.reglages, ...niv.reglages }
  for (const [cle, offertes] of Object.entries(optionsDe(definition, niv))) {
    if (Array.isArray(defauts[cle])) continue
    for (const v of offertes) {
      const hors = estBonus(definition, niveau, cle, v) || !!raisonHorsProgramme(definition, niveau, cle, v)
      if (v !== defauts[cle] && (horsProgramme || !hors)) jeux[`${cle}=${v}`] = reglagesDuNiveau(definition, { ...tout, [cle]: v })
    }
  }
  for (const f of definition.fiches.filter(x => x.niveau === niveau)) jeux[`fiche-${f.id}`] = reglagesDuNiveau(definition, { niveau, ...f.reglages })
  return jeux
}

/**
 * Langue du contenu d'un exercice (énoncés, fiche) : 'fr' pour un exercice de français (`contenu: 'fr'`), sinon celle
 * de l'interface.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} langueInterface
 */
export const langueContenuDe = (definition, langueInterface) => (definition.contenu === 'fr' ? 'fr' : langueInterface)

/**
 * Verdict d'une réponse, quelle que soit la forme rendue par `verifier` : un booléen, ou `{ ok, nuance }` (nuance :
 * remarque sur une réponse presque juste, ex. 'accents' ; null sinon).
 * @param {boolean | { ok: boolean, nuance?: string | null } | null | undefined} resultat
 * @returns {{ ok: boolean, nuance: string | null }}
 */
export function lireVerdict(resultat) {
  if (resultat && typeof resultat === 'object') return { ok: !!resultat.ok, nuance: resultat.nuance ?? null }
  return { ok: !!resultat, nuance: null }
}

/**
 * Valeur d'un réglage marquée « bonus » (hors programme du niveau, jamais par défaut) ?
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 * @param {string} cle
 * @param {string} valeur
 */
export const estBonus = (definition, niveau, cle, valeur) => !!definition.niveaux[niveau]?.bonus?.[cle]?.includes(valeur)

/**
 * Raison d'une valeur de réglage déclarée hors programme (`horsProgramme: [{ reglage, option, raison }]`), sinon null.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 * @param {string} cle
 * @param {any} valeur
 */
export const raisonHorsProgramme = (definition, niveau, cle, valeur) =>
  definition.niveaux[niveau]?.horsProgramme?.find(h => h.reglage === cle && h.option === valeur)?.raison ?? null

/**
 * Valeurs proposées pour un réglage à un niveau : `niveau` → les classes de la définition ; sinon les options du
 * niveau (choix unique ou multiple), à défaut les options communes (`definition.options`). Liste vide si le réglage n'a pas d'options déclarées.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 * @param {string} cle
 * @returns {any[]}
 */
export const valeursDe = (definition, niveau, cle) =>
  cle === 'niveau' ? Object.keys(definition.niveaux) : (definition.niveaux[niveau]?.options?.[cle] ?? definition.options?.[cle] ?? [])
