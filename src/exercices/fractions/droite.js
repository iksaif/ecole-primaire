// @ts-check
// Les fractions — droite graduée en fractions d'unité (CE2) : 0, 1, 2… aux graduations d'unité, d parts par unité.
// Dessin partagé : src/impression/dessins/droite.js ; la vue y ajoute la flèche posée par l'élève et les zones de touche.
import { positionsGraduations, svgDroite } from '../../impression/dessins/droite.js'

export const COULEUR_FLECHE = '#e74c3c'

/** @param {number} unites longueur de la droite en unités @param {number} d parts par unité */
export function droiteFraction(unites, d) {
  const x0 = 40, L = 520, y = 60
  const xs = positionsGraduations(x0, L, unites * d)
  const ticks = xs.map((x, i) => ({ i, x, unite: i % d === 0, label: i % d === 0 ? String(i / d) : null }))
  return { unites, d, ticks, x0, L, y, largeur: x0 * 2 + L }
}

/**
 * SVG de la droite.
 * @param {ReturnType<typeof droiteFraction>} dr
 * @param {object} [o]
 * @param {number | null} [o.fleche] graduation montrée par une flèche
 * @param {string} [o.couleur] couleur de cette flèche
 * @param {number | null} [o.juste] graduation juste, marquée d'une pointe verte (correction)
 * @param {boolean} [o.zones] zones de touche transparentes (data-i) autour des graduations à placer (vue interactive)
 */
export function svgDroiteFraction(dr, { fleche = null, couleur = COULEUR_FLECHE, juste = null, zones = false } = {}) {
  const fleches = []
  if (fleche !== null) fleches.push({ x: dr.ticks[fleche].x, couleur })
  if (juste !== null) fleches.push({ x: dr.ticks[juste].x, couleur: '#5cb85c', tige: false })
  const largeurZone = dr.L / (dr.ticks.length - 1)
  return svgDroite({
    x0: dr.x0, L: dr.L, y: dr.y, depasse: 15, largeur: dr.largeur, hauteur: 110, decalageEtiquette: 40,
    graduations: dr.ticks.map(t => ({ x: t.x, h: t.unite ? 16 : 9, epaisseur: t.unite ? 3 : 2, label: t.label })),
    fleches,
    // zones de touche larges autour de chaque graduation (sauf 0, 1, 2 déjà écrits)
    zones: zones ? dr.ticks.filter(t => !t.unite).map(t => ({ i: t.i, x: t.x - largeurZone / 2, largeur: largeurZone })) : [],
    classe: zones ? 'forme-svg' : '',
  })
}
