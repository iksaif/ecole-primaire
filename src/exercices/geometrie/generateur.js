// La géométrie — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   decrire(q, rep, T) / messageErreur(q, rep, T) la réponse donnée en texte (tableau de fin) ; le retour après une erreur
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
//   manquesAuProgramme(reglages, contraintes)     ce que le programme demande et que « tout » ne propose pas (tests)
// rng : src/utils/hasard.js ; T(cle, params) : textes de l'exercice dans la langue du contenu (textes.js).
// Un module par famille de questions : quadrillage.js (symétrie, reproduction, repérage), figures.js (figures,
// solides, angles droits, propriétés, cercle), patrons.js ; données dans donnees.js, dessins dans dessins.js.
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import { donneesDe, niveauConnu, PROPRIETES, aChoix, FIGURES, SOLIDES } from './donnees.js'
import { genSymetrie, genReproduction, genReperage, k, dek, nomCase } from './quadrillage.js'
import { genFigure, genSolide, genAngles, genPropriete, genCercle, construireFigure } from './figures.js'
import { genPatron, patrons, normaliserCases, SYMETRIES } from './patrons.js'

export { construireFigure }

// Types d'exercices demandés ET offerts par le niveau (sinon tous ceux du niveau)
const typesDispo = (reglages, niv) => {
  const t = (reglages.exercices ?? []).filter(e => niv.exercices.includes(e))
  return t.length ? t : niv.exercices
}

function genererQuestion(ctx, reglages, type) {
  const { rng, niv } = ctx
  const t = type || rng.choisir(typesDispo(reglages, niv))
  if (t === 'symetrie') return genSymetrie(ctx, reglages.axeHorizontal && rng.vrai(0.5))
  if (t === 'reproduction') return genReproduction(ctx)
  if (t === 'reperage') return genReperage(ctx)
  if (t === 'figures') return genFigure(ctx)
  if (t === 'angles') return genAngles(ctx)
  if (t === 'proprietes') return genPropriete(ctx)
  if (t === 'cercle') return genCercle(ctx)
  if (t === 'patrons') return genPatron(ctx)
  return genSolide(ctx)
}

function genererSansRepetition(ctx, reglages, nb, type) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const q = genererQuestion(ctx, reglages, type)
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q) }
  }
  return result
}

const contexte = (niveau, rng, T) => ({ rng, T, niv: donneesDe(niveau) })

export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ ?? 8 }) {
  return genererSansRepetition(contexte(niveau, rng, T), reglages, nb)
}

// Symboles du repérage de la fiche (cases à nommer)
export const SYMBOLES = ['★', '●', '▲', '■']

/**
 * Tout ce que tire la fiche : une rubrique par exercice coché (et offert par le niveau), dans l'ordre de la fiche.
 * Rubriques : symetrie, reproduction (listes de questions), reperage { cols, rows, aColorier, symboles, lectures },
 * figures [{ forme, … }], solides [id], angles (questions), proprietes [propriété], cercle { rot }, patrons [{ cases, valide }].
 */
export function questionsFiche({ niveau, reglages, rng, T }) {
  const ctx = contexte(niveau, rng, T)
  const { niv } = ctx
  const ex = reglages.exercices
  const a = id => ex.includes(id) && niv.exercices.includes(id)
  const x = { niveau: niveauConnu(niveau) }
  if (a('symetrie')) x.symetrie = genererSansRepetition(ctx, reglages, 3, 'symetrie')
  if (a('reproduction')) x.reproduction = genererSansRepetition(ctx, reglages, 2, 'reproduction')
  if (a('reperage')) {
    const { cols, rows } = niv.reperage
    const cases = rng.melanger(Array.from({ length: cols * rows }, (_, i) => k(i % cols, Math.floor(i / cols)))).slice(0, 8)
    x.reperage = {
      cols, rows,
      aColorier: cases.slice(0, 4).map(c => nomCase(...dek(c))),
      symboles: Object.fromEntries(cases.slice(4).map((c, i) => [c, SYMBOLES[i]])),
      lectures: cases.slice(4).map((c, i) => ({ symbole: SYMBOLES[i], nom: nomCase(...dek(c)) })),
    }
  }
  if (a('figures')) x.figures = rng.melanger(niv.figures).map(forme => ({ forme, ...construireFigure(rng, forme) }))
  if (a('solides')) x.solides = rng.melanger(niv.solides)
  if (a('angles')) x.angles = genererSansRepetition(ctx, reglages, 4, 'angles')
  if (a('proprietes')) x.proprietes = rng.melanger(PROPRIETES.filter(p => !aChoix(p))).slice(0, 6)
  if (a('cercle')) x.cercle = { rot: rng.entier(0, 359) }
  if (a('patrons')) {
    const { valides, invalides } = patrons()
    x.patrons = rng.melanger([...rng.melanger(valides).slice(0, 3).map(h => ({ h, valide: true })),
      ...rng.melanger(invalides).slice(0, 3).map(h => ({ h, valide: false }))])
      .map(({ h, valide }) => ({ cases: normaliserCases(h.map(rng.choisir(SYMETRIES))), valide }))
  }
  return x
}

// ── Réponses ──
// rep : { choix: indice } (question à choix) ; { selection: [clés de cases] } (symétrie, reproduction, repérage) ;
// { lettres: ['A', 'C'] ou ['aucun'] } (angles droits)
const memeEnsemble = (a, b) => a.length === b.length && a.every(x => b.includes(x))

