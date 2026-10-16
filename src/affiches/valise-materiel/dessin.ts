// Le dessin du matériel de la valise : le patron d'une boîte opaque (découper, plier, coller ; couvercle rabattable, fente pour glisser les jetons, faces en couleurs ou blanches à colorier),
// la planche de jetons (images en grille, mélange ou une seule sorte, traits de coupe d'un bord à l'autre pour le massicot) et les dés à plier. Le SVG de chaque page est
// à l'échelle 1 (1 unité = 1 mm de la feuille). Pur : lisible par node ; les jetons sont des emojis OpenMoji (src/images/), que « Images : contour » donne à colorier.
import type { NomEmoji } from '../../images/tables.ts'
import type { Page, Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

type Contexte = Parameters<Rendu<Reglages>['dessin']>[3]
type Zone = { W: number, H: number }

/** La boîte : largeur, profondeur et hauteur en mm (avant mise à l'échelle), largeur d'une languette de collage, hauteur de la languette de fermeture du couvercle. */
const BOITE = { l: 80, p: 50, h: 50, languette: 10, fermeture: 12 }
/** La fente du couvercle (en mm de la feuille, pas mise à l'échelle) : un jeton plat de 24 mm y passe de chant. */
const FENTE = { longueur: 34, largeur: 4.5 }
/** Le côté d'un jeton en mm. */
const COTE_JETON = 24
/** Les images d'un mélange de jetons. */
const MELANGE: readonly NomEmoji[] = ['ours', 'pomme', 'etoile', 'fleur', 'chat']

const pts = (liste: readonly (readonly [number, number])[]): string => liste.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
const DECOUPE = 'fill="#fff" stroke="#222" stroke-width="0.6"'
/** Les couleurs des faces de la boîte (pastel : la feuille reste lisible en noir et blanc) : le fond, le devant, le derrière, les côtés, le couvercle. */
const COULEURS = { fond: '#ffe9a8', devant: '#ffc9a3', derriere: '#ffc9a3', cotes: '#b9dcf6', couvercle: '#bfe8c0', languette: '#f0f0f0' }
const remplissage = (couleur: string): string => `fill="${couleur}" stroke="#222" stroke-width="0.6"`
/** Une pliure : un trait blanc efface le trait plein de la face voisine, puis le pointillé. */
const pli = (x1: number, y1: number, x2: number, y2: number): string => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="1.1"/>`
  + `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#666" stroke-width="0.45" stroke-dasharray="2.5 2"/>`
const svgPage = (zone: Zone, contenu: string): string => `<svg width="${zone.W}mm" height="${zone.H}mm" viewBox="0 0 ${zone.W} ${zone.H}">${contenu}</svg>`

/** L'image d'un jeton à la colonne c, rangée k : celle du réglage, ou une du mélange (décalée d'une rangée à l'autre, pour que les voisins diffèrent). */
const jetonDe = (objet: string, c: number, k: number): NomEmoji => (objet === 'mix' ? MELANGE[(c + 2 * k) % MELANGE.length] : objet as NomEmoji)

/**
 * Le patron : une croix (fond au centre, devant et derrière, côtés), avec en haut le couvercle attaché au mur du fond (il s'ouvre et se ferme comme une charnière) et sa
 * languette de fermeture, qu'on glisse dans la boîte. Une fente au milieu du couvercle laisse passer les jetons sans l'ouvrir. Traits pleins : on découpe ; pointillés :
 * on plie. Les faces sont en couleurs, ou blanches : on les colorie soi-même. Mis à l'échelle pour tenir dans la zone.
 */
function patron(r: Reglages, zone: Zone): string {
  const { l, p, h, languette: t, fermeture } = BOITE
  // le patron est une croix haute (largeur + languettes, hauteur) : sur une page basse (paysage) on le couche, quand c'est ce qui le fait le plus grand
  const lw = l + 2 * h + 2 * t, lh = fermeture + p + h + p + h
  const debout = Math.min((zone.W - 10) / lw, (zone.H - 12) / lh)
  const couche = Math.min((zone.W - 10) / lh, (zone.H - 12) / lw)
  const tourne = couche > debout
  const f = Math.min(Math.max(debout, couche), 2.5)
  const X = (x: number): number => (t + h + x) * f, Y = (y: number): number => (fermeture + p + h + y) * f
  // décor : des faces en couleurs (réglage `decor`, par défaut) ou blanches, à colorier
  const colore = r.decor !== false
  const style = (couleur: string): string => (colore ? remplissage(couleur) : DECOUPE)
  const rect = (x: number, y: number, w: number, hh: number, couleur: string): string => `<rect x="${X(x)}" y="${Y(y)}" width="${w * f}" height="${hh * f}" ${style(couleur)}/>`
  /** Une languette de collage : un trapèze qui part d'un côté vertical de longueur `long`. */
  const languetteLaterale = (xBord: number, yHaut: number, long: number, versGauche: boolean): string => {
    const d = versGauche ? -1 : 1
    return `<polygon points="${pts([[X(xBord), Y(yHaut)], [X(xBord + d * t), Y(yHaut + 6)], [X(xBord + d * t), Y(yHaut + long - 6)], [X(xBord), Y(yHaut + long)]])}" ${style(COULEURS.languette)}/>`
  }
  let s = ''
  s += rect(0, 0, l, p, COULEURS.fond) + rect(0, p, l, h, COULEURS.devant) + rect(0, -h, l, h, COULEURS.derriere)
  s += rect(-h, 0, h, p, COULEURS.cotes) + rect(l, 0, h, p, COULEURS.cotes) + rect(0, -h - p, l, p, COULEURS.couvercle)
  s += languetteLaterale(0, p, h, true) + languetteLaterale(l, p, h, false)
  s += languetteLaterale(0, -h, h, true) + languetteLaterale(l, -h, h, false)
  // les rabats du couvercle : plus courts que les côtés, aux coins coupés et de la couleur du couvercle ; ils ne se collent pas, ils se glissent dans la boîte
  const rabat = (xBord: number, versGauche: boolean): string => {
    const d = versGauche ? -1 : 1, haut = -h - p, bas = -h, ecart = 3, chanfrein = 8, largeurRabat = 7
    return `<polygon points="${pts([[X(xBord), Y(haut + ecart)], [X(xBord) + d * largeurRabat * f, Y(haut + ecart) + chanfrein * f], [X(xBord) + d * largeurRabat * f, Y(bas - ecart) - chanfrein * f], [X(xBord), Y(bas - ecart)]])}" ${style(COULEURS.couvercle)}/>`
  }
  s += rabat(0, true) + rabat(l, false)
  // la languette de fermeture, au bord libre du couvercle (couleur du couvercle : elle ne se colle pas)
  const bord = -h - p
  s += `<polygon points="${pts([[X(l * 0.08), Y(bord)], [X(l * 0.15), Y(bord - fermeture)], [X(l * 0.85), Y(bord - fermeture)], [X(l * 0.92), Y(bord)]])}" ${style(COULEURS.couvercle)}/>`
  // les pliures : le contour du fond, la charnière du couvercle, les languettes
  const plier = (x1: number, y1: number, x2: number, y2: number): string => pli(X(x1), Y(y1), X(x2), Y(y2))
  s += plier(0, 0, l, 0) + plier(0, p, l, p) + plier(0, 0, 0, p) + plier(l, 0, l, p) + plier(0, -h, l, -h) + plier(l * 0.08, bord, l * 0.92, bord)
  for (const [y1, y2] of [[p, p + h], [-h, 0], [-h - p, -h]]) s += plier(0, y1, 0, y2) + plier(l, y1, l, y2)
  // la fente, au milieu du couvercle : on la perce avec la pointe des ciseaux
  const cx = X(l / 2), cy = Y(-h - p / 2)
  s += `<rect x="${cx - FENTE.longueur / 2}" y="${cy - FENTE.largeur / 2}" width="${FENTE.longueur}" height="${FENTE.largeur}" rx="${FENTE.largeur / 2}" fill="#d9d9d9" stroke="#222" stroke-width="0.6"/>`
  // le patron est dessiné dans son propre repère (0 à lw × f, 0 à lh × f), puis centré dans la zone, couché de 90° si besoin
  const largeurLocale = lw * f, hauteurLocale = lh * f
  if (!tourne) return svgPage(zone, `<g transform="translate(${(zone.W - largeurLocale) / 2} ${(zone.H - hauteurLocale) / 2})">${s}</g>`)
  const dx = (zone.W - hauteurLocale) / 2, dy = (zone.H - largeurLocale) / 2
  return svgPage(zone, `<g transform="translate(${dx + hauteurLocale} ${dy}) rotate(90)">${s}</g>`)
}

/** La planche : des jetons en grille serrée (mélange ou une seule image), traits de coupe pleins d'un bord à l'autre (massicot). */
function planche(r: Reglages, zone: Zone, ctx: Contexte): string {
  const colonnes = Math.max(1, Math.floor(zone.W / COTE_JETON))
  const rangees = Math.max(1, Math.floor((zone.H - 4) / COTE_JETON))
  const largeur = colonnes * COTE_JETON, hauteur = rangees * COTE_JETON
  const x0 = (zone.W - largeur) / 2, y0 = 2
  let s = ''
  for (let c = 0; c <= colonnes; c++) s += `<line x1="${x0 + c * COTE_JETON}" y1="${y0}" x2="${x0 + c * COTE_JETON}" y2="${y0 + hauteur}" stroke="#555" stroke-width="0.3"/>`
  for (let k = 0; k <= rangees; k++) s += `<line x1="${x0}" y1="${y0 + k * COTE_JETON}" x2="${x0 + largeur}" y2="${y0 + k * COTE_JETON}" stroke="#555" stroke-width="0.3"/>`
  const marge = COTE_JETON * 0.12
  const objet = (r.objet ?? 'mix') as string
  for (let k = 0; k < rangees; k++) for (let c = 0; c < colonnes; c++) s += ctx.images.svg(jetonDe(objet, c, k), x0 + c * COTE_JETON + marge, y0 + k * COTE_JETON + marge, COTE_JETON - 2 * marge)
  return svgPage(zone, s)
}

// ── Les dés à plier ──
type Face = number | '+' | '-'
/** Les six faces de chaque dé, dans l'ordre du patron : gauche, devant, droite, derrière, dessus, dessous (le dé usuel : deux faces opposées font 7). */
const DES: Readonly<Record<string, readonly Face[]>> = {
  // gauche 1 / droite 6, devant 2 / derrière 5, dessus 3 / dessous 4 : les faces opposées font 7
  usuel: [1, 2, 6, 5, 3, 4],
  'un-deux-trois': [1, 2, 3, 1, 2, 3],
  'plus-moins': ['+', '+', '+', '-', '-', '-'],
}
/** Les places des points d'une face de dé (grille de 3 × 3 : colonne et rangée valent 0, 1 ou 2). */
const POINTS: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
}

