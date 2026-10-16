// Le dessin du matériel de la valise : le patron d'une boîte opaque (la page à découper, plier, coller) et la planche de jetons (images en grille, traits de coupe
// pleins d'un bord à l'autre pour le massicot). Le SVG de chaque page est à l'échelle 1 (1 unité = 1 mm de la feuille). Pur : lisible par node ; les jetons sont des
// emojis OpenMoji (src/images/).
import type { NomEmoji } from '../../images/tables.ts'
import type { Page, Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

/** La boîte : largeur, profondeur et hauteur en mm (avant mise à l'échelle), et la largeur d'une languette de collage. */
const BOITE = { l: 80, p: 50, h: 50, languette: 10 }
/** Le côté d'un jeton en mm. */
const COTE_JETON = 24

type Zone = { W: number, H: number }
const pts = (liste: readonly (readonly [number, number])[]): string => liste.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')

/**
 * Le patron : une croix (fond au centre, devant et derrière, côtés), avec en haut le couvercle rabattable attaché au mur du fond et ses languettes de collage sur les côtés.
 * Traits pleins : on découpe ; pointillés : on plie. Mis à l'échelle pour tenir dans la zone.
 */
function patron(zone: Zone): string {
  const { l, p, h, languette: t } = BOITE
  // largeur totale (côtés + languettes), hauteur totale (couvercle p + mur du fond h + fond p + mur de devant h)
  const largeur = l + 2 * h
  const hauteur = p + h + p + h
  const f = Math.min((zone.W - 10) / (largeur + 2 * t), (zone.H - 12) / hauteur, 1.3)
  const x0 = (zone.W - largeur * f) / 2 + h * f   // fond de la boîte, à gauche
  const y0 = 6 + (p + h) * f                       // fond de la boîte, en haut
  const X = (x: number): number => x0 + x * f, Y = (y: number): number => y0 + y * f
  const decoupe = 'fill="#fff" stroke="#222" stroke-width="0.6"'
  // les murs de devant et du fond (largeur l, hauteur h), les côtés (largeur h, profondeur p), le fond (l × p), le couvercle (l × p) au-dessus du mur du fond
  const rect = (x: number, y: number, w: number, hh: number): string => `<rect x="${X(x)}" y="${Y(y)}" width="${w * f}" height="${hh * f}" ${decoupe}/>`
  // une languette de collage : un trapèze qui part d'un côté vertical de longueur `long`
  const languette = (xBord: number, yHaut: number, long: number, versGauche: boolean): string => {
    const d = versGauche ? -1 : 1
    return `<polygon points="${pts([[X(xBord), Y(yHaut)], [X(xBord + d * t), Y(yHaut + 6)], [X(xBord + d * t), Y(yHaut + long - 6)], [X(xBord), Y(yHaut + long)]])}" ${decoupe}/>`
  }
  let s = ''
  s += rect(0, 0, l, p)                  // fond
  s += rect(0, p, l, h)                  // mur de devant
  s += rect(0, -h, l, h)                 // mur du fond
  s += rect(-h, 0, h, p)                 // côté gauche
  s += rect(l, 0, h, p)                  // côté droit
  s += rect(0, -h - p, l, p)             // couvercle, attaché au mur du fond
  // languettes des murs de devant et du fond (collées aux côtés) et du couvercle
  s += languette(0, p, h, true) + languette(l, p, h, false)
  s += languette(0, -h, h, true) + languette(l, -h, h, false)
  s += languette(0, -h - p, p, true) + languette(l, -h - p, p, false)
  // les pliures : un trait blanc efface le trait plein du rectangle voisin, puis le pointillé : tout ce qui est entre deux faces ou entre une face et une languette
  const plie = (x1: number, y1: number, x2: number, y2: number): string => `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="#fff" stroke-width="1.1"/>`
    + `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="#666" stroke-width="0.45" stroke-dasharray="2.5 2"/>`
  s += plie(0, 0, l, 0) + plie(0, p, l, p) + plie(0, 0, 0, p) + plie(l, 0, l, p)   // le contour du fond
  s += plie(0, -h, l, -h)                                                          // le mur du fond et le couvercle
  for (const [y1, y2] of [[p, p + h], [-h, 0], [-h - p, -h]]) s += plie(0, y1, 0, y2) + plie(l, y1, l, y2)   // les languettes
  return `<svg width="${zone.W}mm" height="${zone.H}mm" viewBox="0 0 ${zone.W} ${zone.H}">${s}</svg>`
}

/** La planche : des jetons (l'image du réglage `objet`) en grille serrée, traits de coupe pleins d'un bord à l'autre (massicot). */
function planche(r: Reglages, zone: Zone, ctx: Parameters<Rendu<Reglages>['dessin']>[3]): string {
  const colonnes = Math.max(1, Math.floor(zone.W / COTE_JETON))
  const rangees = Math.max(1, Math.floor((zone.H - 4) / COTE_JETON))
  const largeur = colonnes * COTE_JETON, hauteur = rangees * COTE_JETON
  const x0 = (zone.W - largeur) / 2, y0 = 2
  let s = ''
  for (let c = 0; c <= colonnes; c++) s += `<line x1="${x0 + c * COTE_JETON}" y1="${y0}" x2="${x0 + c * COTE_JETON}" y2="${y0 + hauteur}" stroke="#555" stroke-width="0.3"/>`
  for (let k = 0; k <= rangees; k++) s += `<line x1="${x0}" y1="${y0 + k * COTE_JETON}" x2="${x0 + largeur}" y2="${y0 + k * COTE_JETON}" stroke="#555" stroke-width="0.3"/>`
  const marge = COTE_JETON * 0.12
  for (let k = 0; k < rangees; k++) for (let c = 0; c < colonnes; c++) s += ctx.images.svg(r.objet as NomEmoji, x0 + c * COTE_JETON + marge, y0 + k * COTE_JETON + marge, COTE_JETON - 2 * marge)
  return `<svg width="${zone.W}mm" height="${zone.H}mm" viewBox="0 0 ${zone.W} ${zone.H}">${s}</svg>`
}

/** Le texte sous une page : ce qu'on fait (découper, plier, coller). */
const consigne = (texte: string): string => `<p class="consigne">${texte.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  const hConsigne = 12
  const zone = { W, H: H - hConsigne }
  const pages: Page[] = []
  if (r.patron) pages.push({ corps: patron(zone) + consigne(T('patron.consigne')), titre: T('patron.titre') })
  pages.push({ corps: planche(r, zone, ctx) + consigne(T('jetons.consigne')), titre: T('jetons.titre') })
  return pages
}

// CSS propre à l'affiche (ajouté après celui du cadre) : le SVG hérite la police du texte ; la consigne sous le dessin
export const css = 'svg { display: block; flex: none; } svg text { font-family: inherit; } .consigne { margin: 2mm 0 0; font-size: 3.6mm; text-align: center; font-weight: 700; }'
