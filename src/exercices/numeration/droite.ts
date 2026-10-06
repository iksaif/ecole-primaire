// Droite graduée de Numération : 11 graduations (extrémités notées), flèche sur une graduation. Dessin partagé :
// src/dessins/droite.ts.
import { positionsGraduations, svgDroite } from '../../dessins/droite.ts'

/**
 * @param debut nombre de la première graduation
 * @param pas écart entre deux graduations
 * @param k rang de la graduation montrée par la flèche (1 à 9)
 * @param fmt écriture des nombres
 */
export function svgDroiteNombres(debut: number, pas: number, k: number, fmt: (n: number) => string): string {
  const x0 = 50, ecart = 50
  const xs = positionsGraduations(x0, 10 * ecart, 10)
  return svgDroite({
    x0, L: 10 * ecart, y: 70, depasse: 20, largeur: 600, hauteur: 125, decalageEtiquette: 44,
    graduations: xs.map((x, i) => ({ x, h: i === 0 || i === 10 ? 16 : i === 5 ? 13 : 9, epaisseur: i % 5 === 0 ? 3 : 2 })),
    etiquettes: [{ x: xs[0], texte: fmt(debut) }, { x: xs[10], texte: fmt(debut + 10 * pas) }],
    fleches: [{ x: xs[k], couleur: '#e74c3c' }],
  })
}
