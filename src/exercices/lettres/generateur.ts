// Les lettres — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   une partie : 15 lettres (nb) du groupe, toutes différentes, à reconnaître ou à associer
//                                                 majuscule / minuscule
//   questionsFiche({ niveau, reglages, rng, T })  les blocs de la fiche « relier chaque majuscule à sa minuscule »
//   verifier(q, rep)                              rep : { choix } (indice de la proposition touchée)
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes)
// L'alphabet est celui de la langue du contenu (T('alphabet'), catalogue textes.ts), sans test de langue ici. L'ordre des tirages est
// celui de l'ancienne version : même flux de hasard, mêmes fiches (instantanés).
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
type T = ParamsGenerateur<Reglages, Cle>['T']

export const NB_QUESTIONS = 15   // lettres d'une partie
export const PAR_BLOC = 6        // lettres d'un bloc de la fiche

/**
 * Une question : la lettre (`lettre`, en majuscule), ce qu'on montre (`affiche`), 4 propositions (`options`) dont la bonne (`bonne`, et son
 * texte `attendu`) ; en mode « majuscule », `question` dit ce qu'on cherche. `cle` : ce qui fait deux questions « la même ».
 */
export interface Question {
  cle: string
  mode: Reglages['mode']
  lettre: string
  affiche: string
  options: { label: string }[]
  bonne: number
  attendu: string
  question?: 'quelleMinuscule' | 'quelleMajuscule'
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

const fausses = (rng: Rng, pool: readonly string[], exclure: string, n: number): string[] => rng.melanger(pool.filter(l => l !== exclure)).slice(0, n)

function question(rng: Rng, mode: Reglages['mode'], pool: readonly string[], lettre: string): Question {
  if (mode === 'reconnaitre') {
    // montre la majuscule ou la minuscule ; on retrouve la lettre parmi des majuscules
    const affiche = rng.vrai(0.5) ? lettre : lettre.toLowerCase()
    const choix = rng.melanger([lettre, ...fausses(rng, pool, lettre, 3)])
    return { cle: `reconnaitre-${lettre}`, mode, lettre, affiche, options: choix.map(label => ({ label })), bonne: choix.indexOf(lettre), attendu: lettre }
  }
  // montre la majuscule → trouver la minuscule, ou l'inverse
  const versMin = rng.vrai(0.5)
  const affiche = versMin ? lettre : lettre.toLowerCase()
  const attendu = versMin ? lettre.toLowerCase() : lettre
  const pool2 = versMin ? pool.map(l => l.toLowerCase()) : pool
  const choix = rng.melanger([attendu, ...fausses(rng, pool2, attendu, 3)])
  return {
    cle: `majuscule-${lettre}`, mode, lettre, affiche, options: choix.map(label => ({ label })), bonne: choix.indexOf(attendu), attendu,
    question: versMin ? 'quelleMinuscule' : 'quelleMajuscule',
  }
}

/** Une partie : `nb` lettres (15) du groupe, mélangées, toutes différentes (au plus les lettres du groupe). */
export function questions({ reglages, rng, T, nb = NB_QUESTIONS }: ParamsGenerateur<Reglages, Cle>): Question[] {
  const pool = lettresDe(T, reglages.groupe)
  return rng.melanger([...pool]).slice(0, nb).map(lettre => question(rng, reglages.mode, pool, lettre))
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
