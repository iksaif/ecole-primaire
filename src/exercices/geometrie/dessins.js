// La géométrie — dessins SVG (chaînes, purs : écran, fiche et corrigé). Figures, cercle, patron, solides, quadrillage.
// Voir aussi src/impression/affiches/formes.js : ses solides sont de petites icônes colorées à la volée, d'un autre
// dessin (taille, ombrage) ; rien de commun à partager proprement.
import { dek, LETTRES } from './quadrillage.js'

// ── Dessins SVG (chaînes, utilisées à l'écran et dans la fiche) ──
const f1 = n => Math.round(n * 10) / 10

export function svgFigure(q, marquerAngles = false, taille = 220) {
  let corps = ''
  const lettres = q.lettres || null
  if (q.forme === 'cercle') {
    corps = `<circle cx="100" cy="100" r="${q.rayon}" fill="#ffe08a" stroke="#2c3e50" stroke-width="3"/>`
  } else {
    const pts = q.points
    corps = `<polygon points="${pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ')}" fill="#ffe08a" stroke="#2c3e50" stroke-width="3" stroke-linejoin="round"/>`
    if (lettres) {
      const gx = pts.reduce((a, p) => a + p[0], 0) / pts.length, gy = pts.reduce((a, p) => a + p[1], 0) / pts.length
      pts.forEach((P, i) => {
        const dx = P[0] - gx, dy = P[1] - gy, l = Math.hypot(dx, dy) || 1
        corps += `<text x="${f1(P[0] + dx / l * 15)}" y="${f1(P[1] + dy / l * 15)}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="17" font-weight="bold" fill="#1a5fb4">${lettres[i]}</text>`
      })
    }
    if (marquerAngles) {
      const n = pts.length
      for (const i of q.anglesDroits) {
        const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n]
        const lu = Math.hypot(A[0] - P[0], A[1] - P[1]), lv = Math.hypot(B[0] - P[0], B[1] - P[1])
        const u = [(A[0] - P[0]) / lu * 13, (A[1] - P[1]) / lu * 13]
        const v = [(B[0] - P[0]) / lv * 13, (B[1] - P[1]) / lv * 13]
        corps += `<polyline points="${f1(P[0] + u[0])},${f1(P[1] + u[1])} ${f1(P[0] + u[0] + v[0])},${f1(P[1] + u[1] + v[1])} ${f1(P[0] + v[0])},${f1(P[1] + v[1])}" fill="none" stroke="#e74c3c" stroke-width="2"/>`
      }
    }
  }
  const vb = lettres ? '-15 -15 230 230' : '0 0 200 200'
  return `<svg viewBox="${vb}" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`
}

