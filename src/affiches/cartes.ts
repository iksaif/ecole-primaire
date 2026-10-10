// Dessin commun des affiches « cartes » de la maternelle (la journée, le corps, les sens, l'hygiène, les cycles de vie, l'eau, les
// couleurs, les repères d'espace) : une carte par notion, avec son image (un emoji OpenMoji), son mot dans chaque langue de la feuille (la
// deuxième langue en bleu, comme les listes de mots), et au besoin un numéro d'étape, un fond de couleur, des flèches entre les cartes
// (`suite`) ou en cercle (`cycle`). Une seule page. Pur : la mesure du texte vient du contexte, les images de src/images/.
import type { ContexteDessin } from './types.ts'
import { echapper } from '../utils/html.js'
import type { NomEmoji } from '../images/tables.ts'
import { tailleQuiTient } from './listeMots.ts'

/** Une carte : son image, son mot dans une langue, et ce qui la distingue (numéro, couleur du fond de l'image). */
export interface Carte {
  emoji?: NomEmoji
  mot: (langue: string) => string
  /** une précision sous le mot (« les yeux » sous « la vue »), plus petite */
  precision?: (langue: string) => string
  /** un dessin à la place de l'emoji : du HTML (un SVG) qui remplit un carré de `cote` mm */
  dessin?: (cote: number) => string
  /** un numéro d'étape, dans un rond en haut à gauche */
  numero?: number
  /** un aplat de couleur derrière l'image (les couleurs) */
  couleur?: string
}

/**
 * Comment les cartes se suivent : en grille, d'une flèche à la suivante (`suite`), d'une double flèche à la suivante (`aller-retour` :
 * fondre et geler), ou en cercle (un cycle).
 */
export type Enchainement = 'grille' | 'suite' | 'aller-retour' | 'cycle'

export interface OptionsCartes {
  langues: readonly string[]
  enchainement?: Enchainement
  /** nombre de colonnes imposé (sinon : celui qui donne les plus grandes cartes) */
  colonnes?: number
}

const ECART = 5   // mm entre les cartes

/** La taille des cartes dans une grille de `colonnes` colonnes : largeur, hauteur de carte, et ce qui reste à l'image. */
interface Disposition { colonnes: number, rangs: number, l: number, h: number, hCarte: number, fleche: number, image: number, taille: number[], taillePrecision: number[] }

function disposer(cartes: readonly Carte[], { W, H }: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[], colonnes: number, avecFleches: boolean): Disposition {
  const rangs = Math.ceil(cartes.length / colonnes)
  // en « suite », une flèche entre deux cartes d'une même ligne : une place de plus que l'écart
  const fleche = avecFleches ? Math.min(14, W * 0.07) : 0
  const l = (W - (colonnes - 1) * (fleche ? fleche + ECART : ECART)) / colonnes
  const h = (H - (rangs - 1) * ECART) / rangs
  // le texte de chaque langue : la taille du plus long de ses mots, dans la largeur de la carte
  const plafond = Math.min(h * 0.14, l * 0.2)
  const taille = langues.map(langue => tailleQuiTient(cartes.map(c => c.mot(langue)), ctx.nomPolice(), l * 0.96, plafond, ctx))
  // une précision éventuelle sous chaque mot : plus petite (les trois quarts), sur sa propre ligne
  const precisions = langues.map(langue => cartes.map(c => c.precision?.(langue) ?? ''))
  const taillePrecision = langues.map((langue, i) => (precisions[i].some(p => p) ? tailleQuiTient(precisions[i], ctx.nomPolice(), l * 0.96, taille[i] * 0.75, ctx) : 0))
  const hTexte = taille.reduce((somme, t, i) => somme + t * 1.3 + taillePrecision[i] * 1.3, 0) + 3
  const image = Math.max(0, Math.min(l * 0.82, h - hTexte - 4))
  // la carte n'est pas plus haute que son contenu (image, mots, marges) : elle ne s'étire pas quand la largeur limite l'image
  const hCarte = Math.min(h, image + hTexte + 8)
  return { colonnes, rangs, l, h, hCarte, fleche, image, taille, taillePrecision }
}

