// Affiches en lien avec les programmes officiels (cycles 1 à 3) — partagées par l'app et le build des PDF :
// droite numérique, tableau de numération, horloge, pièces et billets, conjugaison, figures et solides.
// Sources : BO n° 41 du 31 octobre 2024 (cycles 1 et 2) et BO n° 16 du 17 avril 2025 (cycle 3).
// Les textes sont en français ; une version bretonne attend un relecteur brittophone (voir README).
import { dimensionsPage, documentImpression, echapper } from '../utils/impression'
import { enLettresFr } from '../utils/nombres.js'
import { VERBES, TITRES_TEMPS, TEMPS_CYCLE, TEMPS_CM2, formesTemps } from '../data/conjugaison.js'
export { VERBES, TEMPS_CM2, conjuguer } from '../data/conjugaison.js'

const MARGE = 10
const COULEURS = ['#1d4e9e', '#d9480f', '#2b8a3e', '#862e9c', '#c2255c', '#0b7285']
const cm = n => (n >= 1000 ? n.toLocaleString('fr-FR') : String(n))
const attr = o => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ')
const txt = (x, y, s, taille, o = {}) => `<text x="${x}" y="${y}" font-size="${taille}" text-anchor="${o.ancre ?? 'middle'}" `
  + `dominant-baseline="${o.base ?? 'central'}" ${o.gras ? 'font-weight="700"' : ''} fill="${o.couleur ?? '#222'}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>${echapper(s)}</text>`

// ── Droite numérique ─────────────────────────────────────────────────────────
// CP : nombres jusqu'à 100 ; CE1 : jusqu'à 1 000 (programme du cycle 2)
function droite(cfg, W, H) {
  const max = +cfg.variante || 100
  const pas = max === 1000 ? 10 : 1
  const grosPas = max === 20 ? 10 : max === 100 ? 10 : 100
  const moyenPas = max === 20 ? 5 : max === 100 ? 5 : 50
  // la légende est un paragraphe sous le dessin (retour à la ligne automatique)
  const hAide = 14 * Math.min(H / 130, 1.7)
  H -= hAide
  const u = Math.min(H / 130, 1.7), x0 = 12, x1 = W - 12, y = H * 0.38
  const n = max / pas
  const px = v => x0 + (v / max) * (x1 - x0)
  let s = ''
  // bandes alternées : une par dizaine (0–100, 0–20) ou par centaine (0–1 000)
  for (let b = 0; b * grosPas < max; b++) {
    s += `<rect x="${px(b * grosPas)}" y="${y - 30 * u}" width="${px(grosPas) - x0}" height="${H * 0.66}" fill="${b % 2 ? '#eef3fb' : '#fff8ef'}"/>`
  }
  s += `<line x1="${x0 - 6}" y1="${y}" x2="${x1 + 6}" y2="${y}" stroke="#222" stroke-width="${1.1 * u}" marker-end="url(#fleche)"/>`
  // écart entre deux nombres écrits : de 0 à 20, chaque trait a son nombre (2 chiffres doivent tenir)
  const ecart = px(max === 20 ? 1 : grosPas) - x0
  const taillePolice = Math.min(7.5 * u, ecart * 0.85)
  for (let i = 0; i <= n; i++) {
    const v = i * pas
    const gros = v % grosPas === 0, moyen = v % moyenPas === 0
    const h = (gros ? 9 : moyen ? 6 : 3.5) * u
    const couleur = COULEURS[Math.floor(v / grosPas) % COULEURS.length]
    s += `<line x1="${px(v)}" y1="${y - h}" x2="${px(v)}" y2="${y + h}" stroke="${gros ? couleur : '#555'}" stroke-width="${gros ? 0.9 : 0.4}"/>`
    if (max === 20 || gros) s += txt(px(v), y - h - 6 * u, cm(v), gros ? Math.min(taillePolice * 1.1, ecart * 0.95) : taillePolice, { gras: gros, couleur: gros ? couleur : '#222' })
    // le nom du nombre, écrit à la verticale sous la graduation
    if (max === 20 || gros) s += txt(px(v), y + h + 4 * u, enLettresFr(v), (max === 20 ? 5 : 5.2) * u * 1.15, { ancre: 'start', rot: 90, couleur: '#555' })
  }
  const aide = {
    20: 'Je saute de 1 en 1 : chaque trait est un nombre de plus. Le trait long est la dizaine (10).',
    100: 'Chaque dizaine est un trait long. Entre deux dizaines, je compte de 1 en 1. Le trait moyen est le milieu (5).',
    1000: 'Chaque centaine est un trait long, chaque dizaine un petit trait. Entre 0 et 1 000, il y a 10 centaines.',
  }[max]
  return `<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}"><defs><marker id="fleche" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#222"/></marker></defs>${s}</svg>`
    + `<p class="aide-droite" style="height:${hAide}mm;font-size:${5.2 * u}mm">${echapper(aide)}</p>`
}

