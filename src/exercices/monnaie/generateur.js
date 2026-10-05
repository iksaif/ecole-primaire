// La monnaie — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js ; T(cle, params) : textes de l'exercice dans la langue du contenu (textes.js).
// Toutes les sommes sont en CENTIMES entiers. L'ordre des tirages est celui de l'ancienne vue : même flux de hasard,
// mêmes fiches.
import DEFINITION from './definition.js'

// Pièces et billets de l'euro (en centimes), du plus grand au plus petit
export const VALEURS = [10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

// Données par niveau. notation : 'ec' (« 3 € 50 c ») ou 'les2' (« 3,50 € (3 € 50 c) ») ; saisieDecimale : la somme
// comptée s'écrit dans un seul champ (« 3,50 € »). Sans `centimes` : le niveau n'a que des euros entiers.
const DONNEES = {
  // CP : montants entiers d'euros, jamais plus de 100 € (programme : c2maths p. 26)
  cp: {
    notation: 'ec',
    saisieDecimale: false,
    compter: { entiers: { valeurs: [100, 200, 500, 1000, 2000], nb: [2, 5], min: 300, max: 5000 } },
    composer: { entiers: { min: 200, max: 5000, pas: 100 } },
    moins: { minPieces: { entiers: 2 } },
    rendre: {
      entiers: [
        { paye: 500,  rendu: [100, 400], pas: 100 },
        { paye: 1000, rendu: [100, 900], pas: 100 },
        { paye: 2000, rendu: [100, 1000], pas: 100 },
      ],
    },
    comparer: { entiers: { valeurs: [100, 200, 500, 1000], nb: [2, 5], max: 3000 }, probaEgal: 0.15 },
    palette: { entiers: [100, 200, 500, 1000, 2000, 5000] },
  },
  ce1: {
    notation: 'ec',
    saisieDecimale: false,
    compter: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [2, 6], min: 300, max: 9900 },
      centimes: { euros: [100, 200, 500, 1000], nbEuros: [1, 3], maxEuros: 2000,
                  cents: [1, 2, 5, 10, 20, 50], nbCents: [2, 5], maxCents: 99 },
    },
    composer: {
      entiers:  { min: 300, max: 9900, pas: 100 },
      centimes: { euros: [1, 20], cents: [1, 99] },
    },
    moins: { minPieces: { entiers: 2, centimes: 3 } },
    rendre: {
      entiers: [
        { paye: 500,  rendu: [100, 400],  pas: 100 },
        { paye: 1000, rendu: [100, 900],  pas: 100 },
        { paye: 2000, rendu: [100, 1000], pas: 100 },
        { paye: 5000, rendu: [100, 2500], pas: 100 },
      ],
      centimes: [
        { paye: 100, rendu: [5, 95],  pas: 5 },
        { paye: 200, rendu: [5, 95],  pas: 5 },
        { paye: 500, rendu: [5, 250], pas: 5 },
      ],
    },
    comparer: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000], nb: [2, 6], max: 5000 },
      centimes: { valeurs: [5, 10, 20, 50, 100, 200, 500], nb: [3, 6], max: 1000 },
      probaEgal: 0.15,
    },
    palette: {
      entiers:  [100, 200, 500, 1000, 2000, 5000],
      centimes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
    },
  },
  // CE2 : euros et centimes, 1 € = 100 c, écriture « 3,50 € », sommes jusqu'à 200 €, billet de 100 €
  ce2: {
    notation: 'les2',
    saisieDecimale: true,
    compter: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000, 10000], nb: [3, 8], min: 1000, max: 19900 },
      // plus de 1 € en pièces de centimes : il faut regrouper 100 c = 1 €
      centimes: { euros: [100, 200, 500, 1000, 2000, 5000], nbEuros: [2, 4], maxEuros: 10000,
                  cents: [1, 2, 5, 10, 20, 50], nbCents: [3, 7], maxCents: 250 },
    },
    composer: {
      entiers:  { min: 1000, max: 19900, pas: 100 },
      centimes: { euros: [1, 99], cents: [1, 99] },
    },
    moins: { minPieces: { entiers: 3, centimes: 4 } },
    rendre: {
      entiers: [
        { paye: 2000,  rendu: [100, 1000], pas: 100 },
        { paye: 5000,  rendu: [100, 2500], pas: 100 },
        { paye: 10000, rendu: [100, 5000], pas: 100 },
      ],
      centimes: [
        { paye: 500,  rendu: [5, 300],  pas: 5 },
        { paye: 1000, rendu: [5, 500],  pas: 5 },
        { paye: 2000, rendu: [5, 1000], pas: 5 },
      ],
    },
    comparer: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [3, 7], max: 20000 },
      centimes: { valeurs: [5, 10, 20, 50, 100, 200, 500, 1000], nb: [4, 7], max: 3000 },
      probaEgal: 0.15,
    },
    convertir: { min: 105, max: 995 },
    palette: {
      entiers:  [100, 200, 500, 1000, 2000, 5000, 10000],
      centimes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    },
  },
}

