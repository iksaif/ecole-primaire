// Lecture — générateur : QUOI poser, et comment corriger. Pur : le hasard vient de `rng` (lisible par node, tests, build des fiches).
//   questions({ niveau, reglages, rng, nb })   une partie : des mots tous différents (syllabes, mots) ou des textes (texte)
//   questionsFiche({ niveau, reglages, rng })  la même chose pour la fiche
//   verifier(q, rep)                           syllabes : { choix } ; mots : { syllabes } dans l'ordre ; texte : { lu }
// Le texte lu à voix haute n'a pas de « mauvaise » réponse : l'élève dit qu'il l'a lu (l'adulte écoute). Les textes générés par
// Mistral (facultatif) ne passent pas par ici : la vue les demande (mistral.ts) et remplace le texte de la question.
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type DEFINITION from './definition.ts'
import { MOTS, TEXTES } from './corpus.ts'
import type { MotDecoupe } from './corpus.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** Compter les syllabes : trois nombres proposés, dont le bon. */
export interface QuestionSyllabes { cle: string, mode: 'syllabes', mot: string, syllabes: readonly string[], options: { label: string }[], bonne: number }
/** Reconstituer le mot : ses syllabes, mélangées (jamais dans le bon ordre). */
export interface QuestionMots { cle: string, mode: 'mots', mot: string, syllabes: readonly string[], melangees: string[] }
/** Lire un texte à voix haute. */
export interface QuestionTexte { cle: string, mode: 'texte', texte: string }
export type Question = QuestionSyllabes | QuestionMots | QuestionTexte

export type Reponse = { choix: number } | { syllabes: readonly string[] } | { lu: boolean }

/** Ce que tire la fiche : les questions, et la classe (titre). */
export interface TirageFiche { niveau: Classe, questions: Question[] }

const motsDe = (niveau: Classe): readonly MotDecoupe[] => MOTS[niveau] ?? []
const textesDe = (niveau: Classe): readonly string[] => TEXTES[niveau] ?? []
/** Un mot dont toutes les syllabes sont pareilles (pa-pa) : rien à remettre dans l'ordre. */
const toutesPareilles = (m: MotDecoupe): boolean => m.syllabes.every(s => s === m.syllabes[0])

/** Les syllabes mélangées autrement que dans le bon ordre. */
function melangerAutrement(rng: Rng, syllabes: readonly string[]): string[] {
  for (let essai = 0; essai < 30; essai++) {
    const melangees = rng.melanger([...syllabes])
    if (melangees.join('|') !== syllabes.join('|')) return melangees
  }
  return [...syllabes].reverse()
}

/** Trois nombres de syllabes proposés : le bon et deux voisins (au moins 1). */
function nombresProposes(rng: Rng, nb: number): number[] {
  const voisins = [nb - 1, nb + 1, nb + 2].filter(n => n >= 1)
  return rng.melanger([nb, ...rng.melanger(voisins).slice(0, 2)])
}

function questionSyllabes(rng: Rng, m: MotDecoupe): QuestionSyllabes {
  const nombres = nombresProposes(rng, m.syllabes.length)
  return { cle: `syllabes-${m.mot}`, mode: 'syllabes', mot: m.mot, syllabes: m.syllabes, options: nombres.map(n => ({ label: String(n) })), bonne: nombres.indexOf(m.syllabes.length) }
}

const questionMots = (rng: Rng, m: MotDecoupe): QuestionMots =>
  ({ cle: `mots-${m.mot}`, mode: 'mots', mot: m.mot, syllabes: m.syllabes, melangees: melangerAutrement(rng, m.syllabes) })

/** `nb` questions toutes différentes (moins quand la classe n'a pas assez de mots ou de textes). */
function tirer(niveau: Classe, mode: Reglages['mode'], rng: Rng, nb: number): Question[] {
  if (mode === 'texte') {
    const textes = rng.melanger([...textesDe(niveau)])
    return textes.slice(0, nb).map(texte => ({ cle: `texte-${texte}`, mode: 'texte', texte }))
  }
  const pool = mode === 'mots' ? motsDe(niveau).filter(m => !toutesPareilles(m)) : motsDe(niveau)
  const melanges = rng.melanger([...pool])
  return tirerUniques(Math.min(nb, melanges.length), i => (mode === 'mots' ? questionMots(rng, melanges[i]) : questionSyllabes(rng, melanges[i])), { cle: q => q.cle })
}

export function questions({ niveau, reglages, rng, nb = reglages.nb }: ParamsGenerateur<Reglages>): Question[] {
  return tirer(niveau, reglages.mode, rng, nb)
}

export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages>, 'nb'>): TirageFiche {
  return { niveau, questions: tirer(niveau, reglages.mode, rng, reglages.nb) }
}

export function verifier(q: Question, rep: Reponse): Verdict {
  if (q.mode === 'syllabes') return 'choix' in rep && rep.choix === q.bonne
  if (q.mode === 'mots') return 'syllabes' in rep && rep.syllabes.join('') === q.mot
  return 'lu' in rep && rep.lu
}

export function bonneReponse(q: Question): Reponse {
  if (q.mode === 'syllabes') return { choix: q.bonne }
  if (q.mode === 'mots') return { syllabes: q.syllabes }
  return { lu: true }
}

/** Une réponse fausse : une autre proposition, les syllabes décalées d'un cran, ou « pas lu ». */
export function mauvaiseReponse(q: Question): Reponse {
  if (q.mode === 'syllabes') return { choix: (q.bonne + 1) % q.options.length }
  if (q.mode === 'mots') return { syllabes: [...q.syllabes.slice(1), q.syllabes[0]] }
  return { lu: false }
}

/** Programme : des mots de la classe (le corpus est rangé par classe) ; pas de contrainte vérifiée de plus. */
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, _contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x as readonly Question[] : (x as TirageFiche).questions
  return qs.length ? [] : ['aucune question']
}
