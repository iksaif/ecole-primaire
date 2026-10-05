// Lire l'heure — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
//   ecartsFiche(html, contraintes)                ce que la fiche montre hors du programme du niveau (tests)
// rng : src/utils/hasard.js ; T(cle, params) : textes de l'exercice dans la langue du contenu (textes.js).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION from './definition.js'

// Exercices et précisions : libellés dans le catalogue d'interface (clés `ex_<id>`, `prec_<id>`)
export const MINUTES_PAR_PRECISION = {
  heure: [0],
  demi: [30],
  quart: [15, 45],
  cinq: [5, 10, 20, 25, 35, 40, 50, 55],
  minute: Array.from({ length: 60 }, (_, i) => i).filter(i => i % 5 !== 0),
}

// Durées proposées par niveau (en minutes) et conversions (1 h = 60 min ; les secondes arrivent au CM2)
const DONNEES = {
  cp: { durees: [], dureesCinq: [], dureesMinute: [], dureeMax: 0, conversions: [] },
  ce1: { durees: [15, 30, 45, 60, 90, 120, 180], dureesCinq: [5, 10, 20], dureesMinute: [], dureeMax: 180, conversions: [] },
  ce2: {
    durees: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 210],
    dureesCinq: [5, 10, 20, 25, 35, 40, 50, 55, 70, 80, 100, 110, 125, 140, 160],
    dureesMinute: [12, 18, 27, 33, 48, 52, 64, 72, 87, 96],
    dureeMax: 240,
    conversions: ['h-min', 'hmin-min', 'min-hmin'],
  },
}

// Activités et créneaux plausibles (heures sur 24 h) ; noms dans le catalogue de contenu (`activites`)
const ACTIVITES = [
  { id: 'dessinAnime', debut: [8, 18], dureeMax: 60 },
  { id: 'film', debut: [14, 17], dureeMax: 150 },
  { id: 'promenade', debut: [9, 17], dureeMax: 180 },
  { id: 'match', debut: [9, 17], dureeMax: 120 },
  { id: 'sieste', debut: [13, 15], dureeMax: 120 },
  { id: 'piqueNique', debut: [11, 13], dureeMax: 120 },
  { id: 'piscine', debut: [9, 17], dureeMax: 90 },
  { id: 'gouter', debut: [16, 17], dureeMax: 30 },
  { id: 'peinture', debut: [9, 16], dureeMax: 120 },
]

// phrase et suffixe (« du matin ») : catalogue de contenu, `moments`
export const MOMENTS = [
  { nom: 'matin', heures: [7, 8, 9, 10, 11], decalage: 0 },
  { nom: 'apres-midi', heures: [1, 2, 3, 4, 5], decalage: 12 },
  { nom: 'soir', heures: [6, 7, 8, 9, 10], decalage: 12 },
]

export const deux = n => String(n).padStart(2, '0')
// « 3 h », « 3 h 05 », « 15 h 30 »
export const ecrit = (h, m) => (m === 0 ? `${h} h` : `${h} h ${deux(m)}`)
// minutes depuis minuit → « 8 h 30 »
export const hm = t => ecrit(Math.floor(t / 60), t % 60)
// « 1 h 30 min », « 2 h », « 45 min »
export function ecritDuree(d) {
  const h = Math.floor(d / 60), m = d % 60
  if (h && m) return `${h} h ${m} min`
  return h ? `${h} h` : `${m} min`
}
const egal = (a, b) => a.h === b.h && a.m === b.m
const h12 = x => ((x - 1 + 120) % 12) + 1

// Heure sur un cadran (1 → 12) dite en lettres (« trois heures et quart ») : voir le catalogue de contenu
const oral12 = (T, h, m) => T('oral12', { h, m })
// « trois heures et quart de l'après-midi »
const oralMoment = (T, h, m, moment) => T('oralMoment', { oral: oral12(T, h, m), moment: T('moments')[moment.nom] })

// Options du niveau retenues dans les réglages (exercices, précisions)
export function choisis(niveau, reglages, cle) {
  const offertes = (DEFINITION.niveaux[niveau] ?? DEFINITION.niveaux[DEFINITION.niveauDefaut]).options[cle]
  return (reglages[cle] ?? []).filter(x => offertes.includes(x))
}
const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

export function minutesDisponibles(precisions) {
  return [...new Set(precisions.flatMap(p => MINUTES_PAR_PRECISION[p] || []))].sort((a, b) => a - b)
}
const poolDe = (niveau, reglages) => {
  const p = choisis(niveau, reglages, 'precisions')
  return minutesDisponibles(p.length ? p : ['heure'])
}
// heures entières seulement (CP, ou précision « heures pile » seule) : pas de case pour les minutes
const sansMinutes = pool => pool.length === 1 && pool[0] === 0