/** Le nombre de colonnes qui donne les plus grandes images. */
function meilleureDisposition(cartes: readonly Carte[], zone: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[], options: OptionsCartes): Disposition {
  const avecFleches = options.enchainement === 'suite' || options.enchainement === 'aller-retour'
  const candidates = options.colonnes ? [options.colonnes] : Array.from({ length: cartes.length }, (_, i) => i + 1)
  const dispositions = candidates.map(c => disposer(cartes, zone, ctx, langues, c, avecFleches))
  return dispositions.reduce((meilleure, d) => (d.image > meilleure.image ? d : meilleure))
}

/** Le contenu d'une carte : l'image (sur son aplat de couleur au besoin), le numéro et les mots. */
function htmlCarte(c: Carte, d: Disposition, ctx: ContexteDessin, langues: readonly string[]): string {
  const dessiner = (cote: number): string => (c.dessin ? c.dessin(cote) : c.emoji ? ctx.images.html(c.emoji, `${cote}mm`) : '')
  const image = dessiner(d.image * (c.couleur ? 0.62 : 1))
  const aplat = c.couleur
    ? `<span class="aplat" style="width:${d.image}mm;height:${d.image}mm;background:${c.couleur}"><span class="rond" style="width:${d.image * 0.74}mm;height:${d.image * 0.74}mm">${image}</span></span>`
    : image
  const numero = c.numero ? `<span class="numero" style="width:${d.l * 0.18}mm;height:${d.l * 0.18}mm;font-size:${d.l * 0.11}mm">${c.numero}</span>` : ''
  const mots = langues.map((langue, i) => {
    const precision = c.precision?.(langue)
    const ligne2 = precision ? `<span class="precision l${i}" style="font-family:${ctx.police()};font-size:${d.taillePrecision[i]}mm">${echapper(precision)}</span>` : ''
    return `<span class="mot l${i}" style="font-family:${ctx.police()};font-size:${d.taille[i]}mm">${echapper(c.mot(langue))}</span>${ligne2}`
  }).join('')
  return `${numero}<span class="vignette" style="height:${d.image}mm">${aplat}</span>${mots}`
}