// Emojis des objets à acheter, rangés par prix plausible ; noms dans le catalogue de contenu (`objets`, même ordre)
export const EMOJIS = {
  pasCher:  ['🍎', '✏️', '🍬', '🧃', '🥖'],
  moyen:    ['🍫', '📒', '⚽', '🖍️', '🚗'],
  cher:     ['🧸', '🧩', '📕', '🎨'],
  tresCher: ['🛴', '🛼', '🎲', '🎧'],
}

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)
/** Données du niveau (notation, saisie, palettes…) */
export const donnees = niveau => DONNEES[niveauConnu(niveau)]
// Types d'exercices du niveau (définition) et réglage « centimes » ramené aux options du niveau
const typesDu = niveau => DEFINITION.niveaux[niveauConnu(niveau)].options.exercices
export const avecCentimes = (niveau, reglages) => !!reglages.centimes && DEFINITION.niveaux[niveauConnu(niveau)].options.centimes.includes(true)
/** Pièces et billets proposés (à l'écran et sur la fiche) */
export const palette = (niveau, centimes) => donnees(niveau).palette[centimes && avecCentimes(niveau, { centimes }) ? 'centimes' : 'entiers']

const NB = '\u00a0'   // espace insécable
// « 3 € », « 50 c », « 3 € 50 c »
export function formatSomme(c) {
  const e = Math.floor(c / 100), r = c % 100
  if (r === 0) return `${e}${NB}€`
  if (e === 0) return `${r}${NB}c`
  return `${e}${NB}€ ${r}${NB}c`
}
// « 3,50 € »
export function formatDecimal(c) {
  return `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')}${NB}€`
}
// Notation selon le niveau : au CE2 on montre aussi l'écriture à virgule
export function fmt(c, niveau) {
  if (donnees(niveau).notation === 'les2' && c % 100 !== 0) return `${formatDecimal(c)} (${formatSomme(c)})`
  return formatSomme(c)
}
// Lit une somme écrite par l'enfant : « 3,50 », « 3.5 € », « 3 € 50 », « 3 € 50 c », « 350 c », « 7 ». Renvoie des centimes ou null.
export function lireSomme(texte) {
  const s = String(texte ?? '').toLowerCase().trim()
    .replace(/euros?/g, '€').replace(/centimes?|santim(?:où)?/g, 'c').replace(/\s+/g, ' ')
  let m
  if ((m = s.match(/^(\d{1,4}) ?[,.] ?(\d{1,2}) ?€?$/))) return +m[1] * 100 + (m[2].length === 1 ? +m[2] * 10 : +m[2])
  if ((m = s.match(/^(\d{1,4}) ?€ ?(?:(\d{1,2}) ?c?)?$/))) return +m[1] * 100 + (m[2] ? +m[2] : 0)
  if ((m = s.match(/^(\d{1,5}) ?c$/))) return +m[1]
  if ((m = s.match(/^(\d{1,4})$/))) return +m[1] * 100
  return null
}
export const totalDe = items => items.reduce((s, v) => s + v, 0)
export const trierDesc = items => [...items].sort((a, b) => b - a)
const aleatoirePas = (rng, min, max, pas) => min + pas * rng.entier(0, Math.floor((max - min) / pas))

// Le système de l'euro est « canonique » : l'algorithme glouton donne le nombre minimal
export function glouton(total, valeurs = VALEURS) {
  const r = []
  let reste = total
  for (const v of trierDesc(valeurs)) while (reste >= v) { r.push(v); reste -= v }
  return r
}

