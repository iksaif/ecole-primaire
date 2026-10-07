// La planche à découper : la DISPOSITION des pièces et des billets sur les pages. Pure (aucun SVG, aucun texte : lisible par node,
// testée à part dans tests/affiches-planche.test.mjs). Pensée pour un MASSICOT (coupes de bord à bord, « guillotine ») : on coupe
// d'abord toute la page en bandes (coupes horizontales), puis chaque bande en cases (coupes verticales).
//   - une BANDE (étagère) a une hauteur unique : celle de son premier article, le plus haut. Les articles sont triés du plus haut au
//     plus bas et rangés au premier endroit où ils tiennent (autre bande, autre page) : des valeurs de hauteurs voisines partagent une
//     bande, et les pièces comblent le bout des bandes de billets ;
//   - une case = l'article et sa marge `ECART` / 2 de chaque côté, centré ; une pièce a une case carrée de SA taille (pas de la plus
//     grande) ; le trait de coupe passe au milieu de la marge de deux voisins ;
//   - un billet peut être tourné de 90° (portrait : deux billets côte à côte au lieu d'un) : choisi quand cela économise des pages ;
//   - tout est à l'intérieur de la zone, dont une bordure `MARQUE` reste libre de chaque côté : les traits de coupe y dépassent, ce
//     sont les repères pour viser le massicot ; rien ne s'imprime sur un billet.
// Tailles (100, 75 ou 50 %) : pièces et billets réduits séparément. Options : exemplaires de chaque valeur (0 : une rangée pleine),
// valeurs choisies, pièces et/ou billets.
import { tailleReelle } from '../../dessins/argent.ts'
import type { ValeurArgent, ValeurBillet, ValeurPiece } from '../../dessins/argent.ts'

/** Les tailles proposées (% de la taille réelle). */
export const ECHELLES = [100, 75, 50] as const
export type Echelle = (typeof ECHELLES)[number]
/** Exemplaires de chaque valeur : 0 = autant qu'une rangée pleine (remplir). */
export const EXEMPLAIRES = [0, 1, 2, 3, 5, 10] as const
export type Exemplaires = (typeof EXEMPLAIRES)[number]
export const GENRES = ['tout', 'billets', 'pieces'] as const
export type Genres = (typeof GENRES)[number]

/** Bordure libre de chaque côté de la zone (mm) : les repères de coupe y arrivent, rien d'autre. */
export const MARQUE = 6
/** Marge entre deux pièces ou billets voisins (mm) : le trait de coupe passe au milieu. */
export const ECART = 2
/** Hauteur réservée sous le dessin pour la consigne (mm). */
export const H_CONSIGNE = 9

/** Les valeurs de chaque planche (centimes), dans l'ordre de découpe : pièces, puis billets, du plus petit au plus grand. */
export const LOTS: Readonly<Record<'euros' | 'centimes', { pieces: readonly ValeurPiece[], billets: readonly ValeurBillet[] }>> = {
  euros: { pieces: [100, 200], billets: [500, 1000, 2000, 5000] },
  centimes: { pieces: [1, 2, 5, 10, 20, 50, 100, 200], billets: [500, 1000, 2000, 5000, 10000] },
}

export interface Boite { x: number, y: number, w: number, h: number }

/** Une pièce ou un billet posé : sa boîte (l'argent lui-même, tourné si `tourne`) et sa case (ce que la coupe détache), en mm sur la page. */
export interface Pose {
  v: ValeurArgent
  genre: 'piece' | 'billet'
  boite: Boite
  case: Boite
  /** billet tourné de 90° (sa boîte est alors « debout ») */
  tourne: boolean
  /** numéro de la bande sur la page et rang dans la bande */
  bande: number
  colonne: number
}

/** Une bande : sa hauteur unique, et les abscisses de ses coupes verticales (une de plus que de cases, de x0 à x1). */
export interface Bande { y: number, h: number, x0: number, x1: number, xs: number[], n: number }

export interface PagePlanche { poses: Pose[], bandes: Bande[] }

// arrondi au micron : les mêmes calculs donnent exactement les mêmes nombres
const mm = (n: number): number => Math.round(n * 1000) / 1000

export interface ParamsPlanche {
  centimes: boolean
  taillePieces: Echelle
  tailleBillets: Echelle
  /** exemplaires de chaque valeur ; 0 : autant qu'une rangée pleine de cette valeur */
  exemplaires?: Exemplaires
  /** valeurs retenues (centimes) ; absent : toutes celles de la planche */
  valeurs?: readonly number[]
  genres?: Genres
  W: number
  H: number
}

interface Article { v: ValeurArgent, genre: 'piece' | 'billet', w: number, h: number, tourne: boolean }

