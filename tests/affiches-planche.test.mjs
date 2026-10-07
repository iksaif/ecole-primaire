// La planche à découper de l'affiche « Pièces et billets » : la DISPOSITION (src/affiches/monnaie/planche.ts, pure), vérifiée en node
// pour chaque variante, chaque couple de tailles (pièces, billets), chaque format (A4, A3), chaque sens et chaque option. Pour un
// massicot : toute la page se découpe par des coupes de bord à bord (guillotine), chaque bande a une hauteur unique, rien ne se
// chevauche, tout est dans la zone, les traits de coupe ne traversent jamais une pièce ni un billet. La taille réelle dans
// Chrome : tests/affiches-monnaie.test.mjs.
import { EXEMPLAIRES, ECART, GENRES, H_CONSIGNE, LOTS, MARQUE, disposerPlanche } from '../src/affiches/monnaie/planche.ts'
import { mesuresAffiche } from '../src/impression/affiches/cadre.ts'
import { tailleReelle } from '../src/dessins/argent.ts'
import { verifier, nbEchecs } from './outils.mjs'

const EPS = 0.01
const egal = (a, b) => Math.abs(a - b) < EPS
// deux rectangles se chevauchent (intérieurs communs)
const chevauche = (a, b) => a.x < b.x + b.w - EPS && b.x < a.x + a.w - EPS && a.y < b.y + b.h - EPS && b.y < a.y + a.h - EPS

/**
 * Un ensemble de rectangles se découpe-t-il au massicot ? Il se sépare par une coupe de bord à bord (horizontale ou verticale)
 * qui ne traverse aucun rectangle, et chaque côté se découpe de même, jusqu'à un seul rectangle. (Une coupe possible le reste dans
 * chaque morceau : la première trouvée suffit.)
 */
function guillotine(rects) {
  if (rects.length <= 1) return true
  for (const [pos, taille] of [['y', 'h'], ['x', 'w']]) {
    for (const c of new Set(rects.map(r => r[pos] + r[taille]))) {
      if (rects.some(r => r[pos] < c - EPS && r[pos] + r[taille] > c + EPS)) continue
      const avant = rects.filter(r => r[pos] + r[taille] <= c + EPS)
      const apres = rects.filter(r => r[pos] >= c - EPS)
      if (avant.length && apres.length && avant.length + apres.length === rects.length) return guillotine(avant) && guillotine(apres)
    }
  }
  return false
}

const problemes = []
const note = (cas, msg) => problemes.push(`${cas} : ${msg}`)
let nbCas = 0