/** Une flèche vers la droite, dans un carré de `taille` mm (entre deux cartes d'une suite). */
const fleche = (taille: number, double = false): string => {
  const tete = double ? 'M16 6l6 6-6 6' : 'M12 5l7 7-7 7'
  const teteGauche = double ? 'M8 6l-6 6 6 6' : ''
  const trait = double ? 'M2 12h20' : 'M3 12h15'
  return `<svg class="fleche" width="${taille}mm" height="${taille}mm" viewBox="0 0 24 24" aria-hidden="true"><path d="${trait}${tete}${teteGauche}" fill="none" stroke="#1d4e9e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

/** Les cartes en grille ou en suite : une rangée par ligne de la grille, centrée dans la zone. */
function dessinerGrille(cartes: readonly Carte[], zone: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[], options: OptionsCartes): string {
  const d = meilleureDisposition(cartes, zone, ctx, langues, options)
  const rangees: string[] = []
  for (let r = 0; r < d.rangs; r++) {
    const ligne = cartes.slice(r * d.colonnes, (r + 1) * d.colonnes)
    const cases = ligne.map((c, i) => {
      const apres = d.fleche && i < ligne.length - 1 ? `<span class="entre" style="width:${d.fleche + ECART}mm">${fleche(d.fleche, options.enchainement === 'aller-retour')}</span>` : ''
      // sans flèche, l'écart entre deux cartes est la marge de la première ; avec, la flèche occupe l'écart
      const marge = !d.fleche && i < ligne.length - 1 ? `;margin-right:${ECART}mm` : ''
      return `<div class="carte-m" style="width:${d.l}mm;height:${d.hCarte}mm${marge}">${htmlCarte(c, d, ctx, langues)}</div>${apres}`
    }).join('')
    rangees.push(`<div class="rangee-m" style="gap:0;margin-bottom:${ECART}mm">${cases}</div>`)
  }
  return `<div class="cartes-m" style="width:${zone.W}mm;height:${zone.H}mm">${rangees.join('')}</div>`
}

/** Les cartes en cercle, une flèche entre chaque carte et la suivante (le cycle se referme). */
function dessinerCycle(cartes: readonly Carte[], { W, H }: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[]): string {
  const n = cartes.length
  // la carte : un tiers de la zone au plus ; l'ellipse des centres laisse la place de la carte
  const cote = Math.min(W, H) * (n <= 4 ? 0.36 : 0.3)
  // la place d'une carte seule : la grille d'une colonne de `n` cartes de cette hauteur
  const hUne = cote * 1.15
  const d = disposer(cartes, { W: cote, H: hUne * n + (n - 1) * ECART }, ctx, langues, 1, false)
  const rx = (W - d.l) / 2, ry = (H - d.h) / 2
  const centre = { x: W / 2, y: H / 2 }
  const position = (i: number): { x: number, y: number } => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: centre.x + rx * Math.cos(angle), y: centre.y + ry * Math.sin(angle) }
  }
  const blocs = cartes.map((c, i) => {
    const p = position(i)
    return `<div class="carte-m" style="position:absolute;left:${p.x - d.l / 2}mm;top:${p.y - d.hCarte / 2}mm;width:${d.l}mm;height:${d.hCarte}mm">${htmlCarte(c, d, ctx, langues)}</div>`
  }).join('')
  // les flèches : au milieu du segment entre deux cartes voisines, tournées de l'une vers l'autre (le sens des aiguilles d'une montre)
  const fleches = cartes.map((_, i) => {
    const depart = position(i), arrivee = position((i + 1) % n)
    const x = (depart.x + arrivee.x) / 2, y = (depart.y + arrivee.y) / 2
    const angle = Math.atan2(arrivee.y - depart.y, arrivee.x - depart.x) * 180 / Math.PI
    const taille = Math.min(d.l, d.hCarte) * 0.3
    return `<span class="fleche-cycle" style="left:${x - taille / 2}mm;top:${y - taille / 2}mm;transform:rotate(${angle}deg)">${fleche(taille)}</span>`
  }).join('')
  return `<div class="cartes-m cycle" style="position:relative;width:${W}mm;height:${H}mm">${blocs}${fleches}</div>`
}

export function dessinerCartes(cartes: readonly Carte[], zone: { W: number, H: number }, ctx: ContexteDessin, options: OptionsCartes): string {
  if (options.enchainement === 'cycle') return dessinerCycle(cartes, zone, ctx, options.langues)
  return dessinerGrille(cartes, zone, ctx, options.langues, options)
}

export const CSS_CARTES = `
  .cartes-m { display: flex; flex-direction: column; justify-content: center; }
  .rangee-m { display: flex; align-items: center; justify-content: center; }
  .rangee-m:last-child { margin-bottom: 0 !important; }
  .carte-m { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; box-sizing: border-box; border: .4mm solid #cfd6df; border-radius: 3mm; background: #fff; text-align: center; line-height: 1.2; flex: none; }
  .carte-m svg { display: block; flex: none; }
  .vignette { display: flex; align-items: center; justify-content: center; flex: none; }
  .aplat { border: .3mm solid rgba(0, 0, 0, .15); box-sizing: border-box; display: flex; align-items: center; justify-content: center; border-radius: 4mm; }
  .rond { display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #fff; }
  .numero { position: absolute; top: 2mm; left: 2mm; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #1d4e9e; color: #fff; font-weight: 700; line-height: 1; }
  .carte-m .mot { white-space: nowrap; font-weight: 600; color: #222; }
  .carte-m .mot.l1, .carte-m .precision.l1 { color: #1d4e9e; }
  .carte-m .precision { white-space: nowrap; color: #555; }
  .entre { display: flex; align-items: center; justify-content: center; flex: none; }
  .fleche-cycle { position: absolute; display: block; line-height: 0; }
  .fleche { display: block; }`

/** Le titre d'une page : celui de la variante dans chaque langue de la feuille (`lot.<variante>`), sauf titre personnalisé. */
export function titreDeLaPage(r: { titre: string, variante: string, langues: readonly string[] }, ctx: ContexteDessin): string {
  if (r.titre) return r.titre
  return r.langues.map(langue => ctx.Tde(langue)(`lot.${r.variante}`)).join(' · ')
}