// ── Tableau de numération ────────────────────────────────────────────────────
// CE1 : jusqu'à 1 000 ; CM1 : jusqu'à six chiffres + décimaux ; CM2 : jusqu'à neuf chiffres (programmes 2024-2025)
const RANGS = ['centaines', 'dizaines', 'unités']
const NUMERATION = {
  ce1: { classes: [{ nom: 'mille', rangs: ['mille'] }, { nom: 'unités simples', rangs: RANGS }], decimales: false,
    exemples: [['207'], ['1000']], valeurs: ['1 000', '100', '10', '1'], note: '10 unités = 1 dizaine · 10 dizaines = 1 centaine · 10 centaines = 1 mille' },
  cm1: { classes: [{ nom: 'classe des milliers', rangs: RANGS }, { nom: 'classe des unités simples', rangs: RANGS }], decimales: true,
    exemples: [['407305'], ['52,36']], valeurs: ['100 000', '10 000', '1 000', '100', '10', '1'], note: 'Chaque rang vaut 10 fois le rang de droite et 10 fois moins que le rang de gauche.' },
  cm2: { classes: [{ nom: 'classe des millions', rangs: RANGS }, { nom: 'classe des milliers', rangs: RANGS }, { nom: 'classe des unités simples', rangs: RANGS }], decimales: true,
    exemples: [['125407038'], ['3406,275']], valeurs: ['100 000 000', '10 000 000', '1 000 000', '100 000', '10 000', '1 000', '100', '10', '1'], note: 'Chaque rang vaut 10 fois le rang de droite et 10 fois moins que le rang de gauche.' },
}
const DECIMALES = ['dixièmes', 'centièmes', 'millièmes']
const VAL_DEC = ['0,1', '0,01', '0,001']

function numeration(cfg, W, H) {
  const def = NUMERATION[cfg.variante] ?? NUMERATION.cm1
  const colEntieres = def.classes.flatMap(c => c.rangs)
  const nbCol = colEntieres.length + (def.decimales ? 1 + DECIMALES.length : 0)
  const wCol = Math.min(40, W / (nbCol + 0.2))
  const fs = Math.min(wCol * 0.4, 16)
  const hLigne = Math.min(28, H / 9)
  const couleurRang = i => COULEURS[Math.floor(i / 3) % COULEURS.length]
  // une ligne de cellules : chiffres alignés à droite des colonnes entières ; la virgule dans sa colonne
  const ligneNombre = nombre => {
    const [ent, dec = ''] = nombre.split(',')
    const chiffres = ent.padStart(colEntieres.length, ' ').split('')
    const cases = chiffres.map((c, i) => `<td style="color:${couleurRang(i)}">${c.trim()}</td>`)
    if (def.decimales) {
      cases.push(`<td class="virg">${dec ? ',' : ''}</td>`)
      DECIMALES.forEach((_, i) => cases.push(`<td style="color:${COULEURS[(i + 3) % COULEURS.length]}">${dec[i] ?? ''}</td>`))
    }
    return cases.join('')
  }
  const entete1 = def.classes.map(c => `<th colspan="${c.rangs.length}" class="classe">${echapper(c.nom)}</th>`).join('')
    + (def.decimales ? `<th colspan="${1 + DECIMALES.length}" class="classe dec">partie décimale</th>` : '')
  const entete2 = colEntieres.map((r, i) => `<th style="background:${couleurRang(i)}">${r}</th>`).join('')
    + (def.decimales ? `<th class="virg"></th>${DECIMALES.map((d, i) => `<th style="background:${COULEURS[(i + 3) % COULEURS.length]}">${d}</th>`).join('')}` : '')
  const valeurs = def.valeurs.map((v, i) => `<td style="color:${couleurRang(i)}">${v}</td>`).join('')
    + (def.decimales ? `<td class="virg"></td>${VAL_DEC.map(v => `<td>${v}</td>`).join('')}` : '')
  const lecture = nb => {
    const [ent, dec] = nb.split(',')
    if (dec) return `${cm(+ent)} unités et ${+dec} ${DECIMALES[dec.length - 1]}`
    const n = +ent
    if (n <= 999999) return `${cm(n)} se lit « ${enLettresFr(n)} »`
    return `${cm(n)} = ${cm(Math.floor(n / 1e6))} millions + ${cm(Math.floor(n / 1000) % 1000)} milliers + ${cm(n % 1000)} unités`
  }
  const lignesEx = def.exemples.map(([nb]) => `<tr class="ex">${ligneNombre(nb)}</tr><tr class="lect"><td colspan="${nbCol}">${echapper(lecture(nb))}</td></tr>`).join('')
  const html = `<table class="num" style="font-size:${fs}mm;width:${wCol * nbCol}mm">
    <tr>${entete1}</tr><tr class="rangs">${entete2}</tr>
    <tr class="val" style="height:${hLigne * 0.7}mm">${valeurs}</tr>
    ${lignesEx}
  </table>
  <p class="note" style="font-size:${fs * 0.7}mm">${echapper(def.note)}</p>`
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1">${html}</div>`
}

