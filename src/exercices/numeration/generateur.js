// Les nombres — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  les questions de la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ? rep : { texte } (nombre), { cdu: {champ: chiffre} },
//                                                 { choix } (proposition), { ordre: [nombres] }
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Une fonction par type de question : questions.js. rng : src/utils/hasard.js ; T(cle, params) : textes (textes.js).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION from './definition.js'
import {
  genDecomposer, genRepresentation, genLettresChiffres, genChiffresLettres, genComparer, genSuites, genDroite, genRanger,
} from './questions.js'

export { fmt, LIBELLES_CDU, libCdu } from './questions.js'

// Données par niveau (les plages et les types proposés sont dans la définition) : pas des droites graduées et des
// suites, nombre de nombres à ranger. lettresMax : plus grand nombre écrit en lettres (CP : cinquante).
const DONNEES = {
  cp: {
    pasDroite: { 100: [1, 10] },
    nbRanger: 5,
    lettresMax: 50,
  },
  ce1: {
    pasDroite: { 100: [1, 10], 1000: [1, 10, 100] },
    pasSuites: { 100: [1, 2, 5, 10], 1000: [1, 10, 100] },
    pasPlusMoins: { 100: [10], 1000: [10, 100] },
    nbRanger: 5,
  },
  ce2: {
    pasDroite: { 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasSuites: { 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasPlusMoins: { 1000: [10, 100], 10000: [10, 100, 1000] },
    nbRanger: 5,
  },
}

const GENERATEURS = {
  decomposer: genDecomposer,
  representation: genRepresentation,
  lettresChiffres: genLettresChiffres,
  chiffresLettres: genChiffresLettres,
  comparer: genComparer,
  suites: genSuites,
  droite: genDroite,
  ranger: genRanger,
}

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

// Répartit les types pour bien mélanger, sans répétition de question
function genererSansRepetition({ rng, T, niveau, reglages }, nb) {
  const niv = DONNEES[niveau]
  const plages = DEFINITION.niveaux[niveau].options.plage
  const max = plages.includes(reglages.plage) ? reglages.plage : plages[plages.length - 1]
  const types = reglages.types.filter(t => GENERATEURS[t])
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = rng.melanger(types)
  const ordre = rng.melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  const vus = new Set()
  const result = []
  let essais = 0, echecs = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    // si un type n'a plus de question neuve (peu de droites possibles…), on en prend un autre
    const type = echecs > 20 ? types[rng.entier(0, types.length - 1)] : ordre[result.length]
    const q = GENERATEURS[rng.choisir([type])]({ rng, T, niv, max })
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q); echecs = 0 } else echecs++
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
  if (q.kind === 'cdu') return q.champs.every(ch => +rep.cdu[ch] === q.reponse[ch])
  if (q.kind === 'ordre') return rep.ordre.length === q.reponse.length && rep.ordre.every((n, i) => n === q.reponse[i])
  return rep.choix === q.reponse
}

export function bonneReponse(q) {
  if (q.kind === 'nombre') return { texte: String(q.reponse) }
  if (q.kind === 'cdu') return { cdu: { ...q.reponse } }
  if (q.kind === 'ordre') return { ordre: [...q.reponse] }
  return { choix: q.reponse }
}

// Nombres au programme du niveau (nombreMax) et nombres écrits en lettres (nombresEnLettresMax)
export function ecartsAuProgramme(qs, contraintes) {
  const ecarts = []
  for (const q of qs) {
    for (const v of q.valeurs) {
      if (v > contraintes.nombreMax) ecarts.push(`${q.cle} : ${v} > ${contraintes.nombreMax}`)
      else if (q.enLettres && v > contraintes.nombresEnLettresMax) ecarts.push(`${q.cle} : ${v} en lettres > ${contraintes.nombresEnLettresMax}`)
    }
  }
  return [...new Set(ecarts)]
}