function dureesDisponibles(niv, precisions) {
  const fin = precisions.includes('cinq') || precisions.includes('minute')
  const ok = d => {
    const r = d % 60
    if (r % 5 !== 0) return precisions.includes('minute')
    if (r === 0) return true
    if (r === 30) return precisions.includes('demi') || fin
    if (r === 15 || r === 45) return precisions.includes('quart') || fin
    return fin
  }
  const liste = [...niv.durees,
    ...(precisions.includes('cinq') || precisions.includes('minute') ? niv.dureesCinq : []),
    ...(precisions.includes('minute') ? niv.dureesMinute : [])]
  const res = [...new Set(liste.filter(ok))]
  return res.length ? res : [60, 120]
}

// Distracteurs plausibles pour une heure (h 1..12, m) : erreurs typiques d'enfants.
function distracteurs(rng, h, m, pool) {
  const cands = [
    { h: h12(h + 1), m },                      // « 2 h 45 » lu « 3 h 45 »
    { h: h12(h - 1), m },
    { h: m === 0 ? 12 : m / 5, m: (h * 5) % 60 }, // aiguilles inversées
    { h, m: (m + 30) % 60 },
    { h, m: (60 - m) % 60 },
    { h: h12(h + 1), m: (60 - m) % 60 },       // « moins le quart » ↔ « et quart »
    { h, m: (m + 5) % 60 },
  ].filter(c => Number.isInteger(c.h) && c.h >= 1 && c.h <= 12 && !egal(c, { h, m }) && pool.includes(c.m))  // précision du niveau
  const uniques = []
  for (const c of rng.melanger(cands)) if (!uniques.some(u => egal(u, c))) uniques.push(c)
  let essais = 0
  while (uniques.length < 3 && essais++ < 100) {
    const c = { h: rng.entier(1, 12), m: rng.choisir(pool) }
    if (!egal(c, { h, m }) && !uniques.some(u => egal(u, c))) uniques.push(c)
  }
  return uniques.slice(0, 3)
}

// Emploi du temps d'une matinée ou d'un après-midi : créneaux consécutifs (au niveau qui propose les minutes,
// des séances de 40 et 50 min).
function genererEmploi(rng, T, niveau) {
  const matin = rng.vrai(0.6)
  let t = matin ? 8 * 60 + 30 : 13 * 60 + 30
  const pas = DEFINITION.niveaux[niveau].options.precisions.includes('minute') ? [30, 45, 60, 40, 50] : [30, 45, 60]
  const noms = rng.melanger(T('matieres'))
  const lignes = []
  for (let i = 0; i < 4; i++) {
    const d = rng.choisir(pas)
    lignes.push({ nom: noms[i], debut: t, fin: t + d })
    t += d
    if (i === 1) { lignes.push({ nom: T('recre'), recre: true, debut: t, fin: t + 15 }); t += 15 }
  }
  return lignes
}

function genererConversion(rng, conversions) {
  const k = rng.choisir(conversions)
  if (k === 'h-min') { const h = rng.entier(1, 4); return { k, texte: `${h} h = ? min`, unites: ['min'], valeurs: [h * 60] } }
  if (k === 'hmin-min') {
    const h = rng.entier(1, 3), m = rng.choisir([5, 10, 15, 20, 30, 40, 45, 50])
    return { k, texte: `${h} h ${m} min = ? min`, unites: ['min'], valeurs: [h * 60 + m] }
  }
  const t = rng.choisir([70, 75, 80, 90, 100, 110, 120, 130, 135, 150, 180, 200])
  return { k, texte: `${t} min = ? h ? min`, unites: ['h', 'min'], valeurs: [Math.floor(t / 60), t % 60] }
}