// ── Horloge ──────────────────────────────────────────────────────────────────
function horlogeSvg(cx, cy, r, { h = 3, m = 0, minutes = false, heures24 = false } = {}) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="#1d4e9e" stroke-width="${r * 0.045}"/>`
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180, grand = i % 5 === 0
    const r1 = r * (grand ? 0.9 : 0.94)
    s += `<line x1="${cx + Math.cos(a) * r1}" y1="${cy + Math.sin(a) * r1}" x2="${cx + Math.cos(a) * r * 0.97}" y2="${cy + Math.sin(a) * r * 0.97}" stroke="#555" stroke-width="${grand ? r * 0.025 : r * 0.012}"/>`
  }
  const aiguille = (angle, longueur, ep, couleur) => {
    const a = (angle - 90) * Math.PI / 180
    return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * r * longueur}" y2="${cy + Math.sin(a) * r * longueur}" stroke="${couleur}" stroke-width="${r * ep}" stroke-linecap="round"/>`
  }
  // les aiguilles d'abord, les nombres par-dessus avec un liseré blanc : une aiguille ne cache jamais un nombre
  s += aiguille(((h % 12) + m / 60) * 30, 0.5, 0.06, '#1d4e9e') + aiguille(m * 6, 0.78, 0.035, '#d9480f')
  let nombres = ''
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180
    nombres += txt(cx + Math.cos(a) * r * (minutes ? 0.68 : 0.76), cy + Math.sin(a) * r * (minutes ? 0.68 : 0.76), String(i), r * (minutes ? 0.2 : 0.22), { gras: true, couleur: '#1d4e9e' })
    if (minutes) nombres += txt(cx + Math.cos(a) * r * 1.1, cy + Math.sin(a) * r * 1.1, String(i * 5 === 60 ? 60 : i * 5), r * 0.1, { couleur: '#d9480f', gras: true })
    if (heures24) nombres += txt(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.45, String(i + 12 === 24 ? 24 : i + 12), r * 0.1, { couleur: '#2b8a3e' })
  }
  s += `<g stroke="white" stroke-width="${r * 0.025}" stroke-linejoin="round" paint-order="stroke">${nombres}</g>`
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.045}" fill="#222"/>`
  return s
}
const num2 = n => String(n).padStart(2, '0')
const HEURES_EN_LETTRES = ['minuit', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'midi']
const heureLettres = (h, m) => {
  const nom = hh => (hh % 12 === 0 ? (hh === 0 || hh === 24 ? 'minuit' : 'midi') : HEURES_EN_LETTRES[hh % 12]) + (hh % 12 === 1 ? ' heure' : hh % 12 === 0 ? '' : ' heures')
  if (m === 0) return nom(h)
  if (m === 15) return `${nom(h)} et quart`
  if (m === 30) return `${nom(h)} et demie`
  if (m === 45) return `${nom(h + 1)} moins le quart`
  return `${nom(h)} ${enLettresFr(m)}`
}
function horloge(cfg, W, H) {
  const minutes = cfg.variante !== 'heures'
  const exemples = minutes
    ? [{ h: 7, m: 15 }, { h: 7, m: 30 }, { h: 7, m: 45 }, { h: 8, m: 0 }]
    : [{ h: 7, m: 0, t: 'Je me lève' }, { h: 8, m: 0, t: "Je vais à l'école" }, { h: 12, m: 0, t: 'Je mange' }, { h: 9, m: 0, t: 'Je me couche (le soir)' }]
  const grand = Math.min(H * 0.36, W * 0.3)
  const ligne2 = H - grand * 2 - 6
  const rp = Math.min(ligne2 * 0.32, W / 10)
  const gauche = `<svg width="${grand * 2}mm" height="${grand * 2}mm" viewBox="0 0 ${grand * 2} ${grand * 2}">${horlogeSvg(grand, grand, grand * 0.84, { h: 10, m: 10, minutes, heures24: minutes })}</svg>`
  const legende = minutes
    ? [['La petite aiguille', 'indique les heures', '#1d4e9e'], ['La grande aiguille', 'indique les minutes', '#d9480f'], ['Une heure', '60 minutes', '#222'], ['Un quart d\'heure', '15 minutes', '#222'], ['Une demi-heure', '30 minutes', '#222'],
      ['Chiffres en vert', 'après-midi : 13 h = 1 h', '#2b8a3e']]
    : [['La petite aiguille', 'indique les heures', '#1d4e9e'], ['La grande aiguille', 'est sur le 12 : c\'est une heure pile', '#d9480f'], ['Le matin', '7 h, 8 h… midi (12 h)', '#222'], ['Le soir', '9 h du soir = 21 h', '#222']]
  const droite = `<div class="leg" style="font-size:${Math.min(grand * 0.11, 8)}mm">${legende.map(([a, b, c]) => `<p><b style="color:${c}">${echapper(a)}</b><br>${echapper(b)}</p>`).join('')}</div>`
  const minis = exemples.map(e => `<figure style="width:${W / 4.4}mm"><svg width="${rp * 2.2}mm" height="${rp * 2.2}mm" viewBox="0 0 ${rp * 2.2} ${rp * 2.2}">${horlogeSvg(rp * 1.1, rp * 1.1, rp, { h: e.h, m: e.m })}</svg>
    <figcaption style="font-size:${Math.min(rp * 0.28, 6)}mm"><b>${e.h} h${e.m ? ' ' + num2(e.m) : ''}</b> · ${minutes ? `<span>${num2(e.h)}:${num2(e.m)}</span><br>${echapper(heureLettres(e.h, e.m))}` : echapper(e.t)}</figcaption></figure>`).join('')
  return `<div style="display:flex;gap:${W * 0.04}mm;align-items:center;justify-content:center;flex:none;height:${grand * 2}mm">${gauche}${droite}</div>
    <div class="minis" style="height:${ligne2}mm">${minis}</div>`
}