/** Vérifie une disposition : `attendu` : { valeur: exemplaires } (les valeurs et le nombre de chacune). */
function verifierDisposition(cas, pages, { W, H, kp, kb, attendu }) {
  if (!pages.length) { note(cas, 'aucune page'); return }
  const poses = pages.flatMap(p => p.poses)
  const compte = {}
  for (const p of poses) compte[p.v] = (compte[p.v] ?? 0) + 1
  for (const [v, n] of Object.entries(attendu)) if ((compte[v] ?? 0) !== n) note(cas, `${v} : ${compte[v] ?? 0} exemplaires au lieu de ${n}`)
  for (const v of Object.keys(compte)) if (!(v in attendu)) note(cas, `${v} imprimé alors qu'il n'est pas demandé`)
  for (const [i, page] of pages.entries()) {
    const ou = `page ${i + 1}`
    if (!guillotine(page.poses.map(p => p.case))) note(cas, `${ou} : pas découpable de bord à bord`)
    page.bandes.forEach((b, j) => {
      const dans = page.poses.filter(p => p.bande === j)
      if (dans.length !== b.n || b.xs.length !== b.n + 1) note(cas, `${ou} bande ${j} : nombre de cases incohérent`)
      if (j > 0 && !egal(b.y, page.bandes[j - 1].y + page.bandes[j - 1].h)) note(cas, `${ou} : les bandes ${j - 1} et ${j} ne se touchent pas`)
      if (dans.some(p => !egal(p.case.y, b.y) || !egal(p.case.h, b.h))) note(cas, `${ou} bande ${j} : hauteur de case différente dans la bande`)
      dans.forEach((p, c) => { if (p.colonne !== c || !egal(p.case.x, b.xs[c]) || !egal(p.case.x + p.case.w, b.xs[c + 1])) note(cas, `${ou} bande ${j} : case ${c} hors des coupes`) })
      // la bande est centrée dans la largeur utile
      if (!egal(b.x0 - MARQUE, W - MARQUE - b.x1)) note(cas, `${ou} bande ${j} : pas centrée`)
      // pas de place perdue : la plus petite case des autres articles de la page ne tiendrait pas en plus (hormis les pages de fin)
    })
    for (const p of page.poses) {
      const r = tailleReelle(p.v)
      const k = p.genre === 'piece' ? kp : kb
      const [w, h] = p.tourne ? [r.h * k, r.w * k] : [r.w * k, r.h * k]
      if (p.tourne && p.genre !== 'billet') note(cas, `pièce ${p.v} tournée`)
      if (!egal(p.boite.w, w) || !egal(p.boite.h, h)) note(cas, `${p.v} : ${p.boite.w} × ${p.boite.h} mm au lieu de ${w.toFixed(2)} × ${h.toFixed(2)}`)
      if (!egal(p.boite.x - p.case.x, p.case.x + p.case.w - p.boite.x - p.boite.w) || !egal(p.boite.y - p.case.y, p.case.y + p.case.h - p.boite.y - p.boite.h)) note(cas, `${p.v} : pas centré dans sa case`)
      if (p.boite.x - p.case.x < ECART / 2 - EPS || p.boite.y - p.case.y < ECART / 2 - EPS) note(cas, `${p.v} : marge inférieure à ${ECART / 2} mm`)
      if (p.genre === 'piece' && !egal(p.case.w, p.case.h) && p.case.h < p.case.w - EPS) note(cas, `pièce ${p.v} : case plus large que haute`)
      const c = p.case
      if (c.x < MARQUE - EPS || c.y < MARQUE - EPS || c.x + c.w > W - MARQUE + EPS || c.y + c.h > H - MARQUE + EPS) note(cas, `${ou} : case ${p.v} hors de la zone utile`)
    }
    for (let a = 0; a < page.poses.length; a++) for (let b = a + 1; b < page.poses.length; b++) {
      if (chevauche(page.poses[a].case, page.poses[b].case)) note(cas, `${ou} : cases ${a} et ${b} se chevauchent`)
      if (chevauche(page.poses[a].boite, page.poses[b].boite)) note(cas, `${ou} : argent ${a} et ${b} se chevauchent`)
    }
    // les traits de coupe (horizontaux au bord des bandes, verticaux au bord des cases) ne traversent aucun article
    for (const [j, b] of page.bandes.entries()) {
      for (const y of [b.y, b.y + b.h]) {
        const sur = page.poses.find(p => p.boite.y < y - EPS && y + EPS < p.boite.y + p.boite.h)
        if (sur) note(cas, `${ou} : un trait horizontal (y = ${y}) traverse ${sur.v}`)
      }
      for (const x of b.xs) {
        const sur = page.poses.find(p => p.bande === j && p.boite.x < x - EPS && x + EPS < p.boite.x + p.boite.w)
        if (sur) note(cas, `${ou} : un trait vertical (x = ${x}) traverse ${sur.v}`)
      }
    }
  }
}

const zone = (format, orientation) => { const m = mesuresAffiche({ format, orientation }); return { W: m.W, H: m.H - H_CONSIGNE } }
// la taille des pièces et celle des billets se règlent séparément
const COUPLES = [[100, 100], [75, 75], [50, 50], [100, 50], [50, 100], [75, 100]]
// les exemplaires d'une planche « une rangée pleine » : calculés par la disposition ; pour les autres cas on en demande un nombre
const toutes = centimes => [...LOTS[centimes ? 'centimes' : 'euros'].pieces, ...LOTS[centimes ? 'centimes' : 'euros'].billets]

