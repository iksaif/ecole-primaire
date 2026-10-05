// @ts-check
// Outils communs aux exercices au format « définition » (src/exercices/README.md). Purs, lisibles par node.

/**
 * Réglages complets et valides pour un niveau : niveau connu (sinon celui par défaut), défauts communs et du
 * niveau, listes ramenées aux options du niveau (une liste vide reprend le défaut du niveau).
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {Record<string, any>} reglages réglages lus (mémorisés, lien, fiche…)
 */
export function reglagesDuNiveau(definition, reglages = {}) {
  const niveau = definition.niveaux[reglages.niveau] ? reglages.niveau : definition.niveauDefaut
  const niv = definition.niveaux[niveau]
  const res = { ...definition.reglages, ...niv.reglages, ...reglages, niveau }
  for (const [cle, offertes] of Object.entries(niv.options ?? {})) {
    const choisies = Array.isArray(res[cle]) ? res[cle].filter(v => offertes.includes(v)) : []
    const defaut = niv.reglages[cle]
    res[cle] = choisies.length ? choisies : Array.isArray(defaut) ? [...defaut] : []
  }
  return res
}

/**
 * Toutes les options au programme d'un niveau (sans les bonus) : pour les tests et les fiches « tout ».
 * @param {import('./index.js').DefinitionExercice} definition
 * @param {string} niveau
 */
export function toutAuProgramme(definition, niveau) {
  const niv = definition.niveaux[niveau]
  const res = { ...definition.reglages, ...niv.reglages, niveau }
  for (const [cle, offertes] of Object.entries(niv.options ?? {})) res[cle] = offertes.filter(v => !niv.bonus?.[cle]?.includes(v))
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
