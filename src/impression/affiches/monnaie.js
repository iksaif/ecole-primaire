// Affiche des pièces et des billets en euros. CP : euros entiers jusqu'à 100 € ; CE1 : centimes
import { echapper, largeurTexte } from '../../utils/impression'
import { txt } from './cadre.js'

// d : diamètre réel (mm) ; w × h : taille réelle des billets (mm, série Europe). Les proportions sont vraies entre pièces
// et entre billets ; les pièces sont agrandies (LOUPE) pour rester lisibles, mais restent plus petites que les billets.
const PIECES = [
  { v: '1 c', d: 16.25, fond: '#c0714a' }, { v: '2 c', d: 18.75, fond: '#c0714a' }, { v: '5 c', d: 21.25, fond: '#c0714a' },
  { v: '10 c', d: 19.75, fond: '#d8b24a' }, { v: '20 c', d: 22.25, fond: '#d8b24a' }, { v: '50 c', d: 24.25, fond: '#d8b24a' },
  { v: '1 €', d: 23.25, fond: '#d8b24a', bord: '#c9ccd1' }, { v: '2 €', d: 25.75, fond: '#c9ccd1', bord: '#d8b24a' },
]
const BILLETS = [
  { v: 5, w: 120, h: 62, fond: '#a5aaa9' }, { v: 10, w: 127, h: 67, fond: '#e8736c' }, { v: 20, w: 133, h: 72, fond: '#6ea8e0' },
  { v: 50, w: 140, h: 77, fond: '#f0a05a' }, { v: 100, w: 147, h: 77, fond: '#8fc58a' }, { v: 200, w: 153, h: 77, fond: '#e6cf6a' },
]
const ECART = 4         // mm entre deux pièces ou deux billets
const LOUPE = 2         // agrandissement des pièces par rapport aux billets (2 € : 3/4 de la hauteur du billet de 5 €)
const H_SECTION = 11    // titre « Les pièces » / « Les billets » (7 mm, interligne compris) et sa marge (cf. .sect)

export const titre = () => "Les pièces et les billets de l'euro"

// polices = { script } : les montants sont réduits s'ils ne tiennent pas dans la pièce (police plus large)
export function dessin(cfg, W, H, polices) {
  const complet = cfg.variante !== 'euros'
  const pieces = complet ? PIECES : PIECES.filter(p => p.v.endsWith('€'))
  const billets = complet ? BILLETS : BILLETS.filter(b => b.v <= 100)
  // billets sur deux rangées (les plus petits en haut), pour qu'ils restent assez grands
  const coupe = Math.ceil(billets.length / 2)
  const rangees = [billets.slice(0, coupe), billets.slice(coupe)]
  const relations = [
    ['2 pièces de 1 €', '= 1 pièce de 2 €'], ['5 pièces de 2 €', '= 10 €'], ['10 pièces de 1 €', '= 1 billet de 10 €'], ['2 billets de 10 €', '= 1 billet de 20 €'],
    ...(complet ? [['100 centimes', '= 1 €'], ['10 pièces de 10 c', '= 1 €'], ['2 pièces de 50 c', '= 1 €']] : []),
  ]
  // équivalences sur 2 colonnes : chaque ligne doit tenir dans sa colonne
  const plusLongue = polices?.script ? Math.max(...relations.map(([a, b]) => largeurTexte(`${a} ${b}`, polices.script, true))) : 0
  const fs = Math.min(H * 0.035, 8, plusLongue ? (W - 16) / 2 / plusLongue : Infinity)
  // hauteur des équivalences et de la note du bas (« c = centime »)
  const hBas = Math.ceil(relations.length / 2) * (fs * 1.4 + 1) + 6 + (complet ? 12 : 0)
  // échelle commune : la plus grande qui tient en largeur (rangée la plus large) et en hauteur
  const largeur = l => l.reduce((t, x) => t + x.w, 0) + (l.length - 1) * ECART
  const kLargeur = Math.min((W - 10) / largeur(rangees[0]), (W - 10) / largeur(rangees[1]),
    (W - 10 - (pieces.length - 1) * ECART) / pieces.reduce((t, p) => t + p.d * LOUPE, 0))
  const hautMax = l => Math.max(...l.map(b => b.h))
  const kHauteur = (H - 2 * H_SECTION - hBas - 3 * ECART) / (Math.max(...pieces.map(p => p.d)) * LOUPE + hautMax(rangees[0]) + hautMax(rangees[1]))
  const k = Math.min(kLargeur, kHauteur)

  const kp = k * LOUPE
  const hPieces = Math.max(...pieces.map(p => p.d)) * kp + 2
  let x = (W - (pieces.reduce((t, p) => t + p.d, 0) * kp + (pieces.length - 1) * ECART)) / 2
  let s = ''
  for (const p of pieces) {
    const r = p.d * kp / 2, cx = x + r, cy = hPieces / 2
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.bord ?? p.fond}" stroke="#555" stroke-width="0.5"/><circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="${p.fond}" stroke="#555" stroke-width="0.3"/>`
    // le montant tient dans le cœur de la pièce
    const taille = polices?.script ? Math.min(r * 0.6, r * 1.2 / largeurTexte(p.v, polices.script, true)) : r * 0.6
    s += txt(cx, cy, p.v, taille, { gras: true })
    x += p.d * kp + ECART
  }
  const pieceSvg = `<svg width="${W}mm" height="${hPieces}mm" viewBox="0 0 ${W} ${hPieces}">${s}</svg>`

  s = ''
  let y = 1
  for (const rangee of rangees) {
    let bx = (W - largeur(rangee) * k) / 2
    for (const b of rangee) {
      const bw = b.w * k, bh = b.h * k, by = y + (hautMax(rangee) - b.h) * k / 2
      s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2" fill="${b.fond}" stroke="#555" stroke-width="0.5"/><rect x="${bx + 2}" y="${by + 2}" width="${bw - 4}" height="${bh - 4}" rx="1.5" fill="none" stroke="white" stroke-width="0.6"/>`
      const taille = polices?.script ? Math.min(bh * 0.4, bw * 0.7 / largeurTexte(`${b.v} €`, polices.script, true)) : bh * 0.4
      s += txt(bx + bw / 2, by + bh / 2, `${b.v} €`, taille, { gras: true })
      bx += bw + ECART
    }
    y += hautMax(rangee) * k + ECART
  }
  const hBillets = y - ECART + 1
  const billetSvg = `<svg width="${W}mm" height="${hBillets}mm" viewBox="0 0 ${W} ${hBillets}">${s}</svg>`
  return `<h2 class="sect">Les pièces</h2>${pieceSvg}<h2 class="sect">Les billets</h2>${billetSvg}
    <div class="rel" style="font-size:${fs}mm">${relations.map(([a, b]) => `<p>${echapper(a)} <b>${echapper(b)}</b></p>`).join('')}</div>${complet ? '<p class="legende" style="margin-top:4mm;font-size:5mm">c = centime</p>' : ''}`
}

export const css = `
  .sect { font-size: 7mm; line-height: 1.3; color: #1d4e9e; margin: 2mm 0 0; flex: none; }
  .rel { display: grid; grid-template-columns: repeat(2, auto); gap: 1mm 12mm; margin-top: 3mm; flex: none; }
  .rel p { margin: 0; line-height: 1.4; }
  /* sous le titre, le contenu est centré dans la hauteur qui reste (portrait) */
  .sect:first-of-type { margin-top: auto; }
  .contenu > :last-child { margin-bottom: auto; }
  .rel b { color: #d9480f; }`
