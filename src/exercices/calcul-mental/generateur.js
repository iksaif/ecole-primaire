// Calcul mental — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions du jeu, sans répétition de texte
//   questionsFiche({ niveau, reglages, rng, T })  calculs de la fiche imprimable (reglages.nbFiche), mêmes questions
//   verifier(q, rep)                              rep : le nombre tapé (texte ou nombre)
//   bonneReponse(q)                               une réponse juste (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
//   libelleOp(op, niveau, T)                      libellé d'une opération (boutons, en-tête de la fiche)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.
// Les fiches « à la carte » de src/impression/calcul.js (presets avec graine, tables d'addition, suites, restes…) ont
// leur propre générateur : elles ne changent pas (plan 10, phase 2d).
import DEFINITION, { OPS } from './definition.js'
import { contraintesDe } from '../../data/programme.js'

const { VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE } = OPS
const plage = (min, max, pas = 1) => { const t = []; for (let n = min; n <= max; n += pas) t.push(n); return t }

// mul / div : [min, max] (facteurs dans la plage) ou { tables, max } (tables × 1 à max)
// doubles : nombres dont on demande le double (les moitiés portent sur les doubles correspondants)
// c100 : 'dizaines' (30 + ? = 100) ou 'quelconque' (37 + ? = 100)
// x10 : plages des nombres multipliés par 10 et par 100
// strat : borne max des calculs « stratégiques » (± dizaines, ± 9/11, passage et complément à la dizaine)
const NIVEAUX = {
  cp: { add: [1, 10], sou: [1, 10], mul: null, div: null, doubles: plage(1, 10), c100: null, x10: null, strat: null },
  // CE1 : pas de division (hors programme), tables de 2, 3, 4, 5 et 10 ; doubles et moitiés : les listes du programme
  ce1: {
    add: [1, 20], sou: [1, 20], mul: { tables: [2, 3, 4, 5, 10], max: 10 }, div: null,
    doubles: contraintesDe('ce1').doubles, c100: 'dizaines', x10: { x10: [1, 99], x100: null },  // × 100 : CE2
    strat: 100,
  },
  // CE2 : tables de 2 à 9, division = « combien de fois » dans les tables
  ce2: {
    add: [1, 99], sou: [1, 99],
    mul: { tables: [2, 3, 4, 5, 6, 7, 8, 9], max: 10 }, div: { tables: [2, 3, 4, 5, 6, 7, 8, 9], max: 10 },
    doubles: [...plage(1, 50), ...plage(60, 100, 10), ...plage(200, 500, 100)], c100: 'quelconque',
    x10: { x10: [1, 999], x100: [1, 99] }, strat: 1000,
  },
  cm1: {
    add: [1, 999], sou: [1, 999], mul: [2, 12], div: [1, 12],
    doubles: [...plage(1, 100), ...plage(110, 500, 10), ...plage(600, 1000, 100)], c100: 'quelconque',
    x10: { x10: [1, 999], x100: [1, 999] }, strat: 1000,
  },
  cm2: {
    add: [1, 999], sou: [1, 999], mul: [2, 25], div: [1, 25],
    doubles: [...plage(1, 100), ...plage(110, 500, 10), ...plage(600, 5000, 100)], c100: 'quelconque',
    x10: { x10: [1, 9999], x100: [1, 999] }, strat: 1000,
  },
}
const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

// Libellés : clés du catalogue d'interface ; « +, −, ×, ÷, ± 9 / ± 11 » s'affichent tels quels
const LIBELLES_OPS = {
  'Compléments à 10': 'op_complements10',
  'Compléments à 100': 'op_complements100',
  [VERS_DIZAINE]: 'op_versDizaine',
  [DIZAINES]: 'op_dizaines',
  [PASSAGE]: 'op_passage',
  Doubles: 'op_doubles',
  'Moitiés': 'op_moities',
}
// (au CE1, « × 10 / × 100 » ne propose que × 10 : × 100 est au programme du CE2)
export function libelleOp(op, niveau, T) {
  if (op === '× 10 / × 100' && NIVEAUX[niveau]?.x10 && !NIVEAUX[niveau].x10.x100) return '× 10'
  return LIBELLES_OPS[op] ? T(LIBELLES_OPS[op]) : op
}

function complement(rng, total, a) {
  const b = total - a
  return rng.vrai(0.5)
    ? { texte: `${a} + ? = ${total}`, reponse: b }
    : { texte: `? + ${b} = ${total}`, reponse: a }
}

function question(niveau, ops, rng, T) {
  const niv = NIVEAUX[niveau]
  const op = ops[rng.entier(0, ops.length - 1)]
  const q = calculer(niv, op, rng, T)
  return { ...q, op, attendu: q.reponse }
}