for (const centimes of [false, true]) {
  for (const [tp, tb] of COUPLES) for (const format of ['A4', 'A3']) for (const orientation of ['landscape', 'portrait']) {
    const { W, H } = zone(format, orientation)
    const cas = `${centimes ? 'centimes' : 'euros'} pièces ${tp} % billets ${tb} % ${format} ${orientation}`
    nbCas++
    const pages = disposerPlanche({ centimes, taillePieces: tp, tailleBillets: tb, W, H })
    // « une rangée pleine » : au moins un exemplaire de chaque valeur, le nombre que la disposition a posé
    const attendu = {}
    for (const p of pages.flatMap(x => x.poses)) attendu[p.v] = (attendu[p.v] ?? 0) + 1
    if (Object.keys(attendu).length !== toutes(centimes).length) note(cas, 'une valeur manque')
    verifierDisposition(cas, pages, { W, H, kp: tp / 100, kb: tb / 100, attendu })
  }
}
verifier(!problemes.length, `${nbCas} dispositions par défaut (variante × tailles × format × sens) : guillotine, sans chevauchement, dans la zone${problemes.length ? ` — ${[...new Set(problemes)].slice(0, 3).join(' ; ')} (${problemes.length})` : ''}`)

// ── Les options : exemplaires, valeurs, pièces et/ou billets ──
const avant = problemes.length
let nbOptions = 0
for (const centimes of [false, true]) {
  for (const [format, orientation] of [['A4', 'landscape'], ['A4', 'portrait'], ['A3', 'landscape']]) {
    const { W, H } = zone(format, orientation)
    const lot = LOTS[centimes ? 'centimes' : 'euros']
    const base = { centimes, taillePieces: 100, tailleBillets: 100, W, H }
    const nom = (x) => `${centimes ? 'centimes' : 'euros'} ${format} ${orientation[0]} ${x}`
    // exemplaires : n de chaque valeur (hors « rangée pleine »)
    for (const n of EXEMPLAIRES.filter(e => e > 0)) {
      nbOptions++
      verifierDisposition(nom(`${n} exemplaire(s)`), disposerPlanche({ ...base, exemplaires: n }), { W, H, kp: 1, kb: 1, attendu: Object.fromEntries(toutes(centimes).map(v => [v, n])) })
    }
    // valeurs : un sous-ensemble (la moitié des valeurs, une seule)
    for (const valeurs of [toutes(centimes).filter((_, i) => i % 2 === 0), [toutes(centimes).at(-1)]]) {
      nbOptions++
      verifierDisposition(nom(`valeurs ${valeurs}`), disposerPlanche({ ...base, exemplaires: 3, valeurs }), { W, H, kp: 1, kb: 1, attendu: Object.fromEntries(valeurs.map(v => [v, 3])) })
    }
    // genres
    for (const genres of GENRES) {
      nbOptions++
      const voulues = genres === 'billets' ? lot.billets : genres === 'pieces' ? lot.pieces : toutes(centimes)
      verifierDisposition(nom(genres), disposerPlanche({ ...base, exemplaires: 2, genres }), { W, H, kp: 1, kb: 1, attendu: Object.fromEntries(voulues.map(v => [v, 2])) })
    }
    // genre et valeurs contradictoires : une page vide, pas d'erreur
    nbOptions++
    const vide = disposerPlanche({ ...base, genres: 'pieces', valeurs: [lot.billets[0]] })
    if (vide.length !== 1 || vide[0].poses.length) note(nom('contradiction'), 'devrait donner une seule page vide')
  }
}
verifier(problemes.length === avant, `${nbOptions} options (exemplaires, valeurs, pièces et billets) : bon nombre de chaque valeur, découpable de bord à bord${problemes.length > avant ? ` — ${problemes.slice(avant, avant + 3).join(' ; ')}` : ''}`)
// plus d'exemplaires = au moins autant de pages
{
  const { W, H } = zone('A4', 'landscape')
  const pages = n => disposerPlanche({ centimes: true, taillePieces: 100, tailleBillets: 100, exemplaires: n, W, H }).length
  verifier(pages(1) <= pages(2) && pages(2) <= pages(5) && pages(5) <= pages(10), `plus d'exemplaires, plus de pages : ${[1, 2, 5, 10].map(pages)} pages pour 1, 2, 5 et 10 exemplaires`)
}