function tirerItems(rng, valeurs, nbMin, nbMax) {
  const n = rng.entier(nbMin, nbMax)
  return Array.from({ length: n }, () => rng.choisir(valeurs))
}

// Tire des items dont le total est dans [min, max] (essais bornés, sinon décomposition)
function tirerDansPlage(rng, valeurs, nbMin, nbMax, min, max) {
  for (let essai = 0; essai < 200; essai++) {
    const items = tirerItems(rng, valeurs, nbMin, nbMax)
    const t = totalDe(items)
    if (t >= min && t <= max) return trierDesc(items)
  }
  const pas = Math.min(...valeurs)
  return decomposerAuHasard(rng, aleatoirePas(rng, min, max, pas), valeurs, nbMax)
}

// Décomposition aléatoire (pas forcément minimale) d'un total
function decomposerAuHasard(rng, total, valeurs, maxItems) {
  const dispo = trierDesc(valeurs)
  for (let essai = 0; essai < 30; essai++) {
    const r = []
    let reste = total
    while (reste > 0) {
      const possibles = dispo.filter(v => v <= reste).slice(0, 3)
      if (!possibles.length) break
      const v = rng.choisir(possibles)
      r.push(v); reste -= v
    }
    if (reste === 0 && r.length <= maxItems) return trierDesc(r)
  }
  return glouton(total, dispo)
}

// ── Une question par type ── (ctx : { rng, T, niveau, niv: données du niveau })
function genCompter({ rng, T, niveau, niv }, centimes) {
  let items
  if (!centimes) {
    const p = niv.compter.entiers
    items = tirerDansPlage(rng, p.valeurs, p.nb[0], p.nb[1], p.min, p.max)
  } else {
    const p = niv.compter.centimes
    const euros = tirerDansPlage(rng, p.euros, p.nbEuros[0], p.nbEuros[1], 100, p.maxEuros)
    const cents = tirerDansPlage(rng, p.cents, p.nbCents[0], p.nbCents[1], 1, p.maxCents)
    items = trierDesc([...euros, ...cents])
  }
  const total = totalDe(items)
  return {
    type: 'compter', cle: 'compter:' + items.join(','), items, total, avecCentimes: centimes,
    texte: T('compterQ', { items: items.map(formatSomme).join(' + ') }),
    attendu: fmt(total, niveau),
  }
}

function cibleComposer({ rng, niv }, centimes) {
  if (!centimes) {
    const p = niv.composer.entiers
    return aleatoirePas(rng, p.min, p.max, p.pas)
  }
  const p = niv.composer.centimes
  return rng.entier(p.euros[0], p.euros[1]) * 100 + rng.entier(p.cents[0], p.cents[1])
}

function genComposer(ctx, centimes) {
  const cible = cibleComposer(ctx, centimes)
  return {
    type: 'composer', cle: 'composer:' + cible, cible, solution: glouton(cible),
    texte: ctx.T('composerQ', { somme: fmt(cible, ctx.niveau) }), attendu: fmt(cible, ctx.niveau),
  }
}

function genMoins(ctx, centimes) {
  const min = ctx.niv.moins.minPieces[centimes ? 'centimes' : 'entiers']
  let cible, solution
  for (let essai = 0; essai < 100; essai++) {
    cible = cibleComposer(ctx, centimes)
    solution = glouton(cible)
    if (solution.length >= min) break
  }
  return {
    type: 'moins', cle: 'moins:' + cible, cible, solution,
    texte: ctx.T('moinsQ', { somme: fmt(cible, ctx.niveau) }),
    attendu: `${solution.length} : ${solution.map(formatSomme).join(' + ')}`,
  }
}

function objetPour({ rng, T }, prix) {
  const cat = prix <= 200 ? 'pasCher' : prix <= 1000 ? 'moyen' : prix <= 2000 ? 'cher' : 'tresCher'
  const i = rng.entier(0, EMOJIS[cat].length - 1)
  return { e: EMOJIS[cat][i], ...T('objets')[cat][i] }   // { e, nom, pluriel }
}

