// Le crayon de « plus long, plus court » en SVG (chaîne), le même dans le jeu (en couleur) et sur la fiche (en traits). Pur.
import { LARGEUR } from './generateur.ts'
import type { Crayon } from './generateur.ts'

/** `impression` : traits noirs sur fond blanc, 0,4 mm par unité (le plus long crayon fait au plus 12 cm) ; sinon couleurs, taille du conteneur. */
export function svgCrayon(c: Crayon, { impression = false }: { impression?: boolean } = {}): string {
  const l = c.longueur
  if (impression) {
    return `<svg viewBox="0 0 ${LARGEUR} 34" width="${LARGEUR * 0.4}mm" height="${34 * 0.4}mm">
    <rect x="2" y="7" width="${l - 24}" height="20" rx="4" fill="none" stroke="#222" stroke-width="2.5"/>
    <polygon points="${l - 22},7 ${l},17 ${l - 22},27" fill="none" stroke="#222" stroke-width="2.5"/></svg>`
  }
  return `<svg viewBox="0 0 ${LARGEUR} 34" aria-hidden="true">
    <rect x="2" y="7" width="${l - 24}" height="20" rx="4" fill="${c.couleur}"/>
    <polygon points="${l - 22},7 ${l},17 ${l - 22},27" fill="#f3d2a2"/>
    <polygon points="${l - 7},14 ${l},17 ${l - 7},20" fill="${c.couleur}"/></svg>`
}
