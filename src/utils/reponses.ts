// Réponses écrites au clavier (exercices de français, plan 10) : comparer ce que l'élève a tapé à la réponse attendue.
// Module pur, sans dépendance : lisible par node (tests/reponses.test.mjs).
//
//   comparerReponse('  J’étais ', "j'étais")   → 'juste'    majuscules, espaces et apostrophes ne comptent pas
//   comparerReponse('jetais', "j'étais")       → 'faux'     une apostrophe manquante est une faute
//   comparerReponse("j'etais", "j'étais")      → 'accents'  seuls les accents (ou œ / æ) diffèrent : « presque juste »
//   comparerReponse('allées', ['allés', 'allées'])  → 'juste'   plusieurs formes acceptées
//
// Verdict prêt pour `verifier` (useJeu) : verdictSaisie(saisie, attendus) → { ok, nuance }. Par défaut, des accents
// oubliés comptent **faux**, avec la nuance 'accents' (la vue montre « Attention aux accents » et la bonne graphie) ;
// { accents: 'accepter' } les compte justes, avec la même nuance.

export type Verdict = 'juste' | 'accents' | 'faux'
/** Ce que renvoie `verifier` pour une saisie : juste ou non, avec la nuance 'accents' si seuls les accents diffèrent. */
export interface VerdictSaisie { ok: boolean, nuance: 'accents' | null }
export type Accents = 'refuser' | 'accepter'

// apostrophes typographiques (’ ‘ ʼ ′ ´ `) → apostrophe droite ; tirets (‐ ‑ ‒ – —) → trait d'union
const APOSTROPHES = /[‘’ʼ′´`]/g
const TIRETS = /[‐‑‒–—]/g

/**
 * Forme comparable d'une saisie : Unicode composé (NFC), minuscules, apostrophes et tirets unifiés, espaces (y compris
 * insécables) regroupés, sans espace autour d'une apostrophe ni aux extrémités. Les accents sont gardés.
 */
export function normaliserSaisie(texte: unknown): string {
  return String(texte ?? '').normalize('NFC').toLocaleLowerCase('fr')
    .replace(APOSTROPHES, "'").replace(TIRETS, '-')
    .replace(/\s+/g, ' ').replace(/ ?' ?/g, "'").trim()
}

/**
 * Même texte sans accents ni cédille, ligatures œ / æ écrites oe / ae (à appliquer après normaliserSaisie).
 */
export const sansAccents = (texte: string): string => texte.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae')

/** Saisie vide (ou seulement des espaces) ? */
export const estVide = (texte: unknown): boolean => normaliserSaisie(texte) === ''

/**
 * Verdict d'une saisie face à une ou plusieurs formes attendues : 'juste' (à la casse, aux espaces et aux apostrophes
 * près), 'accents' (juste si l'on ignore les accents), sinon 'faux'. Une saisie vide est toujours 'faux'.
 */
export function comparerReponse(saisie: unknown, attendus: string | readonly string[]): Verdict {
  const s = normaliserSaisie(saisie)
  if (!s) return 'faux'
  const formes = (Array.isArray(attendus) ? attendus : [attendus]).map(normaliserSaisie)
  if (formes.includes(s)) return 'juste'
  const sa = sansAccents(s)
  return formes.some(f => sansAccents(f) === sa) ? 'accents' : 'faux'
}

/**
 * Verdict d'une saisie pour `verifier` : { ok, nuance }. nuance 'accents' : juste aux accents près ; comptée fausse
 * par défaut (décision du 2026-10-05), juste avec { accents: 'accepter' }.
 */
export function verdictSaisie(saisie: unknown, attendus: string | readonly string[], { accents = 'refuser' }: { accents?: Accents } = {}): VerdictSaisie {
  const v = comparerReponse(saisie, attendus)
  if (v === 'accents') return { ok: accents === 'accepter', nuance: 'accents' }
  return { ok: v === 'juste', nuance: null }
}