class Impossible extends Error {}

/** Range les articles (triés du plus haut au plus bas) en bandes et en pages, premier emplacement libre. */
function ranger(articles: readonly Article[], W: number, H: number): PagePlanche[] {
  const largeurUtile = W - 2 * MARQUE
  const hauteurUtile = H - 2 * MARQUE
  interface Etagere { y: number, h: number, cases: { a: Article, w: number }[], utilise: number }
  const pages: { etageres: Etagere[], y: number }[] = []
  for (const a of articles) {
    const cw = mm(a.w + ECART)
    const ch = mm(a.h + ECART)
    if (cw > largeurUtile + 1e-6 || ch > hauteurUtile + 1e-6) throw new Impossible(`${a.v}`)
    let place = false
    for (const page of pages) {
      const e = page.etageres.find(x => x.h >= ch - 1e-6 && x.utilise + cw <= largeurUtile + 1e-6)
      if (e) { e.cases.push({ a, w: cw }); e.utilise = mm(e.utilise + cw); place = true; break }
      if (page.y + ch <= MARQUE + hauteurUtile + 1e-6) {
        page.etageres.push({ y: page.y, h: ch, cases: [{ a, w: cw }], utilise: cw }); page.y = mm(page.y + ch); place = true; break
      }
    }
    if (!place) pages.push({ etageres: [{ y: MARQUE, h: ch, cases: [{ a, w: cw }], utilise: cw }], y: mm(MARQUE + ch) })
  }
  if (!pages.length) return [{ poses: [], bandes: [] }]
  return pages.map(page => {
    const res: PagePlanche = { poses: [], bandes: [] }
    page.etageres.forEach((e, bande) => {
      const x0 = mm(MARQUE + (largeurUtile - e.utilise) / 2)
      let x = x0
      const xs = [x0]
      e.cases.forEach(({ a, w }, colonne) => {
        res.poses.push({
          v: a.v, genre: a.genre, tourne: a.tourne, bande, colonne,
          case: { x: x, y: e.y, w, h: e.h },
          // l'argent est centré dans sa case : marge égale de chaque côté
          boite: { x: mm(x + (w - a.w) / 2), y: mm(e.y + (e.h - a.h) / 2), w: a.w, h: a.h },
        })
        x = mm(x + w)
        xs.push(x)
      })
      res.bandes.push({ y: e.y, h: e.h, x0, x1: x, xs, n: e.cases.length })
    })
    return res
  })
}

/**
 * Dispose la planche sur des pages de W × H mm (H : la hauteur du dessin, consigne exclue). Les billets sont posés debout ou
 * couchés, selon ce qui demande le moins de pages.
 */
export function disposerPlanche({ centimes, taillePieces, tailleBillets, exemplaires = 0, valeurs, genres = 'tout', W, H }: ParamsPlanche): PagePlanche[] {
  const kp = taillePieces / 100
  const kb = tailleBillets / 100
  const lot = LOTS[centimes ? 'centimes' : 'euros']
  const largeurUtile = W - 2 * MARQUE
  const retenue = (v: number): boolean => !valeurs || valeurs.includes(v)
  const base: Article[] = []
  const articles = (v: ValeurArgent, genre: 'piece' | 'billet', k: number, tourne: boolean): Article[] => {
    const r = tailleReelle(v)
    const w = mm(r.w * k)
    const h = mm(r.h * k)
    const [aw, ah] = tourne ? [h, w] : [w, h]
    // remplir : autant d'exemplaires que d'articles côte à côte dans une rangée pleine, dans la position non tournée
    const n = exemplaires || Math.max(1, Math.floor(largeurUtile / (w + ECART)))
    return Array.from({ length: n }, () => ({ v, genre, w: aw, h: ah, tourne }))
  }
  const candidats = [false, true].flatMap(tourne => {
    const liste = [
      ...(genres === 'billets' ? [] : lot.pieces.filter(retenue).flatMap(v => articles(v, 'piece', kp, false))),
      ...(genres === 'pieces' ? [] : lot.billets.filter(retenue).flatMap(v => articles(v, 'billet', kb, tourne))),
    ].sort((a, b) => (b.h - a.h) || (b.w - a.w) || (a.v - b.v))
    try { return [ranger(liste, W, H)] } catch (e) { if (e instanceof Impossible) return []; throw e }
  })
  void base
  if (!candidats.length) throw new Error(`planche : une valeur ne tient pas dans une page de ${W} × ${H} mm`)
  // le moins de pages ; à égalité, billets non tournés (le premier)
  return candidats.reduce((m, c) => (c.length < m.length ? c : m))
}
