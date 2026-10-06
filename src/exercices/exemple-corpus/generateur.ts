// Exemple d'exercice à corpus — générateur : les questions sont tirées d'un corpus (src/data/exemple-corpus.ts), pur et
// lisible par node. Le choix du bon mot est un QCM (<ChoixReponses>, voir la vue) : la réponse est l'indice choisi.
import { NIVEAUX } from '../../data/classes.ts'
import type { Classe } from '../../data/classes.ts'
import { CORPUS } from '../../data/exemple-corpus.ts'
import type { Entree } from '../../data/exemple-corpus.ts'
import type { Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import type DEFINITION from './definition.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>   // T ne connaît que les clés du catalogue et les mots communs

export interface Question {
  mot: string
  /** première classe où le corpus propose ce mot : ecartsAuProgramme la compare au niveau */
  niveauMot: Classe
  /** les propositions, pour <ChoixReponses> (`label` : leur texte) */
  options: { label: string }[]
  /** indice de la bonne proposition */
  bonne: number
  /** pour le tableau de correction de fin de partie : la question en une ligne, et la bonne réponse */
  texte: string
  attendu: string
}
/** La réponse de l'élève : l'indice de la proposition choisie (ce que <ChoixReponses> émet). */
export interface Reponse { choix: number }

const NB_FICHE = 8
const NB_PROPOSITIONS = 4
const rang = (n: Classe) => NIVEAUX.indexOf(n)

function question(niveau: Classe, reglages: Reglages, rng: Rng): Question {
  const theme = rng.choisir(reglages.themes)
  // les mots du thème déjà au programme de la classe (ceux des classes précédentes aussi)
  const disponibles: readonly Entree[] = CORPUS.filter(e => e.theme === theme && rang(e.niveau) <= rang(niveau))
  const entree = rng.choisir(disponibles)
  // les mauvaises propositions : les synonymes d'autres mots du même thème
  const leurres = rng.melanger(disponibles.filter(e => e !== entree)).slice(0, NB_PROPOSITIONS - 1).map(e => e.synonyme)
  const mots = rng.melanger([entree.synonyme, ...leurres])
  return {
    mot: entree.mot, niveauMot: entree.niveau, options: mots.map(label => ({ label })), bonne: mots.indexOf(entree.synonyme),
    texte: entree.mot, attendu: entree.synonyme,
  }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  Array.from({ length: nb }, () => question(niveau, reglages, rng))

export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): Question[] => questions({ ...p, nb: NB_FICHE })

/** Un QCM : juste si c'est la bonne proposition (un booléen suffit, pas de « presque »). */
export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne

export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })

export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.options.length })

/** Un mot du corpus prévu pour une classe plus avancée que le niveau serait hors programme. */
export const ecartsAuProgramme = (questions: Question[], contraintes: Contraintes): string[] =>
  questions.filter(q => rang(q.niveauMot) > rang(contraintes.niveau)).map(q => `« ${q.mot} » est prévu pour le ${q.niveauMot.toUpperCase()}`)