function genRendre(ctx, centimes) {
  const { rng, T, niveau, niv } = ctx
  const cas = rng.choisir(niv.rendre[centimes ? 'centimes' : 'entiers'])
  const rendu = aleatoirePas(rng, cas.rendu[0], cas.rendu[1], cas.pas)
  const prix = cas.paye - rendu
  const objet = objetPour(ctx, prix)
  return {
    type: 'rendre', cle: `rendre:${prix}/${cas.paye}`, paye: cas.paye, prix, cible: rendu, objet,
    solution: glouton(rendu),
    texte: T('rendreQ', { e: objet.e, prix: fmt(prix, niveau), paye: formatSomme(cas.paye) }),
    attendu: fmt(rendu, niveau),
  }
}

function genComparer({ rng, T, niveau, niv }, centimes) {
  const p = niv.comparer[centimes ? 'centimes' : 'entiers']
  const itemsA = tirerDansPlage(rng, p.valeurs, p.nb[0], p.nb[1], 1, p.max)
  const totalA = totalDe(itemsA)
  let itemsB = null
  if (rng.vrai(niv.comparer.probaEgal)) {
    // Même somme, mais autrement composée
    for (let essai = 0; essai < 10 && !itemsB; essai++) {
      const b = decomposerAuHasard(rng, totalA, p.valeurs, p.nb[1] + 2)
      if (b.join(',') !== itemsA.join(',')) itemsB = b
    }
  }
  if (!itemsB) {
    for (let essai = 0; essai < 100; essai++) {
      itemsB = tirerDansPlage(rng, p.valeurs, p.nb[0], p.nb[1], 1, p.max)
      if (totalDe(itemsB) !== totalA) break
    }
  }
  const totalB = totalDe(itemsB)
  const [nomA, nomB] = rng.melanger(rng.choisir(T('prenoms')))
  const bonne = totalA > totalB ? 'A' : totalB > totalA ? 'B' : 'egal'
  return {
    type: 'comparer', cle: 'comparer:' + itemsA.join(',') + '|' + itemsB.join(','),
    itemsA, itemsB, totalA, totalB, nomA, nomB, bonne,
    texte: T('comparerQ', { a: nomA, ta: fmt(totalA, niveau), b: nomB, tb: fmt(totalB, niveau) }),
    attendu: bonne === 'A' ? nomA : bonne === 'B' ? nomB : T('autant'),
  }
}

// CE2 : 1 € = 100 c. sous : 'c2ec' (235 c = ? € ? c), 'ec2c' (2 € 35 c = ? c), 'dec2c' (2,35 € = ? c), 'ec2dec' (2 € 5 c = ? €)
function genConvertir({ rng, T, niv }) {
  const p = niv.convertir || { min: 105, max: 995 }
  const sous = rng.choisir(['c2ec', 'ec2c', 'dec2c', 'ec2dec'])
  let valeur = rng.entier(p.min, p.max)
  if (valeur % 100 === 0) valeur += rng.entier(1, 9) * 5
  // pour « 2 € 5 c = 2,05 € », on force souvent un petit nombre de centimes (piège classique)
  if (sous === 'ec2dec' && rng.vrai(0.5)) valeur = Math.floor(valeur / 100) * 100 + rng.entier(1, 9)
  const ec = formatSomme(valeur), dec = formatDecimal(valeur)
  const enonces = {
    c2ec:   [`${valeur}${NB}c = ? € ? c`, ec],
    ec2c:   [`${ec} = ? c`, `${valeur}${NB}c`],
    dec2c:  [`${dec} = ? c`, `${valeur}${NB}c`],
    ec2dec: [`${ec} = ? € (${T('avecVirgule')})`, dec],
  }
  const [texte, attendu] = enonces[sous]
  return { type: 'convertir', sous, cle: `convertir:${sous}:${valeur}`, valeur, texte, attendu }
}

const GENERATEURS = { compter: genCompter, composer: genComposer, moins: genMoins, rendre: genRendre, comparer: genComparer, convertir: genConvertir }

// nb questions des types demandés (ceux du niveau), répartis équitablement puis mélangés, sans répétition
function genererSansRepetition(ctx, typesDemandes, nb, centimes) {
  const offerts = typesDu(ctx.niveau)
  const types = typesDemandes.filter(t => offerts.includes(t))
  if (!types.length) types.push(offerts[0])
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = ctx.rng.melanger(types)
  const liste = ctx.rng.melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  const vus = new Set()
  const result = []
  for (const type of liste) {
    let q = null
    for (let essai = 0; essai < 50; essai++) {
      const c = GENERATEURS[type](ctx, centimes)
      if (!vus.has(c.cle)) { q = c; break }
    }
    if (q) { vus.add(q.cle); result.push(q) }
  }
  return result
}

