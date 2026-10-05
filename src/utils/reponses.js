// @ts-check
// Réponses écrites au clavier (exercices de français, plan 10) : comparer ce que l'élève a tapé à la réponse attendue.
// Module pur, sans dépendance : lisible par node (tests/reponses.test.mjs).
//
//   comparerReponse('  J’étais ', "j'étais")   → 'juste'    majuscules, espaces et apostrophes ne comptent pas
//   comparerReponse('jetais', "j'étais")       → 'faux'     une apostrophe manquante est une faute
//   comparerReponse("j'etais", "j'étais")      → 'accents'  seuls les accents (ou œ / æ) diffèrent : « presque juste »
//   comparerReponse('allées', ['allés', 'allées'])  → 'juste'   plusieurs formes acceptées
//
// Ce qu'on fait d'une réponse « accents » (comptée juste avec une remarque, ou fausse) est un choix de l'exercice.

/** @typedef {'juste' | 'accents' | 'faux'} Verdict */

// apostrophes typographiques (’ ‘ ʼ ′ ´ `) → apostrophe droite ; tirets (‐ ‑ ‒ – —) → trait d'union
const APOSTROPHES = /[‘’ʼ′´`]/g
const TIRETS = /[‐‑‒–—]/g

/**
 * Forme comparable d'une saisie : Unicode composé (NFC), minuscules, apostrophes et tirets unifiés, espaces (y compris
 * insécables) regroupés, sans espace autour d'une apostrophe ni aux extrémités. Les accents sont gardés.
 * @param {unknown} texte
 */
export function normaliserSaisie(texte) {
  return String(texte ?? '').normalize('NFC').toLocaleLowerCase('fr')
    .replace(APOSTROPHES, "'").replace(TIRETS, '-')
    .replace(/\s+/g, ' ').replace(/ ?' ?/g, "'").trim()
}

/**
 * Même texte sans accents ni cédille, ligatures œ / æ écrites oe / ae (à appliquer après normaliserSaisie).
 * @param {string} texte
 */
export const sansAccents = texte => texte.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae')

/** Saisie vide (ou seulement des espaces) ? @param {unknown} texte */
export const estVide = texte => normaliserSaisie(texte) === ''

/**
 * Verdict d'une saisie face à une ou plusieurs formes attendues : 'juste' (à la casse, aux espaces et aux apostrophes
 * près), 'accents' (juste si l'on ignore les accents), sinon 'faux'. Une saisie vide est toujours 'faux'.
 * @param {unknown} saisie
 * @param {string | string[]} attendus
 * @returns {Verdict}
 */
export function comparerReponse(saisie, attendus) {
  const s = normaliserSaisie(saisie)
  if (!s) return 'faux'
  const formes = (Array.isArray(attendus) ? attendus : [attendus]).map(normaliserSaisie)
  if (formes.includes(s)) return 'juste'
  const sa = sansAccents(s)
  return formes.some(f => sansAccents(f) === sa) ? 'accents' : 'faux'
}