// ── Pièces et billets en euros ───────────────────────────────────────────────
const PIECES = [
  { v: '1 c', fond: '#c0714a' }, { v: '2 c', fond: '#c0714a' }, { v: '5 c', fond: '#c0714a' },
  { v: '10 c', fond: '#d8b24a' }, { v: '20 c', fond: '#d8b24a' }, { v: '50 c', fond: '#d8b24a' },
  { v: '1 €', fond: '#d8b24a', bord: '#c9ccd1' }, { v: '2 €', fond: '#c9ccd1', bord: '#d8b24a' },
]
const BILLETS = [
  { v: 5, fond: '#a5aaa9' }, { v: 10, fond: '#e8736c' }, { v: 20, fond: '#6ea8e0' }, { v: 50, fond: '#f0a05a' }, { v: 100, fond: '#8fc58a' }, { v: 200, fond: '#e6cf6a' },
]
function monnaie(cfg, W, H) {
  const complet = cfg.variante !== 'euros'
  const pieces = complet ? PIECES : PIECES.filter(p => p.v.endsWith('€'))
  const billets = complet ? BILLETS : BILLETS.filter(b => b.v <= 100)
  const hZone = H * 0.3
  const base = Math.min(hZone * 0.42, (W - 20) / pieces.length / 2.5)
  const rayon = i => base * (complet ? [0.85, 0.95, 1.05, 0.95, 1.05, 1.15, 1.1, 1.2][i] : [1.1, 1.3][i])
  const largTotale = pieces.reduce((t, _, i) => t + rayon(i) * 2.4, 0)
  let x = (W - largTotale) / 2
  let s = ''
  pieces.forEach((p, i) => {
    const r = rayon(i)
    x += r * 1.2
    s += `<circle cx="${x}" cy="${hZone * 0.5}" r="${r}" fill="${p.bord ?? p.fond}" stroke="#555" stroke-width="0.5"/><circle cx="${x}" cy="${hZone * 0.5}" r="${r * 0.68}" fill="${p.fond}" stroke="#555" stroke-width="0.3"/>`
    s += txt(x, hZone * 0.5, p.v, r * 0.6, { gras: true })
    x += r * 1.2
  })
  const pieceSvg = `<svg width="${W}mm" height="${hZone}mm" viewBox="0 0 ${W} ${hZone}">${s}</svg>`
  const bw = Math.min((W - 20) / billets.length - 4, 55), bh = bw * 0.52
  s = ''
  billets.forEach((b, i) => {
    const bx = (W - billets.length * (bw + 4) + 4) / 2 + i * (bw + 4), by = (hZone - bh) / 2
    s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2" fill="${b.fond}" stroke="#555" stroke-width="0.5"/><rect x="${bx + 2}" y="${by + 2}" width="${bw - 4}" height="${bh - 4}" rx="1.5" fill="none" stroke="white" stroke-width="0.6"/>`
    s += txt(bx + bw / 2, by + bh / 2, `${b.v} €`, bh * 0.4, { gras: true })
  })
  const billetSvg = `<svg width="${W}mm" height="${hZone}mm" viewBox="0 0 ${W} ${hZone}">${s}</svg>`
  const fs = Math.min(H * 0.035, 8)
  const relations = [
    ['2 pièces de 1 €', '= 1 pièce de 2 €'], ['5 pièces de 2 €', '= 10 €'], ['10 pièces de 1 €', '= 1 billet de 10 €'], ['2 billets de 10 €', '= 1 billet de 20 €'],
    ...(complet ? [['100 centimes', '= 1 €'], ['10 pièces de 10 c', '= 1 €'], ['2 pièces de 50 c', '= 1 €']] : []),
  ]
  return `<h2 class="sect">Les pièces</h2>${pieceSvg}<h2 class="sect">Les billets</h2>${billetSvg}
    <div class="rel" style="font-size:${fs}mm">${relations.map(([a, b]) => `<p>${echapper(a)} <b>${echapper(b)}</b></p>`).join('')}</div>${complet ? '<p class="legende" style="margin-top:4mm;font-size:5mm">c = centime</p>' : ''}`
}

// ── Conjugaison ──────────────────────────────────────────────────────────────
const ligneHtml = segs => segs.map(([c, t]) => (c ? `<span class="${c}">${echapper(t)}</span>` : echapper(t))).join('')

function conjugaison(cfg, W, H) {
  const v = VERBES[cfg.verbe] ?? VERBES.etre
  const temps = cfg.temps?.length ? cfg.temps : TEMPS_CYCLE
  const cols = temps.length > 2 ? 2 : 1, rangs = Math.ceil(temps.length / cols)
  const gap = 6, wb = (W - (cols - 1) * gap) / cols, hb = (H - 18 - (rangs - 1) * gap) / rangs
  const fs = Math.min(hb / 10.5, wb / 17)
  const blocs = temps.map((t, k) => `<div class="bloc" style="width:${wb}mm;height:${hb}mm;border-color:${COULEURS[k % COULEURS.length]}">
    <div class="bt" style="background:${COULEURS[k % COULEURS.length]};font-size:${fs * 1.15}mm;height:${hb * 0.16}mm">${TITRES_TEMPS[t]}</div>
    <div class="bl" style="font-size:${fs}mm">${formesTemps(cfg.verbe, t).map(l => `<div>${ligneHtml(l)}</div>`).join('')}</div></div>`).join('')
  const legende = `<p class="legende" style="font-size:${Math.min(fs * 0.6, 5)}mm"><span class="rad">radical</span> + <span class="ter">terminaison</span> · <span class="aux">auxiliaire</span> + <span class="pp">participe passé</span> · ${echapper(v.groupe === 'auxiliaire' ? 'verbe auxiliaire' : `verbe du ${v.groupe}`)}</p>`
  return `${legende}<div class="blocs" style="grid-template-columns:repeat(${cols}, ${wb}mm);gap:${gap}mm">${blocs}</div>`
}

