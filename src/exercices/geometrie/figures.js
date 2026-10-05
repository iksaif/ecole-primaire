// La géométrie — questions sur les figures et les solides : nom, côtés, angle droit, solides, angles droits (lettres aux
// sommets), propriétés, cercle. Pur ; l'ordre des tirages est celui de l'ancienne vue (mêmes fiches).
import {
  FIGURES, NOMS_CONCURRENTS, TRIANGLES, ROTATIONS, ROTATIONS_CARRE, FORMES_LIBRES, SOLIDES, PROPRIETES, aChoix, avecChoix,
} from './donnees.js'

const LETTRES_POINTS = 'ABCDEFGHKLMN'.split('')

function angleSommet(pts, i) {
  const n = pts.length
  const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n]
  const u = [A[0] - P[0], A[1] - P[1]], v = [B[0] - P[0], B[1] - P[1]]
  const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI
}

/** Une figure dessinée dans 200 × 200 : { points, rayon, anglesDroits } (cercle : rayon seul). */
export function construireFigure(rng, forme) {
  let pts
  if (forme === 'cercle') return { points: [], rayon: rng.entier(55, 70), anglesDroits: [] }
  if (forme === 'carre') { const s = rng.entier(80, 100) / 2; pts = [[-s, -s], [s, -s], [s, s], [-s, s]] }
  else if (forme === 'rectangle') { const w = rng.entier(120, 145) / 2, h = rng.entier(55, 75) / 2; pts = [[-w, -h], [w, -h], [w, h], [-w, h]] }
  else if (forme === 'losange') { const a = rng.entier(60, 72), b = rng.entier(34, 44); pts = [[0, -a], [b, 0], [0, a], [-b, 0]] }
  else if (forme === 'triangle_rectangle') { const a = rng.entier(90, 130), b = rng.entier(70, 110); pts = [[0, 0], [a, 0], [0, -b]] }
  else if (FORMES_LIBRES[forme]) pts = rng.choisir(FORMES_LIBRES[forme])
  else pts = rng.choisir(TRIANGLES)
  const ang = rng.choisir(forme === 'carre' ? ROTATIONS_CARRE : ROTATIONS) * Math.PI / 180
  pts = pts.map(([x, y]) => [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)])
  // Centrer dans 200 × 200 et réduire si besoin (≤ 160)
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const larg = Math.max(...xs) - Math.min(...xs), haut = Math.max(...ys) - Math.min(...ys)
  const ech = Math.min(1, 160 / Math.max(larg, haut))
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2
  pts = pts.map(([x, y]) => [100 + (x - cx) * ech, 100 + (y - cy) * ech])
  const anglesDroits = pts.map((_, i) => i).filter(i => Math.abs(angleSommet(pts, i) - 90) < 0.5)
  return { points: pts, rayon: 0, anglesDroits }
}

/** Figure : son nom, son nombre de côtés ou si elle a un angle droit. */
export function genFigure({ rng, T, niv }) {
  const forme = rng.choisir(niv.figures)
  const sousDispo = forme === 'cercle' ? ['nom'] : ['nom', 'cotes', 'angle']
  const sous = rng.choisir(sousDispo)
  const f = FIGURES[forme]
  const nom = id => T('figures')[id]
  const base = { type: 'figure', sous, forme, cle: `fig-${sous}-${forme}`, ...construireFigure(rng, forme) }
  if (sous === 'nom') {
    const exclus = NOMS_CONCURRENTS[forme] || []
    const autres = rng.melanger(niv.figures.filter(x => x !== forme && !exclus.includes(x))).slice(0, 3)
    return avecChoix({ ...base, texte: T('figureNomQ'), attendu: nom(forme) },
      rng.melanger([forme, ...autres].map(nom)), nom(forme))
  }
  const attendu = rep => `${rep} (${nom(forme)})`
  if (sous === 'cotes') return avecChoix({ ...base, texte: T('figureCotesQ'), attendu: attendu(f.cotes) }, ['3', '4', '5', '6'], String(f.cotes))
  const reponse = f.angleDroit ? T('oui') : T('non')
  return avecChoix({ ...base, texte: T('figureAngleQ'), attendu: attendu(reponse) }, [T('oui'), T('non')], reponse)
}