// Cercle de centre O (CE2). Positions de base (degrés) : diamètre 200°/20°, rayon 110°, corde 250°/350°.
export function svgCercle(q, taille = 220) {
  const R = 70
  const pt = deg => { const a = (deg + q.rot) * Math.PI / 180; return [f1(100 + R * Math.cos(a)), f1(100 + R * Math.sin(a))] }
  const lab = (deg, l) => { const a = (deg + q.rot) * Math.PI / 180; return `<text x="${f1(100 + (R + 15) * Math.cos(a))}" y="${f1(100 + (R + 15) * Math.sin(a))}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="16" font-weight="bold" fill="#1a5fb4">${l}</text>` }
  const pointSur = (deg, l) => { const [x, y] = pt(deg); return `<circle cx="${x}" cy="${y}" r="3.5" fill="#2c3e50"/>` + lab(deg, l) }
  const seg = (A, B, coul = '#2c3e50') => `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${coul}" stroke-width="3" stroke-linecap="round"/>`
  const O = [100, 100], { a, b, c, d, e } = q.pts
  let s = `<circle cx="100" cy="100" r="${R}" fill="#eaf4ff" stroke="#2c3e50" stroke-width="3"/>`
  if (q.sous === 'centre') s += seg(O, pt(110), '#999') + pointSur(110, a)
  if (q.sous === 'segment') {
    if (q.cible === 'rayon') s += seg(O, pt(110), '#e74c3c') + pointSur(110, a)
    else s += seg(pt(200), pt(20), '#e74c3c') + pointSur(200, b) + pointSur(20, c)
  }
  if (q.sous === 'lequel') {
    s += seg(O, pt(110)) + seg(pt(200), pt(20)) + seg(pt(250), pt(350))
      + pointSur(110, a) + pointSur(200, b) + pointSur(20, c) + pointSur(250, d) + pointSur(350, e)
  }
  if (q.sous === 'mesure') s += seg(O, pt(110), '#999')
  // centre O (étiquette décalée pour ne pas chevaucher les segments)
  const ao = (155 + q.rot) * Math.PI / 180
  s += `<circle cx="100" cy="100" r="3.5" fill="#2c3e50"/><text x="${f1(100 + 14 * Math.cos(ao))}" y="${f1(100 + 14 * Math.sin(ao))}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="16" font-weight="bold" fill="#c0392b">O</text>`
  return `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}

// Patron : cases en px (écran) ou en cm (impression, unite = 'cm')
export function svgPatron(cells, { cote = 36, unite = '' } = {}) {
  const cols = Math.max(...cells.map(p => p[0])) + 1, rows = Math.max(...cells.map(p => p[1])) + 1
  const m = 0.2
  let s = ''
  for (const [c, r] of cells) s += `<rect x="${c + m}" y="${r + m}" width="1" height="1" fill="${unite ? '#fff' : '#cfe2ff'}" stroke="#2c3e50" stroke-width="0.05"/>`
  const W = cols + 2 * m, H = rows + 2 * m
  const dim = unite ? `width="${f1(W * cote)}${unite}" height="${f1(H * cote)}${unite}"` : `width="${f1(W * cote)}" height="${f1(H * cote)}"`
  return `<svg viewBox="0 0 ${W} ${H}" ${dim} xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}

const TRAIT = 'stroke="#2c3e50" stroke-width="2.5" stroke-linejoin="round"'
const CACHE = 'stroke="#2c3e50" stroke-width="2" stroke-dasharray="6 5" fill="none"'

export function svgSolide(type, taille = 220) {
  let c
  if (type === 'cube' || type === 'pave') {
    const [x, y, w, h, dx, dy] = type === 'cube' ? [45, 75, 80, 80, 38, -32] : [30, 95, 110, 55, 42, -30]
    const A = [x, y], B = [x + w, y], C = [x + w, y + h], D = [x, y + h]
    const E = [x + dx, y + dy], F = [x + w + dx, y + dy], G = [x + w + dx, y + h + dy], H = [x + dx, y + h + dy]
    const p = (...pts) => pts.map(q => q.join(',')).join(' ')
    c = `<polygon points="${p(A, B, C, D)}" fill="#cfe2ff" ${TRAIT}/>`
      + `<polygon points="${p(A, B, F, E)}" fill="#e8f1ff" ${TRAIT}/>`
      + `<polygon points="${p(B, F, G, C)}" fill="#a9c8f5" ${TRAIT}/>`
      + `<polyline points="${p(D, H, G)}" ${CACHE}/><line x1="${H[0]}" y1="${H[1]}" x2="${E[0]}" y2="${E[1]}" ${CACHE}/>`
  } else if (type === 'pyramide') {
    const A = '35,160', B = '135,160', C = '170,128', D = '70,128', S = '100,32'
    c = `<polygon points="${S} ${A} ${B}" fill="#ffd8a8" ${TRAIT}/>`
      + `<polygon points="${S} ${B} ${C}" fill="#f7b267" ${TRAIT}/>`
      + `<polyline points="${A} ${D} ${C}" ${CACHE}/><line x1="100" y1="32" x2="70" y2="128" ${CACHE}/>`
  } else if (type === 'cylindre') {
    c = `<path d="M45,45 L45,155 A55,16 0 0,0 155,155 L155,45 Z" fill="#b8e0c2" ${TRAIT}/>`
      + `<path d="M45,155 A55,16 0 0,1 155,155" ${CACHE}/>`
      + `<ellipse cx="100" cy="45" rx="55" ry="16" fill="#dff3e4" ${TRAIT}/>`
  } else if (type === 'cone') {
    c = `<path d="M100,30 L42,160 A58,16 0 0,0 158,160 Z" fill="#f5c6e0" ${TRAIT}/>`
      + `<path d="M42,160 A58,16 0 0,1 158,160" ${CACHE}/>`
  } else {
    c = `<defs><radialGradient id="geoBoule" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e57373"/></radialGradient></defs>`
      + `<circle cx="100" cy="100" r="68" fill="url(#geoBoule)" ${TRAIT}/>`
      + `<path d="M32,100 A68,18 0 0,0 168,100" fill="none" stroke="#2c3e50" stroke-width="1.2" opacity=".5"/>`
      + `<path d="M32,100 A68,18 0 0,1 168,100" fill="none" stroke="#2c3e50" stroke-width="1.2" stroke-dasharray="5 5" opacity=".4"/>`
  }
  return `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${c}</svg>`
}

