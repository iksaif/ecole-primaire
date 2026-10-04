// Affiche des pièces et des billets en euros. CP : euros entiers jusqu'à 100 € ; CE1 : centimes
import { echapper } from '../../utils/impression'
import { txt } from './cadre.js'

const PIECES = [
  { v: '1 c', fond: '#c0714a' }, { v: '2 c', fond: '#c0714a' }, { v: '5 c', fond: '#c0714a' },
  { v: '10 c', fond: '#d8b24a' }, { v: '20 c', fond: '#d8b24a' }, { v: '50 c', fond: '#d8b24a' },
  { v: '1 €', fond: '#d8b24a', bord: '#c9ccd1' }, { v: '2 €', fond: '#c9ccd1', bord: '#d8b24a' },
]
const BILLETS = [
  { v: 5, fond: '#a5aaa9' }, { v: 10, fond: '#e8736c' }, { v: 20, fond: '#6ea8e0' }, { v: 50, fond: '#f0a05a' }, { v: 100, fond: '#8fc58a' }, { v: 200, fond: '#e6cf6a' },
]

export const titre = () => "Les pièces et les billets de l'euro"

export function dessin(cfg, W, H) {
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

export const css = `
  .sect { font-size: 7mm; color: #1d4e9e; margin: 2mm 0 0; }
  .rel { display: grid; grid-template-columns: repeat(2, auto); gap: 1mm 12mm; margin-top: 3mm; }
  .rel b { color: #d9480f; }`
