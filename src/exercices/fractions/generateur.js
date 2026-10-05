// Les fractions — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  les questions de la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ? rep : { texte } (nombre), { choix } (proposition),
//                                                 { parts } (nombre de parts coloriées), { graduation } (rang sur la droite)
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Une fonction par type de question : questions.js. rng : src/utils/hasard.js ; T(cle, params) : textes (textes.js).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION from './definition.js'
import { genIdentifier, genColorier, genLettres, genPartDe, genEgales, genDroite, genPlacer, cle } from './questions.js'

export { cle, tn, enLettres, ordinal } from './questions.js'

// Données par niveau (programme : fractions ≤ 1 au cycle 2, dénominateurs 2, 3, 4, 5, 6, 8, 10). Les types proposés
// sont dans la définition. partDe : « la moitié de 8 » (calcul mental du cycle 2) : totaux possibles (nom : catalogue
// partDe_<d>) ; le tiers ou le quart d'une quantité (fraction opérateur) est au programme du CM1.
const DONNEES = {
  ce1: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    partDe: { 2: { max: 20, extra: [30, 40, 50, 60, 80, 100] } },
  },
  ce2: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    droiteUnites: [1],             // droite graduée de 0 à 1 (fractions ≤ 1)
    partDe: { 2: { max: 40, extra: [50, 60, 80, 100, 200, 500] } },
  },
}

const GENERATEURS = {
  identifier: genIdentifier, colorier: genColorier, lettres: genLettres, partDe: genPartDe,
  egales: genEgales, droite: genDroite, placer: genPlacer,
}

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

function genererSansRepetition({ rng, T, niveau, reglages }, nb) {
  const niv = DONNEES[niveau]
  const mode = reglages.mode === 'unitaires' ? 'unitaires' : 'toutes'
  const offerts = DEFINITION.niveaux[niveau].options.types
  let types = reglages.types.filter(t => GENERATEURS[t] && offerts.includes(t))
  if (!types.length) types = offerts
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = rng.melanger(types)
  const ordre = rng.melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  const vus = new Set()
  const result = []
  let essais = 0, echecs = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const type = echecs > 20 ? types[rng.entier(0, types.length - 1)] : ordre[result.length]
    const qu = GENERATEURS[type]({ rng, T, niv, mode })
    if (!vus.has(qu.cle)) { vus.add(qu.cle); result.push(qu); echecs = 0 } else echecs++
  }
  return result
}

export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ ?? 10 }) {
  return genererSansRepetition({ rng, T, niveau: niveauConnu(niveau), reglages }, nb)
}

export function questionsFiche({ niveau, reglages, rng, T }) {
  return genererSansRepetition({ rng, T, niveau: niveauConnu(niveau), reglages }, reglages.nbFiche ?? 10)
}

export function verifier(q, rep) {
  if (q.kind === 'nombre') return +String(rep.texte).trim() === q.reponse
  if (q.kind === 'parts') return rep.parts === q.reponse.n
  if (q.kind === 'placer') return rep.graduation === q.reponse.n
  return cle(rep.choix) === cle(q.reponse)
}

export function bonneReponse(q) {
  if (q.kind === 'nombre') return { texte: String(q.reponse) }
  if (q.kind === 'parts') return { parts: q.reponse.n }
  if (q.kind === 'placer') return { graduation: q.reponse.n }
  return { choix: q.reponse }
}

// Fractions demandées ou affichées (pas les propositions) : dénominateur au programme, fraction ≤ 1.
// Écart connu, non corrigé (les fiches resteraient identiques sinon) : le distracteur « inversion » (3/4 → 4/3) peut montrer
// une fraction > 1 parmi les propositions.
export function ecartsAuProgramme(qs, contraintes) {
  const k = contraintes.fractions
  if (!k) return ['fractions : pas au programme du niveau']
  const ecarts = []
  for (const q of qs) for (const f of q.fractions) {
    const ok = k.denominateurs ? k.denominateurs.includes(f.d) : f.d <= k.denominateurMax
    if (!ok) ecarts.push(`${cle(f)} : dénominateur ${f.d}`)
    if (!k.superieuresA1 && f.n > f.d) ecarts.push(`${cle(f)} : fraction > 1`)
  }
  return [...new Set(ecarts)]
}
