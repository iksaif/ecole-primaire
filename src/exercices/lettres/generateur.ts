// Les lettres — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   une partie : nb lettres (réglage nbQ) du groupe, toutes différentes : entendre le nom
//                                                 et montrer la lettre, ou associer deux écritures (capitale, script, cursive) ;
//                                                 les mauvaises réponses viennent d'abord des lettres proches (b/d, p/q, c/e/o…)
//   questionsFiche({ niveau, reglages, rng, T })  les blocs de la fiche « relier chaque majuscule à sa minuscule »
//   verifier(q, rep)                              rep : { choix } (indice de la proposition touchée)
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes)
// L'alphabet est celui de la langue du contenu (T('alphabet'), catalogue textes.ts), sans test de langue ici. L'ordre des tirages est
// celui de l'ancienne version pour la fiche : mêmes fiches (instantanés) ; le jeu a été refait (revue du 2026-10-07).
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
type T = ParamsGenerateur<Reglages, Cle>['T']

export const PAR_BLOC = 6        // lettres d'un bloc de la fiche

/** Une écriture d'une lettre : capitale (A), script (a, Andika) ou cursive (a, Playwrite FR Trad). */
export type Ecriture = 'capitale' | 'script' | 'cursive'
/** La lettre `l` (en capitale dans l'alphabet) écrite dans une écriture : capitale telle quelle, script et cursive en minuscules. */
export const ecrire = (l: string, e: Ecriture): string => (e === 'capitale' ? l : l.toLowerCase())
/** Le couple d'écritures d'un réglage `ecritures` (« capitale-script » → ['capitale', 'script']). */
export const couple = (ecritures: Reglages['ecritures']): [Ecriture, Ecriture] => ecritures.split('-') as [Ecriture, Ecriture]

/**
 * Une question. `lettre` : la lettre (capitale de l'alphabet) ; `nom` : ce que dit la voix ; `montre` : la lettre montrée (mode
 * « majuscule », ou « reconnaitre » sans voix) dans son écriture ; `options` : 4 propositions, toutes dans l'écriture `ecriture`, dont
 * la bonne (`bonne`, et son texte `attendu`). `cle` : ce qui fait deux questions « la même ».
 */
export interface Question {
  cle: string
  mode: Reglages['mode']
  lettre: string
  nom: string
  montre: { texte: string, ecriture: Ecriture }
  ecriture: Ecriture
  options: { label: string }[]
  bonne: number
  attendu: string
}
/** La réponse de l'élève : l'indice de la proposition touchée. */
export interface Reponse { choix: number }
/** Ce que tire la fiche : les lettres de chaque bloc (majuscules, à gauche) et les mêmes mélangées (minuscules, à droite). */
export interface TirageFiche { niveau: Classe, blocs: { lettres: string[], droite: string[] }[] }

const liste = (T: T, cle: 'alphabet' | 'voyelles'): string[] => T(cle).split('|')

/** Les lettres du groupe choisi, dans l'ordre de l'alphabet de la langue. */
export function lettresDe(T: T, groupe: Reglages['groupe']): string[] {
  const alphabet = liste(T, 'alphabet'), voyelles = liste(T, 'voyelles')
  if (groupe === 'voyelles') return alphabet.filter(l => voyelles.includes(l))
  if (groupe === 'consonnes') return alphabet.filter(l => !voyelles.includes(l))
  return alphabet
}

// Lettres que l'on confond (BO n° 41 p. 52 : « b/d, c/e/o, p/q » ; et les capitales proches) : les mauvaises réponses en viennent d'abord
const PROCHES: Readonly<Record<string, string>> = {
  B: 'DPR', D: 'BPQO', P: 'BDQR', Q: 'PDOG', R: 'BP', C: 'EOG', E: 'CFO', O: 'CQDE', G: 'CQ', F: 'ETP', T: 'FIL',
  N: 'UMHW', U: 'NVW', M: 'NW', W: 'MVN', H: 'NK', I: 'LJT', L: 'IJT', J: 'IL', V: 'UWY', Y: 'VX', X: 'KY', K: 'XH', A: 'OH', S: 'Z', Z: 'S',
}
// Lettres dont la capitale et la minuscule ont la même forme : sans intérêt pour « associer capitale et script »
const MEME_FORME = new Set(['C', 'K', 'O', 'P', 'S', 'U', 'V', 'W', 'X', 'Z'])

/** Trois mauvaises réponses : jusqu'à deux lettres proches de `lettre`, puis au hasard dans le groupe. */
function fausses(rng: Rng, pool: readonly string[], lettre: string): string[] {
  const proches = rng.melanger([...(PROCHES[lettre] ?? '')].filter(l => l !== lettre && pool.includes(l))).slice(0, 2)
  const autres = rng.melanger(pool.filter(l => l !== lettre && !proches.includes(l))).slice(0, 3 - proches.length)
  return [...proches, ...autres]
}

function question(rng: Rng, reglages: Reglages, pool: readonly string[], lettre: string): Question {
  const [de, vers] = couple(reglages.ecritures)
  // « reconnaitre » : propositions dans la première écriture ; « majuscule » : dans un sens ou dans l'autre
  const inverse = reglages.mode === 'majuscule' && rng.vrai(0.5)
  const ecriture = reglages.mode === 'reconnaitre' ? de : inverse ? de : vers
  const autre = ecriture === de ? vers : de
  const choix = rng.melanger([lettre, ...fausses(rng, pool, lettre)])
  return {
    cle: `${reglages.mode}-${lettre}`, mode: reglages.mode, lettre, nom: lettre,
    montre: { texte: ecrire(lettre, autre), ecriture: autre }, ecriture,
    options: choix.map(l => ({ label: ecrire(l, ecriture) })), bonne: choix.indexOf(lettre), attendu: ecrire(lettre, ecriture),
  }
}

/** Une partie : `nb` lettres (réglage `nbQ`) du groupe, mélangées, toutes différentes ; en « associer capitale et script », sans les lettres de même forme. */
export function questions({ reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] {
  const pool = lettresDe(T, reglages.groupe)
  const sansMemeForme = reglages.mode === 'majuscule' && reglages.ecritures === 'capitale-script'
  const tirables = sansMemeForme ? pool.filter(l => !MEME_FORME.has(l)) : pool
  return rng.melanger([...tirables]).slice(0, nb).map(lettre => question(rng, reglages, pool, lettre))
}

/** La fiche : les lettres du groupe en blocs de 6 (répartition équilibrée : 26 lettres → 6 + 5 + 5 + 5 + 5), majuscules à gauche, minuscules mélangées à droite. */
export function questionsFiche({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche {
  const pool = rng.melanger([...lettresDe(T, reglages.groupe)])
  const nbBlocs = Math.ceil(pool.length / PAR_BLOC)
  const blocs = Array.from({ length: nbBlocs }, (_, i) => pool.filter((_, j) => j % nbBlocs === i))
  return { niveau, blocs: blocs.map(lettres => ({ lettres, droite: rng.melanger([...lettres]) })) }
}

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne
export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.options.length })

// ── Programme : l'alphabet de la langue (BO n° 41 p. 52 : toutes les lettres de l'alphabet à partir de la GS) ──
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const lettres = Array.isArray(x) ? (x as readonly Question[]).map(q => q.lettre) : (x as TirageFiche).blocs.flatMap(b => b.lettres)
  if (contraintes.lettres !== 'alphabet' && contraintes.niveau !== 'cp') return [`lettres : « ${String(contraintes.lettres)} » n'est pas l'alphabet entier`]
  return lettres.length ? [] : ['aucune lettre']
}