// ── Densité : jamais moins d'articles par page qu'avec l'ancien placement (une bande par valeur, ECART 3 mm) ──
// [planche, format, sens, taille %, articles, pages] mesurés avant l'optimisation, « une rangée pleine », pièces et billets à la même taille
const AVANT = [
  ['eur', 'A4', 'l', 100, 24, 3],
  ['eur', 'A4', 'l', 75, 30, 2],
  ['eur', 'A4', 'l', 50, 45, 2],
  ['eur', 'A4', 'p', 100, 16, 2],
  ['eur', 'A4', 'p', 75, 18, 2],
  ['eur', 'A4', 'p', 50, 30, 1],
  ['eur', 'A3', 'l', 100, 35, 2],
  ['eur', 'A3', 'l', 75, 47, 2],
  ['eur', 'A3', 'l', 50, 67, 1],
  ['eur', 'A3', 'p', 100, 21, 1],
  ['eur', 'A3', 'p', 75, 30, 1],
  ['eur', 'A3', 'p', 50, 45, 1],
  ['cent', 'A4', 'l', 100, 79, 5],
  ['cent', 'A4', 'l', 75, 98, 4],
  ['cent', 'A4', 'l', 50, 144, 3],
  ['cent', 'A4', 'p', 100, 53, 3],
  ['cent', 'A4', 'p', 75, 61, 2],
  ['cent', 'A4', 'p', 50, 98, 2],
  ['cent', 'A3', 'l', 100, 115, 4],
  ['cent', 'A3', 'l', 75, 152, 3],
  ['cent', 'A3', 'l', 50, 209, 2],
  ['cent', 'A3', 'p', 100, 70, 2],
  ['cent', 'A3', 'p', 75, 98, 2],
  ['cent', 'A3', 'p', 50, 144, 1],
]
const echecs = []
for (const [lot, format, sens, taille, articles, pages] of AVANT) {
  const { W, H } = zone(format, sens === 'l' ? 'landscape' : 'portrait')
  const p = disposerPlanche({ centimes: lot === 'cent', taillePieces: taille, tailleBillets: taille, W, H })
  const n = p.reduce((t, x) => t + x.poses.length, 0)
  if (n / p.length < articles / pages - 1e-9) echecs.push(`${lot} ${format} ${sens} ${taille} % : ${(n / p.length).toFixed(1)} < ${(articles / pages).toFixed(1)} par page`)
}
verifier(!echecs.length, `${AVANT.length} cas : au moins autant d'articles par page qu'avant l'optimisation${echecs.length ? ` — ${echecs.slice(0, 3).join(' ; ')}` : ''}`)

// plus la taille est petite, plus il y a d'articles par page
for (const centimes of [false, true]) {
  const { W, H } = zone('A4', 'landscape')
  const dens = e => { const p = disposerPlanche({ centimes, taillePieces: e, tailleBillets: e, W, H }); return p.reduce((t, x) => t + x.poses.length, 0) / p.length }
  verifier(dens(100) < dens(75) && dens(75) < dens(50), `${centimes ? 'euros et centimes' : 'euros'} (A4 paysage) : ${dens(100).toFixed(1)} → ${dens(75).toFixed(1)} → ${dens(50).toFixed(1)} articles par page (100, 75, 50 %)`)
}
process.exit(nbEchecs() ? 1 : 0)
