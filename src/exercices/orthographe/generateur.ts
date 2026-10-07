// Orthographe — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, nb })      une partie : nb questions du thème, mélangées, toutes différentes
//   questionsFiche({ niveau, reglages, rng })      { niveau, theme, questions } de la fiche (fiche.ts les met en page)
//   verifier(q, rep)                               rep : { choix } (indice) ou { texte } (saisie ; accents oubliés : faux, avec avertissement)
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes) : questions d'une année ultérieure
// L'explication d'une réponse est une clé des textes d'interface (`orthographe.explications.<clé>`), lue par la vue. L'ordre des tirages
// est celui de l'ancienne version : mêmes fiches (instantanés). Corpus : src/data/orthographe.js.
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { NIVEAUX } from '../../data/classes.ts'
import { QUESTIONS } from '../../data/orthographe.js'
import { verdictSaisie } from '../../utils/reponses.ts'
import DEFINITION, { THEMES } from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
export type Theme = (typeof THEMES)[number]['id']

/** Une entrée du corpus (src/data/orthographe.js). */
interface Entree { phrase: string, bonne: string, choix?: string[], type?: string, indice?: string, explication?: string, niv?: Classe }

/**
 * Une question : à choix (phrase à trou « ___ », `options`, `bonne` : indice de la bonne) ou à compléter (`mode: 'saisie'`, `indice`).
 * `attendu` : le mot juste ; `niv` : l'année où elle entre au programme ; `cle` : ce qui fait deux questions « la même ».
 */
export interface Question {
  cle: string
  theme: Theme
  mode: 'choix' | 'saisie'
  phrase: string
  html: string
  attendu: string
  niv: Classe
  explication: string | null
  indice?: string
  choix?: string[]
  options?: { label: string }[]
  bonne?: number
  /** les propositions dans l'ordre de la fiche (mélangées au tirage de la fiche) */
  choixFiche?: string[]
}
/** La réponse de l'élève : l'indice de la proposition touchée, ou le mot écrit. */
export type Reponse = { choix: number } | { texte: string }
/** Ce que tire la fiche. */
export interface TirageFiche { niveau: Classe, theme: Theme, questions: Question[] }

const rang = (n: Classe): number => NIVEAUX.indexOf(n)

// Questions d'un thème à un niveau : celles de son année et des années précédentes
function questionsDu(niveau: Classe, theme: Theme): (Entree & { niv: Classe, theme: Theme })[] {
  const th = THEMES.find(x => x.id === theme)!
  return (QUESTIONS[theme] as Entree[]).filter(q => rang(q.niv ?? th.niv) <= rang(niveau)).map(q => ({ ...q, niv: q.niv ?? th.niv, theme }))
}

// Thème utilisable à ce niveau (un thème mémorisé absent du niveau reprend le premier du niveau)
function themeDe(niveau: Classe, reglages: Reglages): Theme {
  const offerts = (DEFINITION.niveaux[niveau]?.options?.theme ?? []) as readonly Theme[]
  return offerts.includes(reglages.theme as Theme) ? reglages.theme as Theme : offerts[0]
}

function question(q: Entree & { niv: Classe, theme: Theme }): Question {
  const mode = q.type === 'saisie' ? 'saisie' : 'choix'
  const base: Question = {
    cle: `${q.theme}:${q.phrase}`, theme: q.theme, mode, phrase: q.phrase, html: q.phrase.replace('___', '<span class="trou">___</span>'),
    attendu: q.bonne, niv: q.niv, explication: q.explication ?? null, ...(q.indice ? { indice: q.indice } : {}),
  }
  if (mode === 'saisie') return base
  const choix = q.choix ?? []
  return { ...base, choix, options: choix.map(label => ({ label })), bonne: choix.findIndex(c => c === q.bonne) }
}

const tirer = (rng: Rng, niveau: Classe, theme: Theme, nb: number): Question[] => rng.melanger([...questionsDu(niveau, theme)]).slice(0, nb).map(question)

/** Une partie : `nb` questions (réglage `nb` par défaut) du thème choisi. */
export const questions = ({ niveau, reglages, rng, nb = reglages.nb }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirer(rng, niveau, themeDe(niveau, reglages), nb)

/** Questions de la fiche ; les propositions d'une question à choix sont mélangées (`choixFiche`). */
export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb' | 'T'>): TirageFiche {
  const theme = themeDe(niveau, reglages)
  const qs = tirer(rng, niveau, theme, reglages.nb)
  // même ordre de tirage que la mise en page d'avant : les questions à choix, dans l'ordre de la fiche
  for (const q of qs) if (q.mode === 'choix') q.choixFiche = rng.melanger([...(q.choix ?? [])])
  return { niveau, theme, questions: qs }
}

export function verifier(q: Question, rep: Reponse): Verdict {
  if ('choix' in rep) return rep.choix === q.bonne
  return verdictSaisie(rep.texte, q.attendu)
}
export const bonneReponse = (q: Question): Reponse => (q.mode === 'choix' ? { choix: q.bonne ?? 0 } : { texte: q.attendu })
export const mauvaiseReponse = (q: Question): Reponse => (q.mode === 'choix' ? { choix: ((q.bonne ?? 0) + 1) % (q.options?.length ?? 2) } : { texte: `${q.attendu}zz` })

// ── Programme : pas de question d'une année ultérieure (les homophones sont déclarés hors programme : jamais proposés par défaut) ──
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const niveau = contraintes.niveau as Classe
  const liste = Array.isArray(x) ? (x as readonly Question[]) : (x as TirageFiche).questions
  return liste.filter(q => rang(q.niv) > rang(niveau)).map(q => `${q.theme} : « ${q.phrase} » est du ${q.niv}, pas du ${niveau}`)
}