// Une question (type tiré parmi les exercices choisis)
function genererQuestion({ niveau, reglages, rng, T }) {
  niveau = niveauConnu(niveau)
  const niv = DONNEES[niveau]
  const types = choisis(niveau, reglages, 'exercices')
  const type = rng.choisir(types.length ? types : ['lire'])
  const precisions = choisis(niveau, reglages, 'precisions')
  const pool = minutesDisponibles(precisions.length ? precisions : ['heure'])

  if (type === 'lire') {
    const h = rng.entier(1, 12), m = rng.choisir(pool)
    const q = { type, cle: `lire-${h}-${m}`, h, m, mode: reglages.saisie === 'clavier' ? 'clavier' : 'choix', sansMinutes: sansMinutes(pool),
      texte: T('lireQ'), attendu: `${ecrit(h, m)} (${oral12(T, h, m)})`, oral: oral12(T, h, m) }
    if (q.mode === 'choix') {
      const enLettres = rng.vrai(0.4)
      const opts = rng.melanger([{ h, m }, ...distracteurs(rng, h, m, pool)])
      q.options = opts.map(o => ({ ...o, label: enLettres ? oral12(T, o.h, o.m) : ecrit(o.h, o.m) }))
      q.bonne = opts.findIndex(o => egal(o, { h, m }))
    }
    return q
  }

  if (type === 'placer') {
    const h = rng.entier(1, 12), m = rng.choisir(pool)
    let depart
    do { depart = { h: rng.entier(0, 11), m: rng.entier(0, 11) * 5 } } while (depart.h === h % 12 && depart.m === m)
    return { type, cle: `placer-${h}-${m}`, h, m, depart, consigneOrale: rng.vrai(0.5),
      ecrit: ecrit(h, m), oral: oral12(T, h, m),
      texte: T('placerQ', { ecrit: ecrit(h, m) }), attendu: `${ecrit(h, m)} (${oral12(T, h, m)})` }
  }

  if (type === 'journee') {
    const moment = rng.choisir(rng.vrai(0.25) ? [MOMENTS[0]] : MOMENTS.slice(1))
    const h = rng.choisir(moment.heures), m = rng.choisir(pool)
    const h24 = h + moment.decalage
    const oral = oralMoment(T, h, m, moment)
    const sous = rng.vrai(0.5) ? 'lire24' : 'choisir'
    const q = { type, sous, cle: `journee-${sous}-${h24}-${m}`, h, m, h24, ecrit24: ecrit(h24, m), sansMinutes: sansMinutes(pool),
      phrase: T('moments')[moment.nom].phrase, oral,
      attendu: `${ecrit(h24, m)} (${oral})` }
    if (sous === 'lire24') {
      q.texte = T('journeeLireQ', { moment: T('moments')[moment.nom] })
    } else {
      q.texte = T('journeeChoisirQ', { ecrit: ecrit(h24, m) })
      const cands = [
        { h: h12(h + 2), m },          // « 16 h » confondu avec « 6 h »
        { h: h12(h + 1), m },
        { h: h12(h - 1), m },
        { h, m: (m + 30) % 60 },
      ].filter(c => !egal(c, { h, m }))
      const uniques = []
      for (const c of cands) if (!uniques.some(u => egal(u, c))) uniques.push(c)
      const opts = rng.melanger([{ h, m }, ...uniques.slice(0, 3)])
      q.options = opts
      q.bonne = opts.findIndex(o => egal(o, { h, m }))
    }
    return q
  }

  if (type === 'conversion') {
    const c = genererConversion(rng, niv.conversions)
    return { type, cle: `conv-${c.texte}`, ...c,
      attendu: c.texte.replace(/\?\s*h\s*\?\s*min/, `${c.valeurs[0]} h ${c.valeurs[1]} min`).replace('?', c.valeurs[0]) }
  }

  if (type === 'emploi') {
    const emploi = genererEmploi(rng, T, niveau)
    const cours = emploi.filter(l => !l.recre)
    const sous = rng.choisir(['debut', 'duree', 'quoi'])
    const l = rng.choisir(sous === 'duree' ? emploi : cours)
    const q = { type, sous, emploi, cle: `emploi-${sous}-${l.nom}-${l.debut}-${l.fin}` }
    if (sous === 'debut') {
      q.question = T('emploiDebutQ', { nom: l.nom })
      q.h24 = Math.floor(l.debut / 60); q.m = l.debut % 60
      q.attendu = hm(l.debut)
    } else if (sous === 'duree') {
      q.question = l.recre ? T('emploiDureeRecreQ') : T('emploiDureeQ', { nom: l.nom })
      q.d = l.fin - l.debut
      q.attendu = ecritDuree(q.d)
    } else {
      const t = l.debut + rng.entier(1, Math.floor((l.fin - l.debut) / 5) - 1) * 5
      q.question = T('emploiQuoiQ', { ecrit: hm(t) })
      const autres = rng.melanger(emploi.filter(x => x.nom !== l.nom).map(x => x.nom)).slice(0, 3)
      q.options = rng.melanger([l.nom, ...autres]).map(n => ({ label: n }))
      q.bonne = q.options.findIndex(o => o.label === l.nom)
      q.attendu = l.nom
    }
    q.texte = q.question
    return q
  }

  // Durées : départ à une heure plausible (8 h → 11 h ou 13 h → 18 h), fin avant 19 h.
  const d = rng.choisir(dureesDisponibles(niv, precisions).filter(x => x <= niv.dureeMax))
  const departsPour = ([hMin, hMax]) => {
    const res = []
    for (let h = hMin; h <= hMax; h++) {
      if (h === 12) continue
      for (const m of pool) if (h * 60 + m + d <= 19 * 60) res.push({ h, m })
    }
    return res
  }
  const acts = ACTIVITES.filter(a => a.dureeMax >= d && departsPour(a.debut).length)
  const sous = rng.vrai(0.6) || !acts.length ? 'apres' : 'combien'
  const act = sous === 'combien' ? rng.choisir(acts) : null
  const { h: h24, m } = rng.choisir(departsPour(act ? act.debut : [8, 18]))
  const debut = h24 * 60 + m
  const fin = debut + d
  const h24f = Math.floor(fin / 60), m2 = fin % 60
  const q = { type, sous, cle: `duree-${sous}-${debut}-${d}`, h: h12(h24), m, h2: h12(h24f), m2, h24, h24f, d,
    ecritDebut: ecrit(h24, m), ecritFin: ecrit(h24f, m2), ecritDuree: ecritDuree(d) }
  if (sous === 'apres') {
    q.texte = T('dureeApresQ', { debut: ecrit(h24, m), duree: ecritDuree(d) })
    q.attendu = ecrit(h24f, m2)
  } else {
    q.act = T('activites')[act.id]   // { nom, pronom } dans la langue du contenu
    q.texte = T('dureeCombienQ', { act: q.act, debut: ecrit(h24, m), fin: ecrit(h24f, m2) })
    q.attendu = ecritDuree(d)
  }
  return q
}

