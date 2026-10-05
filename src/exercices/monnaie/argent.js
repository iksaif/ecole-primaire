// La monnaie — dessins SVG des pièces et des billets (purs : lisibles par node). Valeurs en centimes.
//   svgArgent(v, echelle, libelle)   pièce (v < 500) ou billet ; libelle : nom lu par les lecteurs d'écran

// Diamètres réels en mm (pour des tailles relatives réalistes)
const PIECES = {
  1:   { d: 16.25, metal: 'cuivre', label: '1',  unite: 'c' },
  2:   { d: 18.75, metal: 'cuivre', label: '2',  unite: 'c' },
  5:   { d: 21.25, metal: 'cuivre', label: '5',  unite: 'c' },
  10:  { d: 19.75, metal: 'or',     label: '10', unite: 'c' },
  20:  { d: 22.25, metal: 'or',     label: '20', unite: 'c' },
  50:  { d: 24.25, metal: 'or',     label: '50', unite: 'c' },
  100: { d: 23.25, metal: 'bi1',    label: '1',  unite: '€' },
  200: { d: 25.75, metal: 'bi2',    label: '2',  unite: '€' },
}
// Dimensions réelles en mm, couleurs approximatives
const BILLETS = {
  500:  { w: 120, h: 62, fond: '#b8c2b0', fonce: '#5f6e58' },
  1000: { w: 127, h: 67, fond: '#f0a090', fonce: '#a8402f' },
  2000: { w: 133, h: 72, fond: '#9dbde8', fonce: '#2c5b9a' },
  5000: { w: 140, h: 77, fond: '#f6b46e', fonce: '#a9601a' },
  10000: { w: 147, h: 77, fond: '#9ccf9a', fonce: '#2f7a3b' },
}
const METAUX = {
  cuivre: { fond: '#cd7f4f', bord: '#8f5130' },
  or:     { fond: '#e6c65c', bord: '#a8862a' },
  argent: { fond: '#dcdfe2', bord: '#8e959c' },
}

function svgPiece(v, echelle, libelle) {
  const p = PIECES[v]
  const taille = Math.round(p.d * 2.6 * echelle)
  let disque
  if (p.metal === 'bi1' || p.metal === 'bi2') {
    const ext = p.metal === 'bi1' ? METAUX.or : METAUX.argent
    const int = p.metal === 'bi1' ? METAUX.argent : METAUX.or
    disque = `<circle cx="50" cy="50" r="47" fill="${ext.fond}" stroke="${ext.bord}" stroke-width="3"/>`
           + `<circle cx="50" cy="50" r="31" fill="${int.fond}" stroke="${int.bord}" stroke-width="2"/>`
  } else {
    const m = METAUX[p.metal]
    disque = `<circle cx="50" cy="50" r="47" fill="${m.fond}" stroke="${m.bord}" stroke-width="3"/>`
           + `<circle cx="50" cy="50" r="39" fill="none" stroke="${m.bord}" stroke-width="1.5" opacity=".6"/>`
  }
  const fs = p.label.length > 1 ? 30 : 36
  const texte = `<text x="50" y="${50 + fs * 0.36}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" `
              + `font-weight="800" font-size="${fs}" fill="#222">${p.label}<tspan font-size="${Math.round(fs * 0.62)}" dx="2">${p.unite}</tspan></text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 100 100" role="img" aria-label="${libelle}">${disque}${texte}</svg>`
}

function svgBillet(v, echelle, libelle) {
  const b = BILLETS[v]
  const W = Math.round(b.w * 0.9 * echelle), H = Math.round(b.h * 0.9 * echelle)
  const n = String(v / 100)
  const { w, h } = b
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${libelle}">`
    + `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="4" fill="${b.fond}" stroke="${b.fonce}" stroke-width="2"/>`
    + `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="2" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/>`
    + `<path d="M ${w * 0.58} ${h - 6} V ${h * 0.45} A ${w * 0.12} ${w * 0.12} 0 0 1 ${w * 0.82} ${h * 0.45} V ${h - 6} Z" fill="#fff" opacity=".4"/>`
    + `<text x="11" y="${h * 0.55}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${h * 0.44}" fill="${b.fonce}">${n}<tspan font-size="${h * 0.26}" dx="3">€</tspan></text>`
    + `<text x="12" y="${h * 0.82}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${h * 0.13}" fill="#222" letter-spacing="2">EURO</text>`
    + `<text x="${w - 9}" y="${h * 0.27}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${h * 0.18}" fill="#222">${n}</text>`
    + `</svg>`
}

export function svgArgent(v, echelle = 1, libelle = '') {
  return v >= 500 ? svgBillet(v, echelle, libelle) : svgPiece(v, echelle, libelle)
}