// ── Figures planes et solides ────────────────────────────────────────────────
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
const FIGURES = {
  disque: { nom: 'le disque', info: 'Un rond plein.\nLe bord est un cercle.', dessin: f => `<circle cx="30" cy="30" r="24" fill="${f}" stroke="#222" stroke-width="1.2"/><circle cx="30" cy="30" r="1.5" fill="#d9480f"/><line x1="30" y1="30" x2="54" y2="30" stroke="#d9480f" stroke-width="1"/>` },
  carre: { nom: 'le carré', info: '4 côtés égaux\n4 angles droits', dessin: f => { const P = [[10, 10], [50, 10], [50, 50], [10, 50]]; return poly(P, f) + P.map((p, i) => marque(p, P[(i + 1) % 4], 1) + droit(P[(i + 3) % 4], p, P[(i + 1) % 4])).join('') } },
  rectangle: { nom: 'le rectangle', info: '4 angles droits\ncôtés opposés égaux', dessin: f => { const P = [[4, 14], [56, 14], [56, 46], [4, 46]]; return poly(P, f) + P.map((p, i) => droit(P[(i + 3) % 4], p, P[(i + 1) % 4])).join('') + marque(P[0], P[1], 1) + marque(P[2], P[3], 1) + marque(P[1], P[2], 2) + marque(P[3], P[0], 2) } },
  triangle: { nom: 'le triangle', info: '3 côtés\n3 sommets', dessin: f => poly([[8, 50], [52, 50], [24, 8]], f) },
  'triangle-rectangle': { nom: 'le triangle rectangle', info: '1 angle droit', dessin: f => { const P = [[10, 50], [50, 50], [10, 10]]; return poly(P, f) + droit(P[2], P[0], P[1]) } },
  isocele: { nom: 'le triangle isocèle', info: '2 côtés égaux', dessin: f => { const P = [[8, 50], [52, 50], [30, 8]]; return poly(P, f) + marque(P[0], P[2], 2) + marque(P[2], P[1], 2) } },
  equilateral: { nom: 'le triangle équilatéral', info: '3 côtés égaux', dessin: f => { const P = [[8, 49], [52, 49], [30, 11]]; return poly(P, f) + marque(P[0], P[1], 1) + marque(P[1], P[2], 1) + marque(P[2], P[0], 1) } },
  losange: { nom: 'le losange', info: '4 côtés égaux', dessin: f => { const P = [[30, 6], [54, 30], [30, 54], [6, 30]]; return poly(P, f) + P.map((p, i) => marque(p, P[(i + 1) % 4], 1)).join('') } },
  trapeze: { nom: 'le trapèze', info: '2 côtés parallèles\n(les bases)', dessin: f => { const P = [[4, 48], [56, 48], [44, 14], [18, 14]]; return poly(P, f) } },
  pentagone: { nom: 'le pentagone', info: '5 côtés\n5 sommets', dessin: f => poly(Array.from({ length: 5 }, (_, i) => [30 + 25 * Math.cos((i * 72 - 90) * Math.PI / 180), 31 + 25 * Math.sin((i * 72 - 90) * Math.PI / 180)]), f) },
  hexagone: { nom: "l'hexagone", info: '6 côtés\n6 sommets', dessin: f => poly(Array.from({ length: 6 }, (_, i) => [30 + 25 * Math.cos((i * 60) * Math.PI / 180), 30 + 25 * Math.sin((i * 60) * Math.PI / 180)]), f) },
}
const trait = (p, q, pointille) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#222" stroke-width="1.2"${pointille ? ' stroke-dasharray="2.5 2"' : ''}/>`
// solides en perspective cavalière ; arêtes cachées en pointillés (programme du CE2)
const SOLIDES = {
  cube: { nom: 'le cube', info: '6 faces carrées\n8 sommets · 12 arêtes', dessin: f => {
    const a = [[8, 22], [38, 22], [38, 52], [8, 52]], d = 14, b = a.map(([x, y]) => [x + d, y - d])
    return `<polygon points="${[a[0], a[1], a[2], a[3]].map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2"/>`
      + `<polygon points="${[a[0], b[0], b[1], a[1]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".7" stroke="#222" stroke-width="1.2"/>`
      + `<polygon points="${[a[1], b[1], b[2], a[2]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".45" stroke="#222" stroke-width="1.2"/>`
      + trait(a[3], b[3], true) + trait(b[3], b[2], true) + trait(b[3], b[0], true) } },
  pave: { nom: 'le pavé (parallélépipède rectangle)', info: '6 faces rectangulaires\n8 sommets · 12 arêtes', dessin: f => {
    const a = [[4, 24], [42, 24], [42, 50], [4, 50]], d = 14, b = a.map(([x, y]) => [x + d, y - d])
    return `<polygon points="${a.map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2"/>`
      + `<polygon points="${[a[0], b[0], b[1], a[1]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".7" stroke="#222" stroke-width="1.2"/>`
      + `<polygon points="${[a[1], b[1], b[2], a[2]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".45" stroke="#222" stroke-width="1.2"/>`
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
    const a = [[6, 46], [36, 46], [21, 22]], d = 16, b = a.map(([x, y]) => [x + d, y - d + 4])
    return `<polygon points="${a.map(p => p.join(',')).join(' ')}" fill="${f}" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[1], b[1], b[2], a[2]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".5" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + `<polygon points="${[a[2], b[2], b[0], a[0]].map(p => p.join(',')).join(' ')}" fill="${f}" fill-opacity=".75" stroke="#222" stroke-width="1.2" stroke-linejoin="round"/>`
      + trait(b[0], b[1], true) + trait(a[0], b[0], true) + trait(a[1], b[1], true) } },
}
const LOTS_FORMES = {
  'plan-cycle2': { titre: 'Les formes planes', liste: ['disque', 'carre', 'rectangle', 'triangle'], source: FIGURES },
  'plan-cycle3': { titre: 'Les figures planes', liste: ['carre', 'rectangle', 'losange', 'triangle', 'triangle-rectangle', 'isocele', 'equilateral', 'trapeze', 'pentagone', 'hexagone', 'disque'], source: FIGURES },
  'solides-ce2': { titre: 'Les solides', liste: ['cube', 'pave', 'boule', 'cylindre', 'cone', 'pyramide'], source: SOLIDES },
  'solides-cm1': { titre: 'Les solides', liste: ['cube', 'pave', 'prisme', 'pyramide', 'cylindre', 'cone', 'boule'], source: SOLIDES },
}
function formes(cfg, W, H) {
  const lot = LOTS_FORMES[cfg.variante] ?? LOTS_FORMES['plan-cycle2']
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
    const f = lot.source[id], fond = ['#cfe3ff', '#ffe3c2', '#d3f0d3', '#ead7f5', '#ffd6e0', '#cdeff2'][k % 6]
    return `<div class="carte" style="width:${cw}mm;height:${ch}mm"><svg width="${t * 0.78}mm" height="${t * 0.78}mm" viewBox="0 0 ${S} ${S}">${f.dessin(fond)}</svg>
      <b style="font-size:${fs * 1.15}mm">${echapper(f.nom)}</b><small style="font-size:${fs * 0.85}mm">${echapper(f.info).replace(/\n/g, '<br>')}</small></div>`
  }).join('')
  const aide = lot.source === FIGURES ? `<p class="legende" style="font-size:${Math.min(fs * 0.7, 5)}mm"><span class="ter">traits rouges</span> : côtés de même longueur · angles droits</p>`
    : `<p class="legende" style="font-size:${Math.min(fs * 0.7, 5)}mm">Arêtes cachées en pointillés</p>`
  return `${aide}<div class="cartes" style="grid-template-columns:repeat(${cols}, ${cw}mm);gap:${gap}mm">${cartes}</div>`
}

// ── Catalogue des affiches ───────────────────────────────────────────────────
export const AFFICHES_PROGRAMME = [
  { id: 'droite', label: 'Droite numérique', orientation: 'landscape', variantes: [
    { id: '20', label: 'De 0 à 20', niveaux: 'GS · CP' }, { id: '100', label: 'De 0 à 100', niveaux: 'CP' }, { id: '1000', label: 'De 0 à 1 000', niveaux: 'CE1' } ] },
  { id: 'numeration', label: 'Tableau de numération', orientation: 'landscape', variantes: [
    { id: 'ce1', label: "Jusqu'à 1 000", niveaux: 'CE1' }, { id: 'cm1', label: "Jusqu'aux centaines de mille + décimaux", niveaux: 'CM1' },
    { id: 'cm2', label: "Jusqu'aux centaines de millions + décimaux", niveaux: 'CM2' } ] },
  { id: 'horloge', label: "L'horloge", orientation: 'landscape', variantes: [
    { id: 'heures', label: 'Les heures entières', niveaux: 'CP' }, { id: 'minutes', label: 'Les heures et les minutes', niveaux: 'CE1 · CE2' } ] },
  { id: 'monnaie', label: 'Pièces et billets', orientation: 'landscape', variantes: [
    { id: 'euros', label: 'Euros', niveaux: 'CP' }, { id: 'centimes', label: 'Euros et centimes', niveaux: 'CE1 · CE2' } ] },
  { id: 'conjugaison', label: 'Conjugaison', orientation: 'portrait', verbes: true },
  { id: 'formes', label: 'Figures et solides', orientation: 'portrait', variantes: [
    { id: 'plan-cycle2', label: 'Formes planes', niveaux: 'GS · CP · CE1' }, { id: 'plan-cycle3', label: 'Figures planes', niveaux: 'CM1 · CM2' },
    { id: 'solides-ce2', label: 'Solides', niveaux: 'CE2' }, { id: 'solides-cm1', label: 'Solides (avec le prisme)', niveaux: 'CM1 · CM2' } ] },
]
const TITRES = {
  droite: c => `La droite numérique de 0 à ${cm(+c.variante)}`,
  numeration: () => 'Le tableau de numération',
  horloge: c => (c.variante === 'heures' ? "L'horloge : les heures" : "L'horloge : les heures et les minutes"),
  monnaie: () => "Les pièces et les billets de l'euro",
  conjugaison: c => `Conjuguer le verbe ${VERBES[c.verbe]?.inf ?? ''}`,
  formes: c => LOTS_FORMES[c.variante]?.titre ?? 'Les formes',
}
const DESSINS = { droite, numeration, horloge, monnaie, conjugaison, formes }
const ORIENTATION = Object.fromEntries(AFFICHES_PROGRAMME.map(a => [a.id, a.orientation]))

export const DEFAUTS = { affiche: 'droite', variante: '100', verbe: 'etre', temps: null, format: 'A4', orientation: null, titre: '' }

export function normaliserConfig(config = {}) {
  const c = { ...DEFAUTS, ...config }
  if (!DESSINS[c.affiche]) c.affiche = DEFAUTS.affiche
  const def = AFFICHES_PROGRAMME.find(a => a.id === c.affiche)
  if (def.variantes && !def.variantes.some(v => v.id === c.variante)) c.variante = def.variantes[0].id
  if (c.affiche === 'conjugaison' && !VERBES[c.verbe]) c.verbe = 'etre'
  if (c.format !== 'A3') c.format = 'A4'
  c.orientation = c.orientation === 'portrait' || c.orientation === 'landscape' ? c.orientation : ORIENTATION[c.affiche]
  return c
}

// polices = { script } : famille à utiliser (déjà chargée)
export function genererAffichesProgramme(config, polices) {
  const c = normaliserConfig(config)
  const { w, h } = dimensionsPage(c.format, c.orientation)
  const echelle = c.format === 'A3' ? 1.41 : 1
  const marge = MARGE * echelle
  const hTitre = 16 * echelle
  const titre = c.titre || TITRES[c.affiche](c)
  const W = w - 2 * marge, H = h - 2 * marge - hTitre
  const corps = DESSINS[c.affiche](c, W, H)
  const pages = [`<div class="contenu" style="inset:${marge}mm"><h1 style="height:${hTitre}mm;font-size:${hTitre * 0.62}mm">${echapper(titre)}</h1>${corps}</div>`]
  const html = documentImpression({
    titre, format: c.format, orientation: c.orientation, pages,
    css: `body { font-family: '${polices.script}', Arial, sans-serif; }
  .contenu { position: absolute; display: flex; flex-direction: column; align-items: center; }
  h1 { font-weight: 700; text-align: center; line-height: 1; display: flex; align-items: center; flex: none; color: #1d4e9e; }
  svg { display: block; flex: none; } svg text { font-family: inherit; }
  .sect { font-size: 7mm; color: #1d4e9e; margin: 2mm 0 0; }
  .rel { display: grid; grid-template-columns: repeat(2, auto); gap: 1mm 12mm; margin-top: 3mm; }
  .rel b { color: #d9480f; }
  .leg { display: flex; flex-direction: column; gap: 2.5mm; max-width: 40%; line-height: 1.25; }
  .minis { display: flex; justify-content: space-around; align-items: center; width: 100%; flex: none; }
  .minis figure { display: flex; flex-direction: column; align-items: center; text-align: center; line-height: 1.2; }
  .minis figcaption span { font-family: monospace; color: #2b8a3e; }
  table.num { border-collapse: collapse; table-layout: fixed; }
  table.num th, table.num td { border: 0.4mm solid #9aa4b2; text-align: center; padding: 1mm 0; }
  table.num th { color: white; font-weight: 700; font-size: 0.45em; line-height: 1.1; }
  table.num th.classe { background: #f1f3f5; color: #222; border-bottom: 0.4mm solid #222; font-size: 0.6em; }
  table.num th.classe.dec { background: #fff3cd; }
  table.num tr.val td { font-size: 0.42em; color: #555; background: #fafafa; }
  table.num tr.ex td { font-size: 1.6em; font-weight: 700; height: 2.2em; }
  table.num td.virg, table.num th.virg { width: 0.5em; border-left: none; border-right: none; background: transparent; color: #d9480f; }
  table.num tr.lect td { font-size: 0.7em; border: none; color: #555; padding: 1mm 0 3mm; }
  .aide-droite { flex: none; width: 85%; text-align: center; color: #555; line-height: 1.25; display: flex; align-items: center; justify-content: center; }
  .note { margin-top: 5mm; color: #555; text-align: center; }
  .blocs { display: grid; } .cartes { display: grid; }
  .bloc { border: 0.6mm solid; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; background: white; }
  .bt { color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .bl { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; padding-left: 8%; }
  .rad { color: #1d4e9e; } .ter { color: #d9480f; font-weight: 700; } .aux { color: #2b8a3e; font-weight: 700; } .pp { color: #1d4e9e; }
  .legende { text-align: center; color: #555; margin-bottom: 3mm; flex: none; }
  .carte { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 0.4mm solid #cfd6df; border-radius: 3mm; text-align: center; line-height: 1.2; gap: 1mm; }
  .carte small { color: #555; }`,
  })
  return { html, nbPages: pages.length, format: c.format, orientation: c.orientation }
}

// ── Affiches toutes prêtes (PDF générés au build) ────────────────────────────
const VERBES_PROGRAMME_CM2 = Object.keys(VERBES)
// le lien « Personnaliser » ouvre la page de réglage sur cette affiche (et pas sur une autre)
const lienAffiche = c => `/imprimer/affiches?affiche=${c.affiche}${c.variante ? `&variante=${c.variante}` : ''}${c.verbe ? `&verbe=${c.verbe}` : ''}${c.temps ? '&temps=cm2' : ''}`
const entree = (slug, court, titre, description, niveaux, config) => ({
  slug, court, titre, description, niveaux, config,
  categorie: 'programme', type: 'programme', lien: lienAffiche(config), langues: ['fr'],
})
const NIVEAUX_VERBES = { cycle: 'CE1 · CE2 · CM1 · CM2', cm2: 'CM2' }

export const TELECHARGEMENTS_PROGRAMME = [
  ...[['20', 'de-0-a-20', 'GS · CP'], ['100', 'de-0-a-100', 'CP'], ['1000', 'de-0-a-1000', 'CE1']].map(([v, s, niv]) => entree(
    `affiche-droite-numerique-${s}`, `Droite numérique 0–${cm(+v)}`, `Droite numérique de 0 à ${cm(+v)} à imprimer`,
    `Affiche de la droite numérique graduée de 0 à ${cm(+v)}, avec le nom de chaque nombre en lettres. Pour repérer, comparer et ranger les nombres (programme de cycle 2).`,
    niv, { affiche: 'droite', variante: v })),
  ...[['ce1', 'jusqu-a-1000', "Jusqu'à 1 000", 'CE1', "Tableau de numération jusqu'à 1 000 : unités, dizaines, centaines et mille."],
    ['cm1', 'cm1', 'CM1 (6 chiffres, décimaux)', 'CM1', 'Tableau de numération du CM1 : nombres jusqu’à six chiffres (classe des milliers) et partie décimale (dixièmes, centièmes, millièmes).'],
    ['cm2', 'cm2', 'CM2 (9 chiffres, décimaux)', 'CM2', 'Tableau de numération du CM2 : nombres jusqu’à neuf chiffres (classe des millions) et partie décimale.']]
    .map(([v, s, court, niv, d]) => entree(`affiche-tableau-numeration-${s}`, `Numération ${court}`, `Tableau de numération ${court} à imprimer`, d, niv, { affiche: 'numeration', variante: v })),
  entree('affiche-horloge-heures-entieres', 'Horloge : heures', "Affiche de l'horloge : lire les heures entières", "L'horloge à aiguilles pour lire et positionner les heures entières, avec des moments de la journée (programme du CP).", 'CP', { affiche: 'horloge', variante: 'heures' }),
  entree('affiche-horloge-heures-minutes', 'Horloge : minutes', "Affiche de l'horloge : heures, minutes, quart et demie", "L'horloge avec les minutes, « et quart », « et demie » et « moins le quart », et l'affichage numérique 24 h (programme du CE1 au CE2).", 'CE1 · CE2', { affiche: 'horloge', variante: 'minutes' }),
  entree('affiche-monnaie-euros', 'Euros', "Affiche des pièces et des billets de l'euro", "Les pièces de 1 € et 2 € et les billets de 5 à 100 €, avec les échanges usuels (10 pièces de 1 € = 1 billet de 10 €).", 'CP', { affiche: 'monnaie', variante: 'euros' }),
  entree('affiche-monnaie-centimes', 'Euros et centimes', 'Affiche des pièces et billets avec les centimes', "Toutes les pièces (de 1 centime à 2 €) et les billets, avec la relation 1 € = 100 centimes (programme du CE1).", 'CE1 · CE2', { affiche: 'monnaie', variante: 'centimes' }),
  ...VERBES_PROGRAMME_CM2.flatMap(v => [
    entree(`affiche-conjugaison-${v}`, `Conjugaison : ${VERBES[v].inf}`, `Conjugaison du verbe ${VERBES[v].inf} : présent, imparfait, futur, passé composé`,
      `Affiche de conjugaison du verbe ${VERBES[v].inf} au présent, à l'imparfait, au futur et au passé composé de l'indicatif, avec le radical et la terminaison en couleur.`, NIVEAUX_VERBES.cycle, { affiche: 'conjugaison', verbe: v }),
    entree(`affiche-conjugaison-${v}-passe-simple`, `${VERBES[v].inf} : passé simple`, `Conjugaison du verbe ${VERBES[v].inf} : passé simple et plus-que-parfait`,
      `Affiche de conjugaison du verbe ${VERBES[v].inf} au passé simple et au plus-que-parfait de l'indicatif (programme du CM2).`, NIVEAUX_VERBES.cm2, { affiche: 'conjugaison', verbe: v, temps: TEMPS_CM2 }),
  ]),
  entree('affiche-formes-planes-cycle-1-2', 'Formes planes', 'Affiche des formes planes : disque, carré, rectangle, triangle', 'Les quatre formes planes de référence du cycle 2, avec leurs côtés et leurs angles droits.', 'GS · CP · CE1', { affiche: 'formes', variante: 'plan-cycle2' }),
  entree('affiche-figures-planes-cycle-3', 'Figures planes', 'Affiche des figures planes du cycle 3', 'Triangle rectangle, isocèle, équilatéral, losange, trapèze, pentagone, hexagone… avec leurs propriétés (programme du cycle 3).', 'CM1 · CM2', { affiche: 'formes', variante: 'plan-cycle3' }),
  entree('affiche-solides-ce2', 'Solides', 'Affiche des solides : cube, pavé, boule, cylindre, cône, pyramide', 'Les six solides du programme du CE2 avec le nombre et la nature de leurs faces, sommets et arêtes.', 'CE2', { affiche: 'formes', variante: 'solides-ce2' }),
  entree('affiche-solides-cm1', 'Solides et prisme', 'Affiche des solides avec le prisme droit', 'Cube, pavé, prisme droit, pyramide, cylindre, cône et boule (programme du CM1).', 'CM1 · CM2', { affiche: 'formes', variante: 'solides-cm1' }),
]
