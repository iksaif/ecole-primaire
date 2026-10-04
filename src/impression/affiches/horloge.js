// Affiche de l'horloge. CP : heures entières ; CE1 : demies et quarts, heures de l'après-midi ; CE2 : minutes
import { echapper } from '../../utils/impression'
import { enLettresFr } from '../../utils/nombres.js'
import { txt } from './cadre.js'

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

export const titre = c => ({ heures: "L'horloge : les heures", quarts: "L'horloge : quarts et demies" }[c.variante] ?? "L'horloge : les heures et les minutes")

const LEGENDES = {
  heures: [['La petite aiguille', 'indique les heures', '#1d4e9e'], ['La grande aiguille', 'est sur le 12 : c\'est une heure pile', '#d9480f'], ['Le matin', '7 h, 8 h… midi (12 h)', '#222'], ['Le soir', '9 h du soir = 21 h', '#222']],
  // CE1 : pas encore les minutes une à une, seulement la grande aiguille sur le 12, le 3, le 6 ou le 9
  quarts: [['La petite aiguille', 'indique les heures', '#1d4e9e'], ['La grande aiguille', 'sur le 12 : l\'heure pile', '#d9480f'], ['Sur le 3', '… et quart', '#222'], ['Sur le 6', '… et demie', '#222'], ['Sur le 9', '… moins le quart', '#222'],
    ['Chiffres en vert', 'après-midi : 13 h = 1 h', '#2b8a3e']],
  minutes: [['La petite aiguille', 'indique les heures', '#1d4e9e'], ['La grande aiguille', 'indique les minutes', '#d9480f'], ['Une heure', '60 minutes', '#222'], ['Un quart d\'heure', '15 minutes', '#222'], ['Une demi-heure', '30 minutes', '#222'],
    ['Chiffres en vert', 'après-midi : 13 h = 1 h', '#2b8a3e']],
}

export function dessin(cfg, W, H) {
  const variante = LEGENDES[cfg.variante] ? cfg.variante : 'minutes'
  const minutes = variante === 'minutes', pile = variante === 'heures'
  const exemples = pile
    ? [{ h: 7, m: 0, t: 'Je me lève' }, { h: 8, m: 0, t: "Je vais à l'école" }, { h: 12, m: 0, t: 'Je mange' }, { h: 9, m: 0, t: 'Je me couche (le soir)' }]
    : [{ h: 7, m: 15 }, { h: 7, m: 30 }, { h: 7, m: 45 }, { h: 8, m: 0 }]
  const grand = Math.min(H * 0.36, W * 0.3)
  const ligne2 = H - grand * 2 - 6
  const rp = Math.min(ligne2 * 0.32, W / 10)
  const gauche = `<svg width="${grand * 2}mm" height="${grand * 2}mm" viewBox="0 0 ${grand * 2} ${grand * 2}">${horlogeSvg(grand, grand, grand * 0.84, { h: 10, m: variante === 'quarts' ? 15 : 10, minutes, heures24: !pile })}</svg>`
  const droite = `<div class="leg" style="font-size:${Math.min(grand * 0.11, 8)}mm">${LEGENDES[variante].map(([a, b, c]) => `<p><b style="color:${c}">${echapper(a)}</b><br>${echapper(b)}</p>`).join('')}</div>`
  const minis = exemples.map(e => `<figure style="width:${W / 4.4}mm"><svg width="${rp * 2.2}mm" height="${rp * 2.2}mm" viewBox="0 0 ${rp * 2.2} ${rp * 2.2}">${horlogeSvg(rp * 1.1, rp * 1.1, rp, { h: e.h, m: e.m })}</svg>
    <figcaption style="font-size:${Math.min(rp * 0.28, 6)}mm"><b>${e.h} h${e.m ? ' ' + num2(e.m) : ''}</b> · ${!pile ? `<span>${num2(e.h)}:${num2(e.m)}</span><br>${echapper(heureLettres(e.h, e.m))}` : echapper(e.t)}</figcaption></figure>`).join('')
  return `<div style="display:flex;gap:${W * 0.04}mm;align-items:center;justify-content:center;flex:none;height:${grand * 2}mm">${gauche}${droite}</div>
    <div class="minis" style="height:${ligne2}mm">${minis}</div>`
}

export const css = `
  .leg { display: flex; flex-direction: column; gap: 2.5mm; max-width: 40%; line-height: 1.25; }
  .minis { display: flex; justify-content: space-around; align-items: center; width: 100%; flex: none; }
  .minis figure { display: flex; flex-direction: column; align-items: center; text-align: center; line-height: 1.2; }
  .minis figcaption span { font-family: monospace; color: #2b8a3e; }`
