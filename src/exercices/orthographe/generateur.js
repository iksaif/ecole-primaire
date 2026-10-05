// Orthographe — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, nb? })       une partie : nb questions du thème, mélangées
//   questionsFiche({ niveau, reglages, rng })        { niveau, tous, theme, questions } de la fiche (fiche.js les met en page)
//   verifier(q, rep)                                 rep : { choix } (indice) ou { texte } (saisie)
//   bonneReponse(q)                                  une réponse juste (tests)
//   ecartsAuProgramme(x, contraintes)                questions d'une année ultérieure
//   ecartsFiche(html, contraintes)                   idem, lus dans le HTML de la fiche (data-niv)
// Réglage `tous` : « CP → CM2 », toutes les questions (fiche publiée exercices-orthographe-cp-cm2). Les textes affichés
// (explication) sont des fonctions de T. L'ordre des tirages est celui de l'ancienne vue : mêmes fiches.
// Corpus : src/data/orthographe.js.
import DEFINITION, { THEMES, rang } from './definition.js'
import { QUESTIONS } from '../../data/orthographe.js'
import { verdictSaisie } from '../../utils/reponses.js'

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

// Questions d'un thème à un niveau (« tous » : toutes, dans l'ordre) : celles de son année et des années précédentes
const questionsDu = (niveau, theme) => {
  const th = THEMES.find(x => x.id === theme)
  return QUESTIONS[theme].filter(q => rang(q.niv ?? th.niv) <= rang(niveau)).map(q => ({ ...q, niv: q.niv ?? th.niv, theme }))
}

// Thème utilisable à ce niveau (un thème mémorisé absent du niveau reprend le premier du niveau)
function themeDe(niveau, reglages) {
  const offerts = reglages.tous ? THEMES.map(t => t.id) : DEFINITION.niveaux[niveau].options.theme
  return offerts.includes(reglages.theme) ? reglages.theme : offerts[0]
}

// Une question : à choix (phrase à trou, `choix`) ou à compléter (`indice`)
function question(q) {
  const mode = q.type === 'saisie' ? 'saisie' : 'choix'
  const base = { ...q, mode, html: q.phrase.replace('___', '<span class="trou">___</span>'), cle: `${q.theme}:${q.phrase}`, attendu: q.bonne, explication: q.explication ? T => T(q.explication) : null }
  if (mode === 'saisie') return base
  return { ...base, options: q.choix.map(label => ({ label })), bonne: q.choix.findIndex(c => c === q.bonne) }
}

const tirer = (rng, niveau, theme, nb) => rng.melanger([...questionsDu(niveau, theme)]).slice(0, nb).map(question)

/** Une partie : `nb` questions (réglage `nb` par défaut) du thème choisi. */
export function questions({ niveau, reglages, rng, nb }) {
  const n = niveauConnu(niveau)
  return tirer(rng, reglages.tous ? 'tous' : n, themeDe(n, reglages), nb ?? reglages.nb ?? 10)
}

/** Questions de la fiche : { niveau, tous, theme, questions } ; les propositions d'une question à choix sont mélangées (`choixFiche`). */
export function questionsFiche({ niveau, reglages, rng }) {
  const n = niveauConnu(niveau)
  const tous = !!reglages.tous
  const theme = themeDe(n, reglages)
  const qs = tirer(rng, tous ? 'tous' : n, theme, reglages.nb ?? 10)
  // même ordre de tirage que la mise en page d'avant : les questions à choix, dans l'ordre de la fiche
  for (const q of qs) if (q.mode === 'choix') q.choixFiche = rng.melanger([...q.choix])
  return { niveau: n, tous, theme, questions: qs }
}

// ── Réponses : indice choisi (rep.choix), texte saisi (rep.texte ; accents oubliés : faux, avec avertissement)
export function verifier(q, rep) {
  if (rep?.choix !== undefined) return rep.choix === q.bonne
  if (rep?.texte !== undefined) return verdictSaisie(rep.texte, q.attendu)
  return false
}
export const bonneReponse = q => (q.mode === 'choix' ? { choix: q.bonne } : { texte: q.attendu })

// ── Programme : pas de question d'une année ultérieure (les homophones sont déclarés hors programme : jamais proposés par défaut) ──
export function ecartsAuProgramme(x, contraintes) {
  const niveau = contraintes.niveau
  const liste = Array.isArray(x) ? x : x.questions
  const ecarts = []
  const tous = !Array.isArray(x) && x.tous
  for (const q of liste) {
    if (!tous && rang(q.niv) > rang(niveau)) ecarts.push(`${q.theme} : « ${q.phrase} » est du ${q.niv}, pas du ${niveau}`)
  }
  return ecarts
}