function calculer(niv, op, rng, T) {
  if (op === 'Compléments à 10') return complement(rng, 10, rng.entier(1, 9))

  if (op === 'Compléments à 100') {
    const a = niv.c100 === 'dizaines' ? rng.entier(1, 9) * 10 : rng.entier(1, 99)
    return complement(rng, 100, a)
  }

  if (op === VERS_DIZAINE) {
    // 37 + ? = 40
    let a
    do { a = rng.entier(11, niv.strat - 1) } while (a % 10 === 0)
    const cible = Math.ceil(a / 10) * 10
    return { texte: `${a} + ? = ${cible}`, reponse: cible - a }
  }

  if (op === DIZAINES) {
    // 45 + 30, 76 − 20 (nombre non rond ± dizaines entières)
    const N = niv.strat
    let a, d
    if (rng.vrai(0.5)) {
      do { a = rng.entier(11, N - 11) } while (a % 10 === 0)
      d = rng.entier(1, Math.min(9, Math.floor((N - 1 - a) / 10))) * 10
      return { texte: `${a} + ${d} = ?`, reponse: a + d }
    }
    do { a = rng.entier(21, N - 1) } while (a % 10 === 0)
    d = rng.entier(1, Math.min(9, Math.floor((a - 1) / 10))) * 10
    return { texte: `${a} − ${d} = ?`, reponse: a - d }
  }

  if (op === NEUF_ONZE) {
    const n = rng.vrai(0.5) ? 9 : 11
    const a = rng.entier(12, niv.strat - 12)
    return rng.vrai(0.5)
      ? { texte: `${a} + ${n} = ?`, reponse: a + n }
      : { texte: `${a} − ${n} = ?`, reponse: a - n }
  }

  if (op === PASSAGE) {
    // 47 + 6 (on dépasse la dizaine) ou 53 − 7 (on redescend sous la dizaine)
    const N = niv.strat
    if (rng.vrai(0.5)) {
      let a, b
      do { a = rng.entier(12, N - 10); b = rng.entier(2, 9) } while (a % 10 + b < 10 || a % 10 === 0)
      return { texte: `${a} + ${b} = ?`, reponse: a + b }
    }
    let a, b
    do { a = rng.entier(21, N - 1); b = rng.entier(2, 9) } while (a % 10 >= b)
    return { texte: `${a} − ${b} = ?`, reponse: a - b }
  }

  if (op === 'Doubles') {
    const n = niv.doubles[rng.entier(0, niv.doubles.length - 1)]
    return { texte: T('doubleDe', { n }), reponse: n * 2 }
  }

  if (op === 'Moitiés') {
    const n = niv.doubles[rng.entier(0, niv.doubles.length - 1)]
    return { texte: T('moitieDe', { n: n * 2 }), reponse: n }
  }

  if (op === '× 10 / × 100') {
    const fois100 = !!niv.x10.x100 && rng.vrai(0.5)
    const n = rng.entier(...(fois100 ? niv.x10.x100 : niv.x10.x10))
    const m = fois100 ? 100 : 10
    return { texte: `${n} × ${m} = ?`, reponse: n * m }
  }

  let a, b, rep
  if (op === '+') {
    a = rng.entier(...niv.add); b = rng.entier(...niv.add); rep = a + b
  } else if (op === '−') {
    a = rng.entier(...niv.sou); b = rng.entier(1, a); rep = a - b
  } else if (op === '×') {
    if (Array.isArray(niv.mul)) {
      a = rng.entier(...niv.mul); b = rng.entier(...niv.mul)
    } else {
      // tables du niveau : un facteur dans les tables, l'autre de 1 à max, ordre aléatoire
      const t = niv.mul.tables[rng.entier(0, niv.mul.tables.length - 1)]
      const f = rng.entier(1, niv.mul.max)
      ;[a, b] = rng.vrai(0.5) ? [t, f] : [f, t]
    }
    rep = a * b
  } else {
    if (Array.isArray(niv.div)) {
      b = rng.entier(...niv.div); rep = rng.entier(...niv.div)
    } else {
      // partages correspondant aux tables : 35 ÷ 5, 18 ÷ 3…
      b = niv.div.tables[rng.entier(0, niv.div.tables.length - 1)]
      rep = rng.entier(1, niv.div.max)
    }
    a = b * rep
  }
  return { texte: `${a} ${op} ${b} = ?`, reponse: rep }
}

// Opérations choisies et proposées au niveau (une opération absente du niveau est ignorée ; « + » à défaut)
export function opsDuNiveau(niveau, ops) {
  const offertes = DEFINITION.niveaux[niveau].options.ops
  const choisies = (ops ?? []).filter(o => offertes.includes(o))
  return choisies.length ? choisies : ['+']
}

function sansRepetition(niveau, reglages, rng, T, nb) {
  const ops = opsDuNiveau(niveau, reglages.ops)
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const q = question(niveau, ops, rng, T)
    if (!vus.has(q.texte)) { vus.add(q.texte); result.push(q) }
  }
  return result
}

export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ }) {
  return sansRepetition(niveauConnu(niveau), reglages, rng, T, nb)
}

export const questionsFiche = ({ niveau, reglages, rng, T }) => sansRepetition(niveauConnu(niveau), reglages, rng, T, reglages.nbFiche)

export const verifier = (q, rep) => String(rep ?? '').trim() !== '' && +rep === q.reponse

export const bonneReponse = q => String(q.reponse)

// Nombres en jeu et résultats ≤ calculMentalMax ; opérations du niveau ; doubles et moitiés : listes du programme
// (au CP et au CE1, où elles sont reprises telles quelles)
export function ecartsAuProgramme(questions, contraintes) {
  const ecarts = []
  const offertes = DEFINITION.niveaux[contraintes.niveau].options.ops
  const nombre = x => Number(String(x).replace(/\D/g, ''))
  for (const q of questions) {
    const max = Math.max(q.reponse, ...(q.texte.match(/\d+/g) ?? []).map(Number))
    if (max > contraintes.calculMentalMax) ecarts.push(`${q.texte} : ${max} > ${contraintes.calculMentalMax} (calculMentalMax)`)
    if (!offertes.includes(q.op)) ecarts.push(`${q.texte} : opération « ${q.op} » hors du niveau`)
    if (['cp', 'ce1'].includes(contraintes.niveau)) {
      if (q.op === 'Doubles' && !contraintes.doubles.includes(nombre(q.texte))) ecarts.push(`${q.texte} : double hors programme`)
      if (q.op === 'Moitiés' && !contraintes.moities.includes(nombre(q.texte))) ecarts.push(`${q.texte} : moitié hors programme`)
    }
  }
  return [...new Set(ecarts)]
}
