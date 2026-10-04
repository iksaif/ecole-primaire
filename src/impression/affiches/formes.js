// Affiche des figures planes et des solides (listes par année : LOTS_FORMES dans affiches/catalogue.js)
import { echapper } from '../../utils/impression'
import { LOTS_FORMES } from './catalogue.js'

const S = 60    // côté de la case de dessin
const poly = (pts, fond) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fond}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
// traits d'égalité des côtés (n traits au milieu du côté pq) et angle droit en q
const marque = (p, q, n) => {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy)
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux
  return Array.from({ length: n }, (_, k) => {
    const o = (k - (n - 1) / 2) * 2.2
    return `<line x1="${mx + ux * o - nx * 2.2}" y1="${my + uy * o - ny * 2.2}" x2="${mx + ux * o + nx * 2.2}" y2="${my + uy * o + ny * 2.2}" stroke="#d9480f" stroke-width="1"/>`
  }).join('')
}
const droit = (a, b, c, t = 5) => {
  const u = [(a[0] - b[0]), (a[1] - b[1])], w = [(c[0] - b[0]), (c[1] - b[1])]
  const lu = Math.hypot(...u), lw = Math.hypot(...w)
  const p1 = [b[0] + u[0] / lu * t, b[1] + u[1] / lu * t], p3 = [b[0] + w[0] / lw * t, b[1] + w[1] / lw * t]
  return `<polyline points="${p1.join(',')} ${[p1[0] + w[0] / lw * t, p1[1] + w[1] / lw * t].join(',')} ${p3.join(',')}" fill="none" stroke="#d9480f" stroke-width="1"/>`
}
// côtés parallèles : double chevron au milieu du côté pq, pointé de p vers q (même sens sur les deux côtés)
const parallele = (p, q) => {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy)
  const ux = dx / l, uy = dy / l, nx = -uy, ny = ux, t = 2.2
  return [-1.1, 1.1].map(o => {
    const cx = mx + ux * o, cy = my + uy * o
    return `<polyline points="${cx - ux * t + nx * t},${cy - uy * t + ny * t} ${cx},${cy} ${cx - ux * t - nx * t},${cy - uy * t - ny * t}" fill="none" stroke="#d9480f" stroke-width="1" stroke-linejoin="round"/>`
  }).join('')
}
const FIGURES = {
  disque: { nom: 'le disque', info: 'Un rond plein.\nLe bord est un cercle.', dessin: f => `<circle cx="30" cy="30" r="24" fill="${f}" stroke="#222" stroke-width="1.2"/><circle cx="30" cy="30" r="1.5" fill="#d9480f"/><line x1="30" y1="30" x2="54" y2="30" stroke="#d9480f" stroke-width="1"/>` },
  carre: { nom: 'le carré', info: '4 côtés égaux\n4 angles droits', dessin: f => { const P = [[10, 10], [50, 10], [50, 50], [10, 50]]; return poly(P, f) + P.map((p, i) => marque(p, P[(i + 1) % 4], 1) + droit(P[(i + 3) % 4], p, P[(i + 1) % 4])).join('') } },
  rectangle: { nom: 'le rectangle', info: '4 angles droits\ncôtés opposés égaux', dessin: f => { const P = [[4, 14], [56, 14], [56, 46], [4, 46]]; return poly(P, f) + P.map((p, i) => droit(P[(i + 3) % 4], p, P[(i + 1) % 4])).join('') + marque(P[0], P[1], 1) + marque(P[2], P[3], 1) + marque(P[1], P[2], 2) + marque(P[3], P[0], 2) } },
  triangle: { nom: 'le triangle', info: '3 côtés\n3 sommets', dessin: f => poly([[8, 50], [52, 50], [24, 8]], f) },
  'triangle-rectangle': { nom: 'le triangle rectangle', info: '1 angle droit', dessin: f => { const P = [[10, 50], [50, 50], [10, 10]]; return poly(P, f) + droit(P[2], P[0], P[1]) } },
  isocele: { nom: 'le triangle isocèle', info: '2 côtés égaux', dessin: f => { const P = [[8, 50], [52, 50], [30, 8]]; return poly(P, f) + marque(P[0], P[2], 2) + marque(P[2], P[1], 2) } },
  equilateral: { nom: 'le triangle équilatéral', info: '3 côtés égaux', dessin: f => { const P = [[8, 49], [52, 49], [30, 11]]; return poly(P, f) + marque(P[0], P[1], 1) + marque(P[1], P[2], 1) + marque(P[2], P[0], 1) } },
  losange: { nom: 'le losange', info: '4 côtés égaux', dessin: f => { const P = [[30, 6], [54, 30], [30, 54], [6, 30]]; return poly(P, f) + P.map((p, i) => marque(p, P[(i + 1) % 4], 1)).join('') } },
  trapeze: { nom: 'le trapèze', info: '2 côtés parallèles\n(les bases)', dessin: f => { const P = [[4, 48], [56, 48], [44, 14], [18, 14]]; return poly(P, f) + parallele(P[0], P[1]) + parallele(P[3], P[2]) } },
  pentagone: { nom: 'le pentagone', info: '5 côtés\n5 sommets', dessin: f => poly(Array.from({ length: 5 }, (_, i) => [30 + 25 * Math.cos((i * 72 - 90) * Math.PI / 180), 31 + 25 * Math.sin((i * 72 - 90) * Math.PI / 180)]), f) },
  hexagone: { nom: "l'hexagone", info: '6 côtés\n6 sommets', dessin: f => poly(Array.from({ length: 6 }, (_, i) => [30 + 25 * Math.cos((i * 60) * Math.PI / 180), 30 + 25 * Math.sin((i * 60) * Math.PI / 180)]), f) },
}
const trait = (p, q, pointille) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#222" stroke-width="1.2"${pointille ? ' stroke-dasharray="2.5 2"' : ''}/>`
// solides en perspective cavalière (fuyantes vers le haut à droite) ; arêtes cachées en pointillés (programme du CE2) :
// on dessine les faces vues, puis les arêtes qui partent du sommet caché (à l'intérieur du contour) en pointillés.
// Cube et pavé : faces avant, dessus et droite vues, sommet caché = arrière en bas à gauche (b[3]).
const SOLIDES = {
  cube: { nom: 'le cube', info: '6 faces carrées\n8 sommets · 12 arêtes', dessin: f => {
    const a = [[8, 22], [38, 22], [38, 52], [8, 52]], d = 14, b = a.map(([x, y]) => [x + d, y - d])
    return `<polygon points="${[a[0], a[1], a[2], a[3]].map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[0], b[0], b[1], a[1]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".7" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[1], b[1], b[2], a[2]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".45" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + trait(a[3], b[3], true) + trait(b[3], b[2], true) + trait(b[3], b[0], true) } },
  pave: { nom: 'le pavé (parallélépipède rectangle)', info: '6 faces rectangulaires\n8 sommets · 12 arêtes', dessin: f => {
    const a = [[4, 24], [42, 24], [42, 50], [4, 50]], d = 14, b = a.map(([x, y]) => [x + d, y - d])
    return `<polygon points="${a.map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[0], b[0], b[1], a[1]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".7" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[1], b[1], b[2], a[2]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".45" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + trait(a[3], b[3], true) + trait(b[3], b[2], true) + trait(b[3], b[0], true) } },
  boule: { nom: 'la boule', info: 'Aucune face plane\nune surface courbe', dessin: f => `<circle cx="30" cy="30" r="24" fill="${f}" stroke="#222" stroke-width="1.2"/><ellipse cx="30" cy="30" rx="24" ry="7" fill="none" stroke="#222" stroke-width=".8" stroke-dasharray="2.5 2"/>` },
  cylindre: { nom: 'le cylindre', info: '2 faces planes (des disques)\n+ 1 surface courbe', dessin: f => `<path d="M10 14 v32 a20 7 0 0 0 40 0 v-32" fill="${f}" stroke="#222" stroke-width="1.2"/><ellipse cx="30" cy="14" rx="20" ry="7" fill="${f}" fill-opacity=".6" stroke="#222" stroke-width="1.2"/>` },
  cone: { nom: 'le cône', info: '1 face plane (un disque)\n+ 1 surface courbe\n1 sommet', dessin: f => `<path d="M10 44 L30 6 L50 44 a20 7 0 0 1 -40 0" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 44 a20 7 0 0 0 40 0" fill="none" stroke="#222" stroke-width=".8" stroke-dasharray="2.5 2"/>` },
  pyramide: { nom: 'la pyramide (base carrée)', info: '5 faces : 1 carré + 4 triangles\n5 sommets · 8 arêtes', dessin: f => {
    const base = [[8, 44], [38, 44], [52, 34], [22, 34]], s = [30, 6]
    return `<polygon points="${[base[0], base[1], s].map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[base[1], base[2], s].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".55" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + trait(base[0], base[3], true) + trait(base[3], base[2], true) + trait(base[3], s, true) } },
  prisme: { nom: 'le prisme droit', info: '5 faces : 2 triangles + 3 rectangles\n6 sommets · 9 arêtes', dessin: f => {
    // triangle avant a, triangle arrière b ; faces vues : le triangle avant et le rectangle de droite (a1 b1 b2 a2) ;
    // sommet caché : b[0] (arrière en bas à gauche) → 3 arêtes cachées
    const a = [[6, 46], [36, 46], [21, 22]], d = 16, b = a.map(([x, y]) => [x + d, y - d + 4])
    return `<polygon points="${a.map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[1], b[1], b[2], a[2]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".5" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + trait(b[0], a[0], true) + trait(b[0], b[1], true) + trait(b[0], b[2], true) } },
}
const SOURCES = { figures: FIGURES, solides: SOLIDES }

export const titre = c => LOTS_FORMES[c.variante]?.titre ?? 'Les formes'

export function dessin(cfg, W, H) {
  const lot = LOTS_FORMES[cfg.variante] ?? LOTS_FORMES['plan-cycle2']
  const source = SOURCES[lot.type]
  const n = lot.liste.length, gap = 5
  let meilleur = null
  for (let cols = 1; cols <= n; cols++) {
    const rangs = Math.ceil(n / cols)
    const cw = (W - (cols - 1) * gap) / cols, ch = (H - (rangs - 1) * gap) / rangs
    const t = Math.min(cw, ch * 0.78)
    if (!meilleur || t > meilleur.t) meilleur = { cols, cw, ch, t }
  }
  const { cols, cw, ch, t } = meilleur
  const fs = Math.min(cw / 14, ch / 11)
  const cartes = lot.liste.map((id, k) => {
    const f = source[id], fond = ['#cfe3ff', '#ffe3c2', '#d3f0d3', '#ead7f5', '#ffd6e0', '#cdeff2'][k % 6]
    return `<div class="carte" style="width:${cw}mm;height:${ch}mm"><svg width="${t * 0.78}mm" height="${t * 0.78}mm" viewBox="0 0 ${S} ${S}">${f.dessin(fond)}</svg>
      <b style="font-size:${fs * 1.15}mm">${echapper(f.nom)}</b><small style="font-size:${fs * 0.85}mm">${echapper(f.info).replace(/\n/g, '<br>')}</small></div>`
  }).join('')
  const aide = lot.type === 'figures' ? `<p class="legende" style="font-size:${Math.min(fs * 0.7, 5)}mm"><span class="ter">traits rouges</span> : côtés de même longueur · angles droits${
    lot.liste.includes('trapeze') ? ' · <span class="ter">»</span> : côtés parallèles' : ''}</p>`
    : `<p class="legende" style="font-size:${Math.min(fs * 0.7, 5)}mm">Arêtes cachées en pointillés</p>`
  return `${aide}<div class="cartes" style="grid-template-columns:repeat(${cols}, ${cw}mm);gap:${gap}mm">${cartes}</div>`
}

export const css = `
  .cartes { display: grid; }
  .ter { color: #d9480f; font-weight: 700; }
  .carte { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 0.4mm solid #cfd6df; border-radius: 3mm; text-align: center; line-height: 1.2; gap: 1mm; }
  .carte small { color: #555; }`