export function verifier(q, rep) {
  if (rep.choix !== undefined) return rep.choix === q.bonne
  if (rep.lettres) return memeEnsemble(rep.lettres.includes('aucun') ? [] : rep.lettres, q.droits)
  return memeEnsemble([...new Set(rep.selection)], q.cellules)
}

export function bonneReponse(q) {
  if (q.options) return { choix: q.bonne }
  if (q.type === 'angles') return { lettres: q.droits.length ? q.droits : ['aucun'] }
  return { selection: [...q.cellules] }
}

// cases justes / en trop / oubliées d'une sélection
export function bilanCases(q, selection) {
  const justes = selection.filter(c => q.cellules.includes(c)).length
  return { justes, enTrop: selection.length - justes, manquantes: q.cellules.length - justes }
}

/** La réponse donnée, en texte (colonne « Ta réponse » du tableau de fin). */
export function decrire(q, rep, T) {
  if (rep.choix !== undefined) return q.choix[rep.choix]
  if (rep.lettres) return rep.lettres.includes('aucun') ? T('aucun') : [...rep.lettres].sort().join(', ')
  if (q.type === 'reperage') return nomCase(...dek(rep.selection[0]))
  const { justes, enTrop } = bilanCases(q, rep.selection)
  return T('casesJustes', { justes, total: q.cellules.length }) + (enTrop ? T('casesEnTrop', { n: enTrop }) : '')
}

/** Retour après une erreur (rep : null si la question est passée). */
export function messageErreur(q, rep, T) {
  if (!rep) return ''
  if (rep.choix !== undefined) return `❌ ${T('bonneReponse')} : ${q.reponse}`
  if (rep.lettres) return q.droits.length ? T('anglesFaux', { attendu: q.attendu }) : T('anglesAucunFaux')
  if (q.type === 'reperage') return T('reperageFaux', { donne: decrire(q, rep, T), nom: q.nom })
  const { manquantes, enTrop } = bilanCases(q, rep.selection)
  return T('presque', { manquantes, enTrop })
}

// ── Programme ──
// Les questions d'un jeu (tableau) ou le tirage d'une fiche, ramenés à une liste de { type, … }
function elementsDe(x) {
  if (Array.isArray(x)) return x
  return [
    ...(x.symetrie ?? []), ...(x.reproduction ?? []), ...(x.angles ?? []),
    ...(x.figures ?? []).map(f => ({ type: 'figure', sous: 'nom', forme: f.forme })),
    ...(x.solides ?? []).map(solide => ({ type: 'solide', sous: 'nom', solide })),
    ...(x.proprietes ?? []).map(p => ({ type: 'proprietes', prop: p.id })),
    ...(x.cercle ? [{ type: 'cercle' }] : []),
    ...(x.patrons ?? []).map(() => ({ type: 'patron' })),
    ...(x.reperage ? [{ type: 'reperage' }] : []),
  ]
}

export function ecartsAuProgramme(x, contraintes) {
  const ecarts = []
  const figure = id => { if (!contraintes.figures.includes(id)) ecarts.push(`figure ${id} hors programme`) }
  for (const e of elementsDe(x)) {
    if (e.type === 'figure') figure(FIGURES[e.forme].programme)
    if (e.type === 'cercle') figure('cercle')
    // « Quelle figure a… ? » propose le losange et le triangle rectangle parmi les réponses
    if (e.type === 'proprietes' && (e.prop.startsWith('q-') || /losange/.test(e.prop))) figure('losange')
    if (e.type === 'proprietes' && (e.prop.startsWith('q-') || /trirect/.test(e.prop))) figure('triangle-rectangle')
    if (e.type === 'solide') {
      if (!contraintes.solides.includes(e.solide)) ecarts.push(`solide ${e.solide} hors programme`)
      if ((e.sous === 'faces' || e.sous === 'sommets') && !contraintes.solidesDecrits.includes(e.solide)) ecarts.push(`${e.sous} du ${e.solide} : solide non décrit à ce niveau`)
    }
    if (e.type === 'symetrie' && !contraintes.symetrie) ecarts.push('symétrie hors programme')
    if (e.type === 'patron' && !contraintes.patrons?.includes('cube')) ecarts.push('patron du cube hors programme')
    if (e.type === 'angles' && e.forme === 'losange') figure('losange')
  }
  return [...new Set(ecarts)]
}

export function manquesAuProgramme(reglages, contraintes) {
  const manques = []
  const ex = reglages.exercices
  const niv = donneesDe(reglages.niveau)
  if (contraintes.symetrie && !ex.includes('symetrie')) manques.push('symétrie')
  if (contraintes.patrons?.includes('cube') && !ex.includes('patrons')) manques.push('patron du cube')
  for (const s of contraintes.solides) if (!(s in SOLIDES) || !niv.solides.includes(s)) manques.push(`solide ${s}`)
  const offertes = niv.figures.map(f => FIGURES[f].programme)
  // le disque (maternelle, CP) se nomme « cercle » à partir du CE1
  for (const f of contraintes.figures) if (f !== 'disque' && !offertes.includes(f)) manques.push(`figure ${f}`)
  return manques
}
