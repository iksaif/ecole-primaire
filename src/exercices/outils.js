// @ts-check
// Outils communs aux exercices au format « définition » (src/exercices/README.md). Purs, lisibles par node.

/**
 * Réglages complets et valides pour un niveau : niveau connu (sinon celui par défaut), défauts communs et du
 * niveau, réglages à options ramenés aux options du niveau : une liste (choix multiple) garde ses valeurs offertes
 * (vide → défaut du niveau) ; une valeur simple (choix unique) non offerte reprend le défaut du niveau.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {Record<string, any>} reglages réglages lus (mémorisés, lien, fiche…)
 */
export function reglagesDuNiveau(definition, reglages = {}) {
  const niveau = definition.niveaux[reglages.niveau] ? reglages.niveau : definition.niveauDefaut
  const niv = definition.niveaux[niveau]
  const res = { ...definition.reglages, ...niv.reglages, ...reglages, niveau }
  for (const [cle, offertes] of Object.entries(niv.options ?? {})) {
    const defaut = niv.reglages[cle]
    if (!Array.isArray(defaut)) { if (!offertes.includes(res[cle])) res[cle] = defaut; continue }
    const choisies = Array.isArray(res[cle]) ? res[cle].filter(v => offertes.includes(v)) : []
    res[cle] = choisies.length ? choisies : [...defaut]
  }
  return res
}

/**
 * Toutes les options au programme d'un niveau (sans les bonus) : pour les tests et les fiches « tout ». Un réglage à
 * choix unique garde son défaut (les tests essaient ses autres valeurs une à une).
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
 * niveau (choix unique ou multiple). Liste vide si le réglage n'a pas d'options déclarées.
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 * @param {string} cle
 * @returns {any[]}
 */
export const valeursDe = (definition, niveau, cle) =>
  cle === 'niveau' ? Object.keys(definition.niveaux) : (definition.niveaux[niveau]?.options?.[cle] ?? [])