const contexte = (niveau, rng, T) => ({ rng, T, niveau: niveauConnu(niveau), niv: donnees(niveau) })

export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ ?? 10 }) {
  return genererSansRepetition(contexte(niveau, rng, T), reglages.exercices ?? [], nb, avecCentimes(niveau, reglages))
}

// ── Réponses ──
// rep : { choix: 'A' | 'B' | 'egal' } (comparer) ; { selection: [valeurs] } (composer, moins, rendre) ;
// { texte } (somme ou conversion écrite) ; { e, c } (euros et centimes dans deux champs)
function verifierConversion(q, rep) {
  if (q.sous === 'c2ec') {
    const e = parseInt(rep.e || '0', 10), c = parseInt(rep.c || '0', 10)
    return !isNaN(e) && !isNaN(c) && c < 100 && e * 100 + c === q.valeur
  }
  const t = String(rep.texte ?? '').trim()
  if (q.sous === 'ec2dec') return /^\d+\s*[,.]\s*\d{2}\s*(€|euros?)?$/i.test(t) && lireSomme(t) === q.valeur
  const n = t.replace(/\s*(c|centimes?)$/i, '')
  return /^\d+$/.test(n) && +n === q.valeur
}
// Somme donnée pour « compter » (en centimes), ou null si elle ne se lit pas
export function sommeDonnee(q, rep) {
  if (rep.texte !== undefined) return lireSomme(rep.texte)
  const e = parseInt(rep.e || '0', 10)
  const c = q.avecCentimes ? parseInt(rep.c || '0', 10) : 0
  if (isNaN(e) || isNaN(c) || e < 0 || c < 0) return null
  return e * 100 + c
}
export function verifier(q, rep) {
  if (q.type === 'comparer') return rep.choix === q.bonne
  if (q.type === 'convertir') return verifierConversion(q, rep)
  // deux champs : pas plus de 99 c
  if (q.type === 'compter') return sommeDonnee(q, rep) === q.total && !(q.avecCentimes && parseInt(rep.c || '0', 10) >= 100)
  const sel = rep.selection ?? []
  if (q.type === 'moins') return totalDe(sel) === q.cible && sel.length <= q.solution.length
  return totalDe(sel) === q.cible
}
export function bonneReponse(q) {
  if (q.type === 'comparer') return { choix: q.bonne }
  if (q.type === 'convertir') {
    if (q.sous === 'c2ec') return { e: String(Math.floor(q.valeur / 100)), c: String(q.valeur % 100) }
    return { texte: q.sous === 'ec2dec' ? formatDecimal(q.valeur) : `${q.valeur}` }
  }
  if (q.type === 'compter') return { e: String(Math.floor(q.total / 100)), c: String(q.total % 100) }
  return { selection: [...q.solution] }
}

