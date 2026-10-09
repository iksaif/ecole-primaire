// Le crayon de « plus long, plus court » en SVG (chaîne), le même dans le jeu (en couleur) et sur la fiche (en traits, à colorier). Pur.
// Un vrai crayon de couleur, au style des emojis du site (contour sombre arrondi, aplats) : la gomme, la bague de métal, le corps à facettes,
// le bois taillé et la mine de la couleur du crayon. La longueur mesurée va du bout de la gomme à la pointe : tous partent du même bord.
import { LARGEUR } from './generateur.ts'
import type { Crayon } from './generateur.ts'

const HAUT = 7, BAS = 27, MILIEU = 17       // le crayon fait 20 unités de haut, dans un cadre de 34
const GOMME = 10, BAGUE = 8, BOIS = 20      // longueurs de la gomme, de la bague et de la partie taillée (le plus court crayon fait 55)
const CONTOUR = '#222'

/** Les couleurs d'un crayon : aplats en couleur pour le jeu, blanc pour la fiche (l'enfant peut le colorier). */
interface Teintes { corps: string, mine: string, gomme: string, bague: string, bois: string, clair: string, fonce: string }

const teintesDe = (c: Crayon, impression: boolean): Teintes => (impression
  ? { corps: '#fff', mine: '#fff', gomme: '#fff', bague: '#fff', bois: '#fff', clair: 'none', fonce: 'none' }
  : { corps: c.couleur, mine: c.couleur, gomme: '#f4a6b7', bague: '#c9ced6', bois: '#f3d2a2', clair: 'rgba(255,255,255,.35)', fonce: 'rgba(0,0,0,.18)' })

/** Le dessin d'un crayon de longueur `l` (unités du cadre). */
function dessin(l: number, t: Teintes): string {
  const trait = `stroke="${CONTOUR}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`
  const xBague = 2 + GOMME, xCorps = xBague + BAGUE, xBois = l - BOIS
  const gomme = `<path d="M${xBague} ${HAUT} H6 Q2 ${HAUT} 2 ${HAUT + 4} V${BAS - 4} Q2 ${BAS} 6 ${BAS} H${xBague} Z" fill="${t.gomme}" ${trait}/>`
  const bague = `<rect x="${xBague}" y="${HAUT}" width="${BAGUE}" height="${BAS - HAUT}" fill="${t.bague}" ${trait}/>`
    + `<path d="M${xBague + BAGUE / 2} ${HAUT} V${BAS}" fill="none" stroke="${CONTOUR}" stroke-width="1"/>`
  // le corps : trois facettes (la facette du haut éclairée, celle du bas dans l'ombre)
  const corps = `<rect x="${xCorps}" y="${HAUT}" width="${xBois - xCorps}" height="${BAS - HAUT}" fill="${t.corps}"/>`
    + `<rect x="${xCorps}" y="${HAUT}" width="${xBois - xCorps}" height="5" fill="${t.clair}"/>`
    + `<rect x="${xCorps}" y="${BAS - 5}" width="${xBois - xCorps}" height="5" fill="${t.fonce}"/>`
    + `<path d="M${xCorps} ${HAUT + 5} H${xBois} M${xCorps} ${BAS - 5} H${xBois}" fill="none" stroke="${CONTOUR}" stroke-width="1"/>`
    + `<rect x="${xCorps}" y="${HAUT}" width="${xBois - xCorps}" height="${BAS - HAUT}" fill="none" ${trait}/>`
  // le bois taillé, au bord festonné, puis la mine de la couleur du crayon
  const bois = `<path d="M${xBois} ${HAUT} Q${xBois + 3} ${HAUT + 5} ${xBois} ${MILIEU - 2} Q${xBois + 3} ${MILIEU + 3} ${xBois} ${BAS} L${l - 7} ${MILIEU + 3.4} V${MILIEU - 3.4} Z" fill="${t.bois}" ${trait}/>`
  const mine = `<path d="M${l - 7} ${MILIEU - 3.4} L${l} ${MILIEU} L${l - 7} ${MILIEU + 3.4} Z" fill="${t.mine}" ${trait}/>`
  return `${gomme}${bague}${corps}${bois}${mine}`
}

/** `impression` : traits sur fond blanc, 0,4 mm par unité (le plus long crayon fait au plus 12 cm) ; sinon en couleur, à la taille du conteneur. */
export function svgCrayon(c: Crayon, { impression = false }: { impression?: boolean } = {}): string {
  const taille = impression ? ` width="${LARGEUR * 0.4}mm" height="${34 * 0.4}mm"` : ' aria-hidden="true"'
  return `<svg viewBox="0 0 ${LARGEUR} 34"${taille}>${dessin(c.longueur, teintesDe(c, impression))}</svg>`
}