// nb questions sans répétition (au plus nb × 60 essais : un petit niveau peut en donner moins)
export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ ?? 10 }) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 60) {
    essais++
    const q = genererQuestion({ niveau, reglages, rng, T })
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q) }
  }
  return result
}

// rep : { choix } | { h, m } (saisie, nombres ou chaînes) | { aiguilles: { h: 0..11, m } }
export function verifier(q, rep) {
  if (rep.choix !== undefined) return rep.choix === q.bonne
  if (rep.aiguilles) return rep.aiguilles.h === q.h % 12 && rep.aiguilles.m === q.m
  const vide = v => v === '' || v === null || v === undefined
  if (vide(rep.h) && vide(rep.m)) return false
  const h = vide(rep.h) ? 0 : Number(rep.h)
  const m = vide(rep.m) ? 0 : Number(rep.m)
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || m < 0) return false
  if (q.type === 'conversion') {
    if (q.valeurs.length === 1) return h === q.valeurs[0]
    return h === q.valeurs[0] && m === q.valeurs[1]
  }
  if (q.type === 'lire') return m === q.m && h % 12 === q.h % 12 && h <= 23 // 3 h 15 ou 15 h 15
  if (q.type === 'journee') return m === q.m && h === q.h24
  if (q.type === 'emploi' && q.sous === 'debut') return m === q.m && h === q.h24
  if (q.type === 'duree' && q.sous === 'apres') return m === q.m2 && h % 12 === q.h24f % 12 && h <= 23
  if (q.type === 'duree' || q.type === 'emploi') return m < 60 && h * 60 + m === q.d || (h === 0 && m === q.d)
  return false
}