/** Solide : son nom, s'il roule, son nombre de faces ou de sommets. */
export function genSolide({ rng, T, niv }) {
  const solide = rng.choisir(niv.solides)
  const s = SOLIDES[solide]
  const nom = id => T('solides')[id]
  const sousDispo = ['nom', 'rouler']
  if (niv.solidesComptage.includes(solide)) sousDispo.push('faces', 'sommets')
  const sous = rng.choisir(sousDispo)
  const base = { type: 'solide', sous, solide, cle: `sol-${sous}-${solide}` }
  if (sous === 'nom') {
    const autres = rng.melanger(niv.solides.filter(x => x !== solide)).slice(0, 3)
    return avecChoix({ ...base, texte: T('solideNomQ'), attendu: nom(solide) },
      rng.melanger([solide, ...autres].map(nom)), nom(solide))
  }
  const attendu = rep => `${rep} (${nom(solide)})`
  if (sous === 'rouler') {
    const reponse = s.roule ? T('oui') : T('non')
    return avecChoix({ ...base, texte: T('solideRoulerQ'), attendu: attendu(reponse) }, [T('oui'), T('non')], reponse)
  }
  const reponse = String(sous === 'faces' ? s.faces : s.sommets)
  return avecChoix({ ...base, texte: T(sous === 'faces' ? 'solideFacesQ' : 'solideSommetsQ'), attendu: attendu(reponse) }, ['4', '5', '6', '8'], reponse)
}

/** CE2 : angles droits (lettres aux sommets). `droits` : les lettres des sommets à angle droit, triées. */
export function genAngles({ rng, T, niv }) {
  const forme = rng.choisir(niv.anglesFormes)
  const fig = construireFigure(rng, forme)
  const n = fig.points.length
  const decal = rng.entier(0, n - 1)
  const lettres = fig.points.map((_, i) => 'ABCD'[(i + decal) % n])
  const droits = fig.anglesDroits.map(i => lettres[i]).sort()
  return {
    type: 'angles', forme, cle: `ang-${forme}-${decal}`, ...fig, lettres, droits,
    texte: T('anglesQ'), attendu: droits.length ? droits.join(', ') : T('aucun'),
  }
}

/** CE2 : propriétés des figures (« Vrai ou faux ? » ou question à choix parmi les figures). */
export function genPropriete({ rng, T }) {
  const p = rng.choisir(PROPRIETES)
  const texte = T('proprietes')[p.id]
  if (aChoix(p)) {
    const choix = T('choixFigures')
    return avecChoix({ type: 'proprietes', prop: p.id, cle: 'prop-' + p.id, texte, attendu: choix[p.figure] }, rng.melanger(choix), choix[p.figure])
  }
  const [vrai, faux] = T('vraiFaux')
  const reponse = p.vrai ? vrai : faux
  return avecChoix({ type: 'proprietes', prop: p.id, cle: 'prop-' + p.id, texte: `${T('vraiOuFaux')} ${texte}`, attendu: reponse }, [vrai, faux], reponse)
}

/** CE2 : cercle (centre, rayon, diamètre, mesures). */
export function genCercle({ rng, T, niv }) {
  const sous = rng.choisir(['centre', 'segment', 'segment', 'lequel', 'mesure', 'mesure'])
  const [a, b, c, d, e] = rng.melanger(LETTRES_POINTS).slice(0, 5)
  const base = { type: 'cercle', sous, rot: rng.entier(0, 359), pts: { a, b, c, d, e } }
  if (sous === 'centre') {
    const choix = T('centreChoix')
    return avecChoix({ ...base, cle: 'cer-centre', texte: T('centreQ'), attendu: choix[0] }, rng.melanger(choix), choix[0])
  }
  if (sous === 'segment') {
    const cible = rng.choisir(['rayon', 'diametre'])
    const nom = cible === 'rayon' ? `[O${a}]` : `[${b}${c}]`
    const choix = T('segmentChoix')   // [rayon, diamètre, côté]
    const reponse = choix[cible === 'rayon' ? 0 : 1]
    return avecChoix({ ...base, cible, cle: 'cer-seg-' + cible, texte: T('segmentQ', { nom }), attendu: reponse }, [...choix], reponse)
  }
  if (sous === 'lequel') {
    const cible = rng.choisir(['rayon', 'diametre'])
    const segs = { rayon: `[O${a}]`, diametre: `[${b}${c}]`, corde: `[${d}${e}]` }
    return avecChoix({ ...base, cible, cle: 'cer-lequel-' + cible, texte: T(cible === 'rayon' ? 'lequelRayonQ' : 'lequelDiametreQ'), attendu: segs[cible] },
      rng.melanger(Object.values(segs)), segs[cible])
  }
  const r = rng.entier(...niv.rayons)
  const versDiam = rng.vrai(0.5)
  const bonne = versDiam ? 2 * r : r
  const cands = versDiam ? [r, r + 1, 3 * r, 4 * r, 2 * r + 2] : [2 * r, 4 * r, r + 1, r + 2, 3 * r]
  const autres = [...new Set(cands.filter(x => x !== bonne))].slice(0, 3)
  return avecChoix({
    ...base, r, cle: `cer-mes-${versDiam ? 'd' : 'r'}-${r}`,
    texte: versDiam ? T('mesureDiametreQ', { r }) : T('mesureRayonQ', { d: 2 * r }), attendu: bonne + ' cm',
  }, rng.melanger([bonne, ...autres]).map(x => x + ' cm'), bonne + ' cm')
}
