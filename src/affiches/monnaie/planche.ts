// La planche à découper : la DISPOSITION des pièces et des billets sur les pages. Pure (aucun SVG, aucun texte : lisible par node,
// testée à part dans tests/affiches-planche.test.mjs). Pensée pour un MASSICOT : on coupe d'abord toute la page en bandes (coupes
// horizontales, d'un bord à l'autre), puis chaque bande en cases (coupes verticales).
//   - une BANDE (rangée) = une valeur : même hauteur pour toute la bande, cases de même largeur côte à côte, remplie jusqu'au bord ;
//   - les pièces forment un bloc de bandes à part, en grille régulière : cases carrées, toutes de la taille de la plus grande
//     pièce, chaque pièce centrée dans sa case ; les billets suivent, une bande par valeur (cases de la taille du billet) ;
//   - les cases se touchent (pas d'espace perdu) : chaque pièce ou billet est entouré d'une marge constante `ECART` / 2, et le
//     trait de coupe passe au milieu de la marge de deux voisins ;
//   - tout est à l'intérieur de la zone, dont une bordure `MARQUE` reste libre de chaque côté : les traits de coupe y dépassent, ce
//     sont les repères pour viser le massicot ; rien ne s'imprime sur un billet.
// L'échelle (100, 75 ou 50 %) réduit tout dans le même rapport : plus de pièces et de billets par page.
import { tailleReelle } from '../../dessins/argent.ts'
import type { ValeurArgent, ValeurBillet, ValeurPiece } from '../../dessins/argent.ts'

/** Les tailles proposées (% de la taille réelle). */
export const ECHELLES = [100, 75, 50] as const
export type Echelle = (typeof ECHELLES)[number]

/** Bordure libre de chaque côté de la zone (mm) : les repères de coupe y arrivent, rien d'autre. */
export const MARQUE = 6
/** Marge entre deux pièces ou billets voisins (mm) : le trait de coupe passe au milieu. */
export const ECART = 3
/** Hauteur réservée sous le dessin pour la consigne (mm). */
export const H_CONSIGNE = 9

/** Les valeurs de chaque planche (centimes), dans l'ordre de découpe : pièces, puis billets, du plus petit au plus grand. */
export const LOTS: Readonly<Record<'euros' | 'centimes', { pieces: readonly ValeurPiece[], billets: readonly ValeurBillet[] }>> = {
  euros: { pieces: [100, 200], billets: [500, 1000, 2000, 5000] },
  centimes: { pieces: [1, 2, 5, 10, 20, 50, 100, 200], billets: [500, 1000, 2000, 5000, 10000] },
}

export interface Boite { x: number, y: number, w: number, h: number }

/** Une pièce ou un billet posé : sa boîte (l'argent lui-même) et sa case (ce que la coupe détache), en mm sur la page. */
export interface Pose {
  v: ValeurArgent
  genre: 'piece' | 'billet'
  boite: Boite
  case: Boite
  /** numéro de la bande sur la page et rang dans la bande (la colonne, pour une grille régulière) */
  bande: number
  colonne: number
}

/** Une bande : une valeur, sa hauteur unique, et l'étendue de ses cases (x0 → x1). */
export interface Bande { genre: 'piece' | 'billet', v: ValeurArgent, y: number, h: number, x0: number, x1: number, largeurCase: number, n: number }

export interface PagePlanche { poses: Pose[], bandes: Bande[] }

// arrondi au micron : les mêmes calculs donnent exactement les mêmes nombres (colonnes alignées au bit près)
const mm = (n: number): number => Math.round(n * 1000) / 1000

/**
 * Dispose la planche sur des pages de W × H mm (H : la hauteur du dessin, consigne exclue). `echelle` : % de la taille réelle.
 * Une bande remplie par valeur ; une page de plus dès que la bande suivante ne tient plus en hauteur.
 */
export function disposerPlanche({ centimes, echelle, W, H }: { centimes: boolean, echelle: Echelle, W: number, H: number }): PagePlanche[] {
  const k = echelle / 100
  const lot = LOTS[centimes ? 'centimes' : 'euros']
  const largeurUtile = W - 2 * MARQUE
  const hauteurUtile = H - 2 * MARQUE
  // les pièces : cases carrées de la taille de la plus grande
  const cote = mm(Math.max(...lot.pieces.map(v => tailleReelle(v).w)) * k + ECART)
  const bandes: { genre: 'piece' | 'billet', v: ValeurArgent, w: number, h: number, largeurCase: number }[] = [
    ...lot.pieces.map(v => ({ genre: 'piece' as const, v, w: mm(tailleReelle(v).w * k), h: mm(tailleReelle(v).h * k), largeurCase: cote })),
    ...lot.billets.map(v => ({ genre: 'billet' as const, v, w: mm(tailleReelle(v).w * k), h: mm(tailleReelle(v).h * k), largeurCase: mm(tailleReelle(v).w * k + ECART) })),
  ]
  const pages: PagePlanche[] = [{ poses: [], bandes: [] }]
  let y = MARQUE
  for (const b of bandes) {
    const hauteurCase = b.genre === 'piece' ? cote : mm(b.h + ECART)
    const n = Math.floor(largeurUtile / b.largeurCase)
    if (n < 1) throw new Error(`planche : la valeur ${b.v} (${b.w} mm) ne tient pas dans une page de ${W} mm`)
    if (hauteurCase > hauteurUtile) throw new Error(`planche : la valeur ${b.v} (${b.h} mm) ne tient pas dans une page de ${H} mm`)
    if (y + hauteurCase > MARQUE + hauteurUtile + 1e-6) { pages.push({ poses: [], bandes: [] }); y = MARQUE }
    const page = pages.at(-1)!
    // la bande est centrée dans la largeur utile
    const x0 = mm(MARQUE + (largeurUtile - n * b.largeurCase) / 2)
    const bande = page.bandes.length
    page.bandes.push({ genre: b.genre, v: b.v, y: mm(y), h: hauteurCase, x0, x1: mm(x0 + n * b.largeurCase), largeurCase: b.largeurCase, n })
    for (let i = 0; i < n; i++) {
      const cx = mm(x0 + i * b.largeurCase)
      page.poses.push({
        v: b.v, genre: b.genre, bande, colonne: i,
        case: { x: cx, y: mm(y), w: b.largeurCase, h: hauteurCase },
        // l'argent est centré dans sa case : marge égale de chaque côté (carrée pour une pièce)
        boite: { x: mm(cx + (b.largeurCase - b.w) / 2), y: mm(y + (hauteurCase - b.h) / 2), w: b.w, h: b.h },
      })
    }
    y = mm(y + hauteurCase)
  }
  return pages
}
