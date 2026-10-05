// @ts-check
// Les mesures — dessins SVG (purs : des chaînes, utilisées à l'écran et sur la fiche) : règle graduée, balance à deux
// plateaux, broc gradué, bouteilles, segment à la taille réelle. `aria` : texte alternatif, dans la langue du contenu.
const SVG_FONT = 'font-family="Arial, sans-serif"'

/** Masse écrite : « 500 g », « 2 kg » */
export const fmtMasse = g => g >= 1000 ? `${g / 1000} kg` : `${g} g`

// ── Écran ──

export function svgRegle(max, s, e, S = 32, aria = '') {
  const m = 18, W = max * S + 2 * m, H = 100, yR = 46
  let t = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${aria}">`
  t += `<rect x="2" y="${yR}" width="${W - 4}" height="50" rx="5" fill="#fdf1b8" stroke="#c9a227" stroke-width="1.5"/>`
  for (let mm = 0; mm <= max * 10; mm++) {
    const x = m + mm * S / 10
    const len = mm % 10 === 0 ? 18 : mm % 5 === 0 ? 12 : 7
    const w = mm % 10 === 0 ? 1.6 : 0.7
    t += `<line x1="${x}" y1="${yR}" x2="${x}" y2="${yR + len}" stroke="#5a4a10" stroke-width="${w}"/>`
    if (mm % 10 === 0) {
      t += `<text x="${x}" y="${yR + 35}" font-size="13" font-weight="700" text-anchor="middle" fill="#3a2f05" ${SVG_FONT}>${mm / 10}</text>`
    }
  }
  t += `<text x="${W - 8}" y="${yR + 46}" font-size="10" text-anchor="end" fill="#8a7420" ${SVG_FONT}>cm</text>`
  const x1 = m + s * S, x2 = m + e * S, y = yR - 7
  t += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#e74c3c" stroke-width="5"/>`
  t += `<line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${yR}" stroke="#c0392b" stroke-width="2"/>`
  t += `<line x1="${x2}" y1="${y - 10}" x2="${x2}" y2="${yR}" stroke="#c0392b" stroke-width="2"/>`
  return t + '</svg>'
}

function dimMasse(g) {
  if (g >= 1000) { const k = g / 1000; const w = k >= 5 ? 46 : k >= 2 ? 42 : 38; return [w, w] }
  if (g >= 100) return [34, 32]
  if (g >= 10) return [28, 26]
  return [24, 22]
}

function largeurItem(it) {
  if (it.kind === 'masse') return dimMasse(it.g)[0]
  if (it.kind === 'boite') return it.w
  return 50
}

function dessinItem(it) {
  if (it.kind === 'masse') {
    const [w, h] = dimMasse(it.g)
    const fs = w >= 34 ? 11 : 9
    return `<rect x="${w / 2 - w * 0.18}" y="${-h - 6}" width="${w * 0.36}" height="7" rx="2" fill="#c0952e" stroke="#8a6a1e"/>`
      + `<rect x="0" y="${-h}" width="${w}" height="${h}" rx="4" fill="#d9ad45" stroke="#8a6a1e" stroke-width="1.5"/>`
      + `<text x="${w / 2}" y="${-h / 2 + fs / 2 - 1}" font-size="${fs}" font-weight="700" text-anchor="middle" fill="#3d2c05" ${SVG_FONT}>${fmtMasse(it.g)}</text>`
  }
  if (it.kind === 'boite') {
    return `<rect x="0" y="${-it.h}" width="${it.w}" height="${it.h}" rx="3" fill="${it.couleur}" stroke="#333" stroke-width="1.5"/>`
      + `<line x1="0" y1="${-it.h * 0.65}" x2="${it.w}" y2="${-it.h * 0.65}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`
  }
  return `<text x="25" y="-4" font-size="44" text-anchor="middle">${it.e}</text>`
}

// tilt : 0 = équilibre, 1 = plateau gauche en bas, -1 = plateau droit en bas
export function svgBalance(tilt, gauche, droite, aria = '') {
  const W = 380, H = 235, cx = 190, cy = 72, half = 120
  const a = tilt * 0.18
  const gx = cx - half * Math.cos(a), gy = cy + half * Math.sin(a)
  const dx = cx + half * Math.cos(a), dy = cy - half * Math.sin(a)
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${aria}">`
  s += `<path d="M ${cx - 62} ${H - 6} L ${cx + 62} ${H - 6} L ${cx + 36} ${H - 26} L ${cx - 36} ${H - 26} Z" fill="#7f8c8d"/>`
  s += `<rect x="${cx - 6}" y="${cy}" width="12" height="${H - 26 - cy}" fill="#95a5a6"/>`
  const plateau = (x, y, items) => {
    const yp = y + 78
    let p = `<line x1="${x}" y1="${y}" x2="${x - 62}" y2="${yp}" stroke="#7f8c8d" stroke-width="1.5"/>`
      + `<line x1="${x}" y1="${y}" x2="${x + 62}" y2="${yp}" stroke="#7f8c8d" stroke-width="1.5"/>`
    const larg = items.map(largeurItem)
    const total = larg.reduce((acc, w) => acc + w, 0) + 4 * (items.length - 1)
    const k = Math.min(1, 124 / total)
    let xi = x - total * k / 2
    items.forEach((it, i) => {
      p += `<g transform="translate(${xi.toFixed(1)} ${yp.toFixed(1)}) scale(${k.toFixed(3)})">${dessinItem(it)}</g>`
      xi += (larg[i] + 4) * k
    })
    p += `<path d="M ${x - 70} ${yp} Q ${x} ${yp + 18} ${x + 70} ${yp} Z" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="1.5"/>`
    return p
  }
  s += plateau(gx, gy, gauche) + plateau(dx, dy, droite)
  s += `<line x1="${gx}" y1="${gy}" x2="${dx}" y2="${dy}" stroke="#566573" stroke-width="7" stroke-linecap="round"/>`
  s += `<circle cx="${cx}" cy="${cy}" r="8" fill="#34495e"/>`
  return s + '</svg>'
}


