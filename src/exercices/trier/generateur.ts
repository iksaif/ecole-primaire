// Trier les images — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même image
//   questionsFiche({ niveau, reglages, rng, T })  les mêmes questions, pour la fiche imprimable
//   verifier(q, rep)                              rep : { choix: indice de la boîte touchée }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Une question : une image et 2 ou 3 boîtes (nom et image) ; l'enfant touche la boîte où l'image va.
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Rng } from '../../utils/hasard.ts'
import { CORPUS } from './corpus.ts'
import type { Entree, ThemeId } from './corpus.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Les thèmes proposés par classe (la PS : deux thèmes seulement) ; `ecartsAuProgramme` les compare au niveau. */
export const THEMES_PAR_NIVEAU: Readonly<Partial<Record<Classe, readonly ThemeId[]>>> = {
  ps: ['groupes', 'matieres'],
  ms: ['groupes', 'matieres', 'deplacements', 'mange'],
  gs: ['groupes', 'matieres', 'deplacements', 'mange'],
}
/** Nombre de boîtes proposées : deux en PS, trois en MS, quatre en GS (quand le thème en a autant). */
const NB_BOITES: Readonly<Partial<Record<Classe, number>>> = { ps: 2, ms: 3, gs: 4 }
const nbBoites = (niveau: Classe): number => NB_BOITES[niveau] ?? 3

/** Une boîte proposée : son image et son nom (lu sur le bouton). */
export interface Boite { id: string, emoji: NomEmoji, label: string }

export interface Question {
  /** ce qui fait deux questions « la même » : l'image, dans son thème */
  cle: string
  theme: ThemeId
  item: NomEmoji
  /** le nom de l'image (texte alternatif) */
  mot: string
  boites: Boite[]
  /** indice de la bonne boîte */
  bonne: number
  /** pour le tableau de correction : la question en une ligne et la bonne réponse */
  texte: string
  attendu: string
}
/** La réponse de l'élève : l'indice de la boîte touchée. */
export interface Reponse { choix: number }

const nomMot = (item: NomEmoji, T: Traducteur<Cle>): string => T(`mot.${item}` as Cle)
const nomBoite = (id: string, T: Traducteur<Cle>): string => T(`boite.${id}` as Cle)

/** Les boîtes d'une question : la bonne et des leurres du même thème (pas ceux que l'entrée écarte), dans le désordre. */
function boitesDe(theme: ThemeId, entree: Entree, nb: number, rng: Rng, T: Traducteur<Cle>): Boite[] {
  const { boites } = CORPUS[theme]
  const leurres = Object.keys(boites).filter(id => id !== entree.boite && !entree.pas?.includes(id))
  // un thème qui a moins de boîtes que la classe n'en permet (déplacements : trois) les propose toutes
  const ids = rng.melanger([entree.boite, ...rng.melanger(leurres).slice(0, nb - 1)])
  return ids.map(id => ({ id, emoji: boites[id], label: nomBoite(id, T) }))
}

function question(niveau: Classe, reglages: Reglages, rng: Rng, T: Traducteur<Cle>): Question {
  const theme = rng.choisir(reglages.themes)
  const entree = rng.choisir(CORPUS[theme].entrees)
  const boites = boitesDe(theme, entree, nbBoites(niveau), rng, T)
  const bonne = boites.findIndex(b => b.id === entree.boite)
  const mot = nomMot(entree.item, T)
  return { cle: `${theme}:${entree.item}`, theme, item: entree.item, mot, boites, bonne, texte: mot, attendu: boites[bonne].label }
}

export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question(niveau, reglages, rng, T), { cle: q => q.cle })

/** Ce que tire la fiche : le niveau (nombre de boîtes) et les questions. */
export interface TirageFiche { niveau: Classe, questions: Question[] }

export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche =>
  ({ niveau: p.niveau, questions: questions(p) })

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne

export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.boites.length })

/** Un thème qui n'est pas au programme de la classe, ou une question qui n'a pas le bon nombre de boîtes. */
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x : (x as TirageFiche).questions
  const permis = THEMES_PAR_NIVEAU[contraintes.niveau] ?? []
  const ecarts = qs.filter(q => !permis.includes(q.theme)).map(q => `thème « ${q.theme} » hors programme en ${contraintes.niveau}`)
  const trop = qs.filter(q => q.boites.length > nbBoites(contraintes.niveau)).map(q => `${q.boites.length} boîtes en ${contraintes.niveau}`)
  return [...ecarts, ...trop]
}