/** Le contenu d'une face de côté `f` dont le coin haut gauche est (x, y) : des points, ou un signe + ou − (en rectangles, sans police). */
function contenuFace(face: Face, x: number, y: number, f: number): string {
  if (typeof face === 'number') {
    return (POINTS[face] ?? []).map(([c, k]) => `<circle cx="${x + f * (0.22 + 0.28 * c)}" cy="${y + f * (0.22 + 0.28 * k)}" r="${f * 0.085}" fill="#222"/>`).join('')
  }
  const barre = (cx: number, cy: number, w: number, hh: number): string => `<rect x="${cx - w / 2}" y="${cy - hh / 2}" width="${w}" height="${hh}" rx="${Math.min(w, hh) / 2}" fill="#222"/>`
  const cx = x + f / 2, cy = y + f / 2
  return barre(cx, cy, f * 0.55, f * 0.12) + (face === '+' ? barre(cx, cy, f * 0.12, f * 0.55) : '')
}

/**
 * Le patron d'un dé : une croix de six carrés (quatre en rangée, un au-dessus et un au-dessous du deuxième), avec sept languettes de collage. Chaque languette est sur un bord
 * qui se colle à un bord sans languette.
 */
function patronDe(faces: readonly Face[], zone: Zone): string {
  const t = 8
  const f = Math.min((zone.W - 2 * t - 10) / 4, (zone.H - 2 * t - 10) / 3, 38)
  const x0 = (zone.W - 4 * f) / 2, y0 = (zone.H - 3 * f) / 2
  const place: readonly (readonly [number, number])[] = [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]]
  let s = ''
  // les languettes (sous les faces) : bords haut de la 1re, 3e et 4e faces, bords bas de la 1re, 3e et 4e, bord droit de la 4e
  const haut = (c: number): string => `<polygon points="${pts([[x0 + c * f, y0 + f], [x0 + c * f + 3, y0 + f - t], [x0 + (c + 1) * f - 3, y0 + f - t], [x0 + (c + 1) * f, y0 + f]])}" ${DECOUPE}/>`
  const bas = (c: number): string => `<polygon points="${pts([[x0 + c * f, y0 + 2 * f], [x0 + c * f + 3, y0 + 2 * f + t], [x0 + (c + 1) * f - 3, y0 + 2 * f + t], [x0 + (c + 1) * f, y0 + 2 * f]])}" ${DECOUPE}/>`
  s += haut(0) + haut(2) + haut(3) + bas(0) + bas(2) + bas(3)
  s += `<polygon points="${pts([[x0 + 4 * f, y0 + f], [x0 + 4 * f + t, y0 + f + 3], [x0 + 4 * f + t, y0 + 2 * f - 3], [x0 + 4 * f, y0 + 2 * f]])}" ${DECOUPE}/>`
  place.forEach(([c, k], i) => { s += `<rect x="${x0 + c * f}" y="${y0 + k * f}" width="${f}" height="${f}" ${DECOUPE}/>${contenuFace(faces[i], x0 + c * f, y0 + k * f, f)}` })
  // les pliures : entre les faces voisines, et le long de chaque languette
  s += pli(x0 + f, y0 + f, x0 + f, y0 + 2 * f) + pli(x0 + 2 * f, y0 + f, x0 + 2 * f, y0 + 2 * f) + pli(x0 + 3 * f, y0 + f, x0 + 3 * f, y0 + 2 * f)
  s += pli(x0 + f, y0 + f, x0 + 2 * f, y0 + f) + pli(x0 + f, y0 + 2 * f, x0 + 2 * f, y0 + 2 * f)
  for (const c of [0, 2, 3]) s += pli(x0 + c * f, y0 + f, x0 + (c + 1) * f, y0 + f) + pli(x0 + c * f, y0 + 2 * f, x0 + (c + 1) * f, y0 + 2 * f)
  s += pli(x0 + 4 * f, y0 + f, x0 + 4 * f, y0 + 2 * f)
  return svgPage(zone, s)
}

/** Le texte sous une page : ce qu'on fait (découper, plier, coller). */
const consigne = (texte: string): string => `<p class="consigne">${texte.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  const hConsigne = 12
  const zone = { W, H: H - hConsigne }
  const pages: Page[] = []
  if (r.genre === 'des') {
    for (const id of (r.des ?? ['usuel', 'un-deux-trois', 'plus-moins'])) pages.push({ corps: patronDe(DES[id], zone) + consigne(`${T(`des.${id}`)} — ${T('des.consigne')}`), titre: T(`des.titre.${id}`) })
    return pages
  }
  if (r.genre === 'boite') pages.push({ corps: patron(r, zone) + consigne(T('patron.consigne')), titre: T('patron.titre') })
  pages.push({ corps: planche(r, zone, ctx) + consigne(T('jetons.consigne')), titre: T('jetons.titre') })
  return pages
}

// CSS propre à l'affiche (ajouté après celui du cadre) : le SVG hérite la police du texte ; la consigne sous le dessin
export const css = 'svg { display: block; flex: none; } svg text { font-family: inherit; } .consigne { margin: 2mm 0 0; font-size: 3.6mm; text-align: center; font-weight: 700; }'