// ── Fiche ── Ce que tire la fiche imprimable, dans l'ordre de l'ancienne vue : compter, entourer et rendre sont
// toujours tirés (même si la partie n'est pas affichée), le reste seulement si la partie est demandée.
export function questionsFiche({ niveau, reglages, rng, T }) {
  const ctx = contexte(niveau, rng, T)
  const types = typesDu(ctx.niveau)
  // Parties de la fiche selon les exercices choisis (toutes si aucun n'a d'équivalent papier)
  const choisis = reglages.exercices ?? []
  let parties = {
    compter: choisis.includes('compter'),
    entoure: choisis.includes('composer'),
    moins: choisis.includes('moins'),
    rendre: choisis.includes('rendre'),
    comparer: choisis.includes('comparer'),
    convertir: choisis.includes('convertir') && types.includes('convertir'),
  }
  if (!Object.values(parties).some(Boolean)) parties = { compter: true, entoure: true, rendre: true, convertir: types.includes('convertir') }
  const centimes = avecCentimes(ctx.niveau, reglages)
  const valeursPapier = palette(ctx.niveau, centimes).filter(v => v <= 2000)

  const compter = genererSansRepetition(ctx, ['compter'], 6, centimes)

  // Entoure pour payer : la somme exacte parmi des pièces et billets en trop
  const vus = new Set()
  const entoure = []
  for (let essai = 0; essai < 100 && entoure.length < 3; essai++) {
    const cible = centimes ? rng.entier(1, 9) * 100 + aleatoirePas(rng, 10, 90, 5) : rng.entier(6, 45) * 100
    if (vus.has(cible)) continue
    vus.add(cible)
    const bons = decomposerAuHasard(rng, cible, valeursPapier, 6)
    const intrus = tirerItems(rng, valeursPapier, 2, 3)
    entoure.push({ cible, bons, items: trierDesc([...bons, ...intrus]) })
  }

  // Le moins de pièces : deux façons de payer la même somme, entourer la plus économe
  const moins = parties.moins ? genererSansRepetition(ctx, ['moins'], 3, centimes).map(qu => {
    let autre = null
    for (let essai = 0; essai < 30 && !autre; essai++) {
      const a = decomposerAuHasard(rng, qu.cible, valeursPapier, qu.solution.length + 4)
      if (a.length > qu.solution.length) autre = trierDesc(a)
    }
    const optimaleEnA = rng.vrai(0.5)
    return { cible: qu.cible, A: optimaleEnA ? qu.solution : autre ?? qu.solution, B: optimaleEnA ? autre ?? qu.solution : qu.solution,
      bonne: !autre ? 'A, B' : optimaleEnA ? 'A' : 'B' }
  }) : []

  const comparer = parties.comparer ? genererSansRepetition(ctx, ['comparer'], 3, centimes) : []
  const rendre = genererSansRepetition(ctx, ['rendre'], 4, centimes)
  const convertir = parties.convertir ? genererSansRepetition(ctx, ['convertir'], 8, centimes) : []
  return { niveau: ctx.niveau, centimes, decimale: centimes && ctx.niv.saisieDecimale, parties, compter, entoure, moins, comparer, rendre, convertir }
}

// ── Programme : ce qui sort des contraintes du niveau (src/data/programme.js, CONTRAINTES : monnaie) ──
// Sommes (en centimes) et textes présents dans une question de jeu ou dans le tirage d'une fiche
function sommes(x) {
  const res = { montants: [], textes: [], conversions: 0 }
  const ajouter = r => { res.montants.push(...r.montants); res.textes.push(...r.textes); res.conversions += r.conversions }
  if (Array.isArray(x)) { x.forEach(q => ajouter(sommes(q))); return res }
  if (x.parties) {
    if (x.parties.compter) ajouter(sommes(x.compter))
    if (x.parties.entoure) x.entoure.forEach(e => res.montants.push(e.cible, ...e.items))
    x.moins.forEach(m => res.montants.push(m.cible, ...m.A, ...m.B))
    if (x.parties.rendre) ajouter(sommes(x.rendre))
    ajouter(sommes(x.comparer)); ajouter(sommes(x.convertir))
    return res
  }
  res.textes.push(x.texte, x.attendu)
  if (x.type === 'compter') res.montants.push(...x.items, x.total)
  if (x.type === 'composer' || x.type === 'moins') res.montants.push(x.cible, ...x.solution)
  if (x.type === 'rendre') res.montants.push(x.paye, x.prix, x.cible, ...x.solution)
  if (x.type === 'comparer') res.montants.push(...x.itemsA, ...x.itemsB, x.totalA, x.totalB)
  if (x.type === 'convertir') { res.montants.push(x.valeur); res.conversions++ }
  return res
}
export function ecartsAuProgramme(x, contraintes) {
  const m = contraintes.monnaie
  if (!m) return ['monnaie : pas au programme du niveau']
  const ecarts = []
  const { montants, textes, conversions } = sommes(x)
  for (const c of montants) {
    if (!m.centimes && c % 100) ecarts.push(`${formatSomme(c)} : centimes pas au programme`)
    if (m.eurosMax && c > m.eurosMax * 100) ecarts.push(`${formatSomme(c)} : plus de ${m.eurosMax} €`)
  }
  if (!m.centimes && conversions) ecarts.push('conversion 1 € = 100 c : centimes pas au programme')
  if (!m.virgule) for (const t of textes) if (/\d,\d\d/.test(t)) ecarts.push(`« ${t} » : écriture à virgule pas au programme`)
  return [...new Set(ecarts)]
}