// Quadrillage pour l'impression : 1 unité = 1 cm réel (× echelle : grilles réduites du corrigé)
export function svgGrilleCm({ cols, rows, pleines = [], axe = null, repere = null, symboles = {}, entetes = false, echelle = 1 }) {
  const m = 0.5, off = entetes ? 1 : 0
  const W = cols + off + 2 * m, H = rows + off + 2 * m
  const x0 = m + off, y0 = m + off
  let s = ''
  for (const cle of pleines) {
    const [c, r] = dek(cle)
    s += `<rect x="${x0 + c}" y="${y0 + r}" width="1" height="1" fill="#b5b5b5"/>`
  }
  for (let c = 0; c <= cols; c++) s += `<line x1="${x0 + c}" y1="${y0}" x2="${x0 + c}" y2="${y0 + rows}" stroke="#555" stroke-width="0.02"/>`
  for (let r = 0; r <= rows; r++) s += `<line x1="${x0}" y1="${y0 + r}" x2="${x0 + cols}" y2="${y0 + r}" stroke="#555" stroke-width="0.02"/>`
  if (entetes) {
    for (let c = 0; c < cols; c++) s += `<text x="${x0 + c + 0.5}" y="${y0 - 0.3}" font-size="0.55" font-weight="bold" text-anchor="middle" font-family="Arial">${LETTRES[c]}</text>`
    for (let r = 0; r < rows; r++) s += `<text x="${x0 - 0.5}" y="${y0 + r + 0.7}" font-size="0.55" font-weight="bold" text-anchor="middle" font-family="Arial">${r + 1}</text>`
  }
  if (axe === 'v') s += `<line x1="${x0 + cols / 2}" y1="${y0 - 0.4}" x2="${x0 + cols / 2}" y2="${y0 + rows + 0.4}" stroke="#d00" stroke-width="0.09"/>`
  if (axe === 'h') s += `<line x1="${x0 - 0.4}" y1="${y0 + rows / 2}" x2="${x0 + cols + 0.4}" y2="${y0 + rows / 2}" stroke="#d00" stroke-width="0.09"/>`
  if (repere) { const [c, r] = dek(repere); s += `<circle cx="${x0 + c + 0.5}" cy="${y0 + r + 0.5}" r="0.14" fill="#000"/>` }
  for (const [cle, sym] of Object.entries(symboles)) {
    const [c, r] = dek(cle)
    s += `<text x="${x0 + c + 0.5}" y="${y0 + r + 0.72}" font-size="0.65" text-anchor="middle" font-family="Arial">${sym}</text>`
  }
  return `<svg width="${f1(W * echelle)}cm" height="${f1(H * echelle)}cm" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}
