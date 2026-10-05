// @ts-check
// Droite graduée : dessin SVG pur (chaînes), partagé par Numération (graduations de 10 en 10…, nombre à lire) et
// Fractions (fractions d'unité, graduation à toucher). Ni Vue ni DOM : lisible par node (générateurs, fiches).
// Non partagé avec l'affiche src/impression/affiches/droite.js : l'affiche est une feuille décorée (bandes de couleur,
// nombres en toutes lettres, polices mesurées), elle n'a ni flèche ni graduation à toucher ; seul le calcul des
// positions (`positionsGraduations`) leur serait commun, ce qui ne justifie pas de toucher à l'affiche.
//
//   const xs = positionsGraduations(50, 500, 10)                 // 11 abscisses de 50 à 550
//   svgDroite({ x0: 50, L: 500, y: 70, depasse: 20, largeur: 600, hauteur: 125,
//     graduations: xs.map((x, i) => ({ x, h: 9, epaisseur: 2 })),  // h : demi-hauteur du trait
//     etiquettes: [{ x: 50, texte: '0' }],                         // nombres sous la droite, après les traits
//     fleches: [{ x: 300, couleur: '#e74c3c' }] })                 // flèche rouge au-dessus d'une graduation

/**
 * Abscisses de `n + 1` graduations régulièrement réparties de x0 à x0 + L (arrondies au centième).
 * @param {number} x0
 * @param {number} L
 * @param {number} n nombre d'intervalles
 */
export const positionsGraduations = (x0, L, n) => Array.from({ length: n + 1 }, (_, i) => Math.round((x0 + i * (L / n)) * 100) / 100)

/**
 * @typedef {object} Graduation
 * @property {number} x
 * @property {number} h demi-hauteur du trait (de part et d'autre de la droite)
 * @property {number} epaisseur
 * @property {string | null} [label] nombre écrit sous la graduation, juste après son trait
 */

/**
 * Flèche (tige + pointe) au-dessus d'une graduation.
 * @param {number} x
 * @param {number} y ordonnée de la droite
 * @param {string} couleur
 * @param {boolean} [tige]
 */
export const fleche = (x, y, couleur, tige = true) =>
  (tige ? `<line x1="${x}" y1="${y - 48}" x2="${x}" y2="${y - 18}" stroke="${couleur}" stroke-width="4"/>` : '')
  + `<polygon points="${x - 9},${y - 22} ${x + 9},${y - 22} ${x},${y - 10}" fill="${couleur}"/>`

/**
 * Le dessin de la droite.
 * @param {object} o
 * @param {number} o.x0 abscisse de la première graduation
 * @param {number} o.L longueur graduée
 * @param {number} o.y ordonnée de la droite
 * @param {number} o.depasse la droite dépasse de chaque côté de cette longueur
 * @param {number} o.largeur
 * @param {number} o.hauteur
 * @param {Graduation[]} o.graduations
 * @param {{ x: number, texte: string }[]} [o.etiquettes] nombres sous la droite, écrits après tous les traits
 * @param {{ x: number, couleur: string, tige?: boolean }[]} [o.fleches]
 * @param {number} [o.decalageEtiquette] distance entre la droite et le bas des nombres
 * @param {{ x: number, largeur: number, i: number }[]} [o.zones] zones de touche transparentes (data-i), pour une vue interactive
 * @param {string} [o.classe]
 */
export function svgDroite({ x0, L, y, depasse, largeur, hauteur, graduations, etiquettes = [], fleches = [], decalageEtiquette = 40, zones = [], classe = '' }) {
  const nombre = (x, texte) => `<text x="${x}" y="${y + decalageEtiquette}" font-size="26" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${texte}</text>`
  let s = `<line x1="${x0 - depasse}" y1="${y}" x2="${x0 + L + depasse}" y2="${y}" stroke="#2c3e50" stroke-width="3"/>`
  for (const g of graduations) {
    s += `<line x1="${g.x}" y1="${y - g.h}" x2="${g.x}" y2="${y + g.h}" stroke="#2c3e50" stroke-width="${g.epaisseur}"/>`
    if (g.label != null) s += nombre(g.x, g.label)
  }
  for (const e of etiquettes) s += nombre(e.x, e.texte)
  for (const a of fleches) s += fleche(a.x, y, a.couleur, a.tige !== false)
  for (const z of zones) s += `<rect data-i="${z.i}" x="${z.x}" y="${y - 55}" width="${z.largeur}" height="80" fill="transparent" style="cursor:pointer"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}"${classe ? ` class="${classe}"` : ''} style="max-width:100%;height:auto;">${s}</svg>`
}
