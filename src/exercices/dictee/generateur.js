// Dictée — générateur (pur : aucun import de Vue, aucun Math.random, ni stockage ni réseau ; lisible par node).
//   questions({ niveau, reglages, rng, nb?, vus? })   une partie : les mots des catégories cochées, un par question
//   questionsFiche({ niveau, reglages, rng })          les mots de la fiche, par catégorie (fiche.js les met en page)
//   verifier(q, rep)                                   la saisie { texte } est-elle juste ? → { ok, nuance } (nuance 'accents')
//   bonneReponse(q)                                    une réponse juste (tests)
//   ecartsAuProgramme(x, contraintes)                  mots hors des catégories du niveau, mots ambigus en mots seuls
// vus : mots entendus récemment (mémorisés par la vue d'une séance à l'autre) : repoussés en fin de liste.
// En mode « phrases », `phrase` est celle de src/data/dicteeMots.js ; la vue peut la remplacer par une phrase générée
// (clé Mistral des parents) avant de démarrer. Mots : src/data/dicteeMots.js.
import DEFINITION, { corpusDe } from './definition.js'
import { PHRASES_DEFAUT_ALL } from '../../data/dicteeMots.js'
import { verdictSaisie } from '../../utils/reponses.js'

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

/** Phrase par défaut d'un mot. */
export const phraseDe = mot => PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`

// Mots des catégories choisies (sans doublon ; sans les homophones / ambigus en mode « mots seuls »)
function motsChoisis(niveau, reglages) {
  const { categories, ambigus } = corpusDe(niveau)
  let pool = []
  for (const cat of reglages.cats ?? []) if (categories[cat]) pool.push(...categories[cat])
  pool = [...new Set(pool)]
  if (reglages.mode !== 'phrases') pool = pool.filter(m => !ambigus.has(m))
  return pool
}

const question = (mot, reglages, ambigus) => {
  const phrase = reglages.mode === 'phrases' ? phraseDe(mot) : null
  return { cle: mot, mot, phrase, attendu: phrase ?? mot, texte: mot, mode: reglages.mode === 'phrases' ? 'phrases' : 'mots', ambigu: ambigus.has(mot) }
}

/** Une partie : `nb` mots (réglage `nb` par défaut ; 0 = tous), les mots récemment vus en dernier. */
export function questions({ niveau, reglages, rng, nb, vus = [] }) {
  const n = niveauConnu(niveau)
  const recents = new Set(vus)
  const pool = motsChoisis(n, reglages)
  const frais = rng.melanger(pool.filter(m => !recents.has(m)))
  const anciens = rng.melanger(pool.filter(m => recents.has(m)))
  const nbMots = nb ?? reglages.nb ?? 10
  const mots = [...frais, ...anciens]
  return (nbMots > 0 ? mots.slice(0, nbMots) : mots).map(m => question(m, reglages, corpusDe(n).ambigus))
}

/** La fiche : mots tirés, regroupés par catégorie ; pages demandées (au moins une). */
export function questionsFiche({ niveau, reglages, rng }) {
  const n = niveauConnu(niveau)
  let mots = rng.melanger(motsChoisis(n, reglages))
  const nbMots = reglages.nb ?? 10
  if (nbMots > 0) mots = mots.slice(0, nbMots)
  const { categories } = corpusDe(n)
  const parCat = (reglages.cats ?? []).map(cat => ({ cat, mots: (categories[cat] ?? []).filter(m => mots.includes(m)) })).filter(g => g.mots.length)
  let liste = !!reglages.liste, dictee = !!reglages.dictee
  if (!liste && !dictee) liste = dictee = true
  return { niveau: n, mots, parCat, phrases: reglages.mode === 'phrases', liste, dictee }
}

// Verdict d'une saisie { texte } : { ok, nuance }. Accents oubliés : comptés faux, avec la nuance 'accents'
export const verifier = (q, rep) => verdictSaisie(rep?.texte, q.attendu)
export const bonneReponse = q => ({ texte: q.attendu })

// ── Programme : les mots sont ceux des catégories du niveau ; pas de mot ambigu en mots seuls ──
export function ecartsAuProgramme(x, contraintes) {
  const niveau = contraintes.niveau
  const { categories } = corpusDe(niveau)
  const permis = new Set(Object.values(categories).flat())
  const ecarts = []
  if (Array.isArray(x)) {
    for (const q of x) {
      if (!permis.has(q.mot)) ecarts.push(`« ${q.mot} » n'est pas dans le corpus du ${niveau}`)
      if (q.mode === 'mots' && q.ambigu) ecarts.push(`« ${q.mot} » est ambigu en mots seuls`)
    }
  } else for (const m of x.mots) if (!permis.has(m)) ecarts.push(`« ${m} » n'est pas dans le corpus du ${niveau}`)
  return ecarts
}

// Toutes les catégories du niveau sont proposées (« tout au programme »)
export function manquesAuProgramme(reglages, contraintes) {
  const choisies = reglages.cats ?? []
  return Object.keys(corpusDe(contraintes.niveau).categories).filter(c => !choisies.includes(c)).map(c => `catégorie ${c} non proposée`)
}