export function svgBroc(max, k, u = 'L', aria = '') {
  const W = 230, H = 260, xg = 80, xd = 180, yb = 240, yMax = 60
  const yv = v => yb - v * (yb - yMax) / max
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${aria}">`
  s += `<rect x="${xg + 1}" y="${yv(k)}" width="${xd - xg - 2}" height="${yb - yv(k) - 1}" rx="6" fill="#74b9ff" opacity=".85"/>`
  s += `<line x1="${xg + 1}" y1="${yv(k)}" x2="${xd - 1}" y2="${yv(k)}" stroke="#2e86de" stroke-width="2"/>`
  s += `<path d="M ${xd} 80 C ${xd + 42} 80 ${xd + 42} 180 ${xd} 180" fill="none" stroke="#555" stroke-width="7"/>`
  s += `<path d="M ${xg - 12} 22 L ${xg} 34 L ${xg} ${yb - 8} Q ${xg} ${yb} ${xg + 8} ${yb} L ${xd - 8} ${yb} Q ${xd} ${yb} ${xd} ${yb - 8} L ${xd} 26" fill="none" stroke="#555" stroke-width="3"/>`
  for (let v = 1; v <= max; v++) {
    const y = yv(v)
    s += `<line x1="${xg}" y1="${y}" x2="${xg + 18}" y2="${y}" stroke="#222" stroke-width="2"/>`
    s += `<text x="${xg - 6}" y="${y + 4}" font-size="13" font-weight="700" text-anchor="end" fill="#222" ${SVG_FONT}>${v} ${u}</text>`
  }
  return s + '</svg>'
}


export function svgBouteilles(n1, n2, aria = '') {
  const items = [...Array(n2).fill(2), ...Array(n1).fill(1)]
  const gap = 10, yb = 150
  const larg = c => c === 2 ? 42 : 32
  const totalB = items.reduce((acc, c) => acc + larg(c) + gap, 0)
  const W = Math.max(totalB + 130, 260), H = 165
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${aria}">`
  let x = 10
  items.forEach(c => {
    const w = larg(c), h = c === 2 ? 100 : 70
    const top = yb - h
    s += `<rect x="${x + w / 2 - 6}" y="${top - 18}" width="12" height="8" rx="2" fill="#e74c3c"/>`
    s += `<rect x="${x + w / 2 - 5}" y="${top - 11}" width="10" height="14" fill="#cdeeff" stroke="#2980b9" stroke-width="1.5"/>`
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="9" fill="#a8e0ff" stroke="#2980b9" stroke-width="2"/>`
    s += `<rect x="${x + 3}" y="${top + h * 0.35}" width="${w - 6}" height="20" fill="white" opacity=".9"/>`
    s += `<text x="${x + w / 2}" y="${top + h * 0.35 + 15}" font-size="13" font-weight="700" text-anchor="middle" fill="#1b4f72" ${SVG_FONT}>${c} L</text>`
    x += w + gap
  })
  // flèche et seau
  s += `<text x="${x + 6}" y="105" font-size="28" fill="#555" ${SVG_FONT}>➜</text>`
  const sx = x + 42
  s += `<path d="M ${sx} 70 L ${sx + 70} 70 L ${sx + 60} ${yb} L ${sx + 10} ${yb} Z" fill="#f5b041" stroke="#935116" stroke-width="2"/>`
  s += `<path d="M ${sx} 70 Q ${sx + 35} 30 ${sx + 70} 70" fill="none" stroke="#935116" stroke-width="2.5"/>`
  s += `<text x="${sx + 35}" y="120" font-size="28" font-weight="700" text-anchor="middle" fill="#6e2c00" ${SVG_FONT}>?</text>`
  return s + '</svg>'
}


// ── Fiche (taille réelle : 1 unité = 1 mm) ──

export function segmentReel(L) {
  // viewBox en mm : 1 unité = 1 mm, largeur CSS en cm réels
  return `<svg width="${L}cm" height="0.8cm" viewBox="0 0 ${L * 10} 8" style="overflow:visible">`
    + `<line x1="0" y1="4" x2="${L * 10}" y2="4" stroke="#c0392b" stroke-width="0.7"/>`
    + `<line x1="0" y1="1" x2="0" y2="7" stroke="#c0392b" stroke-width="0.4"/>`
    + `<line x1="${L * 10}" y1="1" x2="${L * 10}" y2="7" stroke="#c0392b" stroke-width="0.4"/></svg>`
}

export function regleTemoin() {
  let s = '<svg width="10cm" height="1.1cm" viewBox="0 0 100 11" style="overflow:visible">'
  s += '<line x1="0" y1="0.2" x2="100" y2="0.2" stroke="#000" stroke-width="0.4"/>'
  for (let mm = 0; mm <= 100; mm++) {
    const len = mm % 10 === 0 ? 4.5 : mm % 5 === 0 ? 3 : 1.8
    s += `<line x1="${mm}" y1="0" x2="${mm}" y2="${len}" stroke="#000" stroke-width="${mm % 10 === 0 ? 0.35 : 0.15}"/>`
    if (mm % 10 === 0) s += `<text x="${mm}" y="9" font-size="3.5" text-anchor="middle" font-family="Arial">${mm / 10}</text>`
  }
  return s + '</svg>'
}