// Ce que tire la fiche imprimable, dans l'ordre de l'ancienne vue : horloges à lire, à dessiner, puis les parties
// choisies (matin / après-midi, durées, conversions, emploi du temps).
export function questionsFiche({ niveau, reglages, rng, T }) {
  niveau = niveauConnu(niveau)
  const exercices = choisis(niveau, reglages, 'exercices')
  const pool = poolDe(niveau, reglages)
  const tirer = (n, exclus) => {
    const res = []
    let essais = 0
    while (res.length < n && essais++ < 500) {
      const h = rng.entier(1, 12), m = rng.choisir(pool), k = `${h}-${m}`
      if (!exclus.has(k)) { exclus.add(k); res.push({ h, m }) }
    }
    return res
  }
  const vus = new Set()
  const nbH = reglages.nbHorloges || 8
  // parties « horloges » selon les exercices choisis (les deux si aucune autre partie n'est demandée)
  const autres = ['journee', 'duree', 'conversion', 'emploi'].some(e => exercices.includes(e))
  let avecLire = exercices.includes('lire'), avecPlacer = exercices.includes('placer')
  if (!avecLire && !avecPlacer && !autres) avecLire = avecPlacer = true
  const res = { niveau, avecLire, avecPlacer, sansMinutes: sansMinutes(pool), aLire: tirer(nbH, vus), aDessiner: tirer(nbH, vus) }
  res.aDessiner = res.aDessiner.map((t, i) => ({ ...t, oral: i % 2 ? oral12(T, t.h, t.m) : null }))

  if (exercices.includes('journee')) {
    const lignes = []
    const vusJ = new Set()
    let essais = 0
    while (lignes.length < 6 && essais++ < 200) {
      const mo = rng.choisir(MOMENTS.slice(1)), h = rng.choisir(mo.heures), m = rng.choisir(pool)
      if (vusJ.has(`${h}-${m}-${mo.nom}`)) continue
      vusJ.add(`${h}-${m}-${mo.nom}`)
      lignes.push({ h, m, moment: mo.nom, h24: h + 12 })
    }
    res.journee = lignes
  }
  const sous = types => ({ ...reglages, exercices: types })
  if (exercices.includes('duree')) res.durees = questions({ niveau, reglages: sous(['duree']), rng, T, nb: 4 })
  if (exercices.includes('conversion')) res.conversions = questions({ niveau, reglages: sous(['conversion']), rng, T, nb: 6 })
  if (exercices.includes('emploi')) {
    const emploi = genererEmploi(rng, T, niveau)
    const [a, b, c] = rng.melanger(emploi.filter(l => !l.recre))
    res.emploi = { lignes: emploi, debut: a, duree: b, quoi: c }
  }
  return res
}

// ── Programme : ce qui sort des contraintes du niveau (src/data/programme.js, CONTRAINTES) ──
const PAS = { entiere: 60, quart: 15, minute: 1, seconde: 1 }
// Heures et durées (en minutes) présentes dans une question de jeu ou dans le tirage d'une fiche
function mesures(x) {
  const heures = [], durees = []
  const h = (hh, m) => heures.push({ h: hh, m })
  if (Array.isArray(x)) { for (const q of x) { const r = mesures(q); heures.push(...r.heures); durees.push(...r.durees) } return { heures, durees } }
  if (x.aLire) {
    if (x.avecLire) x.aLire.forEach(t => h(t.h, t.m))
    if (x.avecPlacer) x.aDessiner.forEach(t => h(t.h, t.m))
    x.journee?.forEach(l => h(l.h24, l.m))
    for (const q of [...(x.durees ?? []), ...(x.conversions ?? [])]) { const r = mesures(q); heures.push(...r.heures); durees.push(...r.durees) }
    if (x.emploi) for (const l of x.emploi.lignes) { h(Math.floor(l.debut / 60), l.debut % 60); durees.push(l.fin - l.debut) }
    return { heures, durees }
  }
  if (x.type === 'lire' || x.type === 'placer') { h(x.h, x.m); x.options?.forEach(o => h(o.h, o.m)) }
  if (x.type === 'journee') { h(x.h24, x.m); x.options?.forEach(o => h(o.h, o.m)) }
  if (x.type === 'duree') { h(x.h24, x.m); h(x.h24f, x.m2); durees.push(x.d) }
  if (x.type === 'conversion') durees.push(x.valeurs.length === 2 ? x.valeurs[0] * 60 + x.valeurs[1] : x.valeurs[0])
  if (x.type === 'emploi') x.emploi.forEach(l => { h(Math.floor(l.debut / 60), l.debut % 60); durees.push(l.fin - l.debut) })
  return { heures, durees }
}
export function ecartsAuProgramme(x, contraintes) {
  const ecarts = []
  const pas = PAS[contraintes.heure]
  if (!pas) return contraintes.heure ? [] : ['heure : pas au programme du niveau']
  const { heures, durees } = mesures(x)
  for (const { h, m } of heures) {
    if (m % pas) ecarts.push(`${ecrit(h, m)} : précision « ${contraintes.heure} »`)
    if (contraintes.heureMax12 && h > 12) ecarts.push(`${ecrit(h, m)} : heure > 12`)
  }
  for (const d of durees) if (d % pas) ecarts.push(`durée ${ecritDuree(d)} : précision « ${contraintes.heure} »`)
  return [...new Set(ecarts)]
}

// La fiche ne demande pas les minutes quand le niveau ne lit que les heures entières (CP : « __ h », pas « __ h __ »)
export function ecartsFiche(html, contraintes) {
  return contraintes.heure === 'entiere' && /h\s*_{2,}/.test(html) ? ['case des minutes alors que le niveau ne lit que les heures entières'] : []
}
