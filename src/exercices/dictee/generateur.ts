// Dictée — générateur : QUOI dicter, et comment corriger. Pur : aucun import de Vue, aucun Math.random, ni stockage ni réseau (les phrases
// générées par Mistral sont dans mistral.ts, appelé par la vue) ; lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, nb, vus })   une partie : les mots des catégories cochées, un par question
//   questionsFiche({ niveau, reglages, rng })        les mots de la fiche, par catégorie (fiche.ts les met en page)
//   verifier(q, rep)                                 la saisie { texte } est-elle juste ? → { ok, nuance } (nuance 'accents')
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes) : mots hors des catégories du niveau, ambigus en mots seuls
// vus : mots entendus récemment (mémorisés par la vue d'une séance à l'autre) : repoussés en fin de liste. L'ordre des tirages est celui de
// l'ancienne version : mêmes fiches (instantanés). Mots : src/data/dicteeMots.js.
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { PHRASES_DEFAUT_ALL } from '../../data/dicteeMots.js'
import { verdictSaisie } from '../../utils/reponses.ts'
import DEFINITION, { corpusDe } from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Une question : un mot (et sa phrase en mode « phrases ») ; `attendu` : ce que l'élève écrit (le mot, ou la phrase). */
export interface Question { cle: string, mot: string, phrase: string | null, attendu: string, texte: string, mode: 'mots' | 'phrases', ambigu: boolean }
/** La réponse de l'élève : ce qu'il a écrit. */
export interface Reponse { texte: string }
/** Ce que tire la fiche : les mots, regroupés par catégorie, et les pages demandées. */
export interface TirageFiche { niveau: Classe, mots: string[], parCat: { cat: string, mots: string[] }[], phrases: boolean, liste: boolean, dictee: boolean }

/** La phrase par défaut d'un mot. */
export const phraseDe = (mot: string): string => (PHRASES_DEFAUT_ALL as Record<string, string>)[mot] || `Je vois ${mot}.`

// Les mots des catégories choisies, sans doublon ; sans les mots ambigus en mode « mots seuls »
function motsChoisis(niveau: Classe, reglages: Reglages): string[] {
  const { categories, ambigus } = corpusDe(niveau)
  let pool: string[] = []
  for (const cat of reglages.cats ?? []) if (categories[cat]) pool.push(...categories[cat])
  pool = [...new Set(pool)]
  if (reglages.mode !== 'phrases') pool = pool.filter(m => !ambigus.has(m))
  return pool
}

function question(mot: string, reglages: Reglages, ambigus: Set<string>): Question {
  const enPhrases = reglages.mode === 'phrases'
  const phrase = enPhrases ? phraseDe(mot) : null
  return { cle: mot, mot, phrase, attendu: phrase ?? mot, texte: mot, mode: enPhrases ? 'phrases' : 'mots', ambigu: ambigus.has(mot) }
}

/** Une partie : `nb` mots (réglage `nb` par défaut ; 0 = tous), les mots récemment vus en dernier. */
export function questions({ niveau, reglages, rng, nb = reglages.nb, vus = [] }: ParamsGenerateur<Reglages, Cle> & { vus?: readonly string[] }): Question[] {
  const recents = new Set(vus)
  const pool = motsChoisis(niveau, reglages)
  const frais = rng.melanger(pool.filter(m => !recents.has(m)))
  const anciens = rng.melanger(pool.filter(m => recents.has(m)))
  const mots = [...frais, ...anciens]
  const choisis = nb > 0 ? mots.slice(0, nb) : mots
  return choisis.map(m => question(m, reglages, corpusDe(niveau).ambigus))
}

/** La fiche : les mots tirés, regroupés par catégorie ; les pages demandées (au moins une). */
export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb' | 'T'>): TirageFiche {
  let mots = rng.melanger(motsChoisis(niveau, reglages))
  if (reglages.nb > 0) mots = mots.slice(0, reglages.nb)
  const { categories } = corpusDe(niveau)
  const parCat = (reglages.cats ?? []).map(cat => ({ cat, mots: (categories[cat] ?? []).filter(m => mots.includes(m)) })).filter(g => g.mots.length)
  let liste = !!reglages.liste, dictee = !!reglages.dictee
  if (!liste && !dictee) { liste = true; dictee = true }
  return { niveau, mots, parCat, phrases: reglages.mode === 'phrases', liste, dictee }
}

// Accents oubliés : comptés faux, avec la nuance 'accents'
export const verifier = (q: Question, rep: Reponse): Verdict => verdictSaisie(rep.texte, q.attendu)
export const bonneReponse = (q: Question): Reponse => ({ texte: q.attendu })
export const mauvaiseReponse = (q: Question): Reponse => ({ texte: `${q.attendu}zz` })

// ── Programme : les mots sont ceux des catégories du niveau ; pas de mot ambigu en mots seuls ──
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const niveau = contraintes.niveau as Classe
  const permis = new Set(Object.values(corpusDe(niveau).categories).flat())
  if (!Array.isArray(x)) return (x as TirageFiche).mots.filter(m => !permis.has(m)).map(m => `« ${m} » n'est pas dans le corpus du ${niveau}`)
  const ecarts: string[] = []
  for (const q of x as readonly Question[]) {
    if (!permis.has(q.mot)) ecarts.push(`« ${q.mot} » n'est pas dans le corpus du ${niveau}`)
    if (q.mode === 'mots' && q.ambigu) ecarts.push(`« ${q.mot} » est ambigu en mots seuls`)
  }
  return ecarts
}
