// Le dessin de l'affiche de l'alphabet : pur (aucun DOM, aucun hasard). Une page par langue de la feuille (toutes les lettres
// en grille), ou une page par lettre (« une lettre par page »). Chaque page est un seul SVG en millimètres ; le texte est
// positionné d'après `contexte.mesure` (largeur, hauteur d'x, de majuscule, de hampe) : la taille des lettres suit la
// police choisie, et node (PDF du build) et le navigateur dessinent la même chose, à l'écart d'estimation près
// (src/affiches/mesure.ts : une marge de 12 à 15 % sur la largeur absorbe les 3 à 8 % d'écart des polices irrégulières).
import { echapper } from '../../utils/html.js'
import { echelleA3 } from '../../impression/affiches/cadre.ts'
import { donneesRegionales } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import type { Traducteur } from '../../noyau/types.ts'
import type { ContexteDessin, Page, Rendu } from '../types.ts'
import { IMAGES, estVoyelle, lettresDe, majuscule } from './lettres.ts'
import type { NomEmoji } from '../../images/tables.ts'
import { H_TITRE } from './definition.ts'
import type { Reglages } from './definition.ts'

type Config = Parameters<Rendu<Reglages>['dessin']>[0]
type Mots = Readonly<Record<string, readonly [string, NomEmoji]>>

const ROUGE = '#d62828', BLEU = '#1d4e9e', NOIR = '#1a1a1a'
const arrondi = (n: number): number => Math.round(n * 1000) / 1000
// espace entre la majuscule et la minuscule (em)
const ECART_SCRIPT = 0.3, ECART_ATTACHE = 0.5

/** Un mot illustré par lettre : ceux de la langue régionale (données vérifiées) ; le français a les siens dans les textes de l'affiche. */
function motsDe(langue: string, lettres: readonly string[], T: Traducteur): Mots {
  const regionale = donneesRegionales(langue as Langue)
  if (regionale) return regionale.mots
  return Object.fromEntries(lettres.flatMap(l => {
    const mot = T(`mot.${l}`)
    return mot === `mot.${l}` || !IMAGES[l] ? [] : [[l, [mot, IMAGES[l]] as const]]
  }))
}

interface Feuille { r: Config, ctx: ContexteDessin, mots: Mots, avecMot: boolean }

// Une série de textes côte à côte, centrée sur `cx` : [texte, largeur en em] ; rend les x de départ
function alignes(largeurs: readonly number[], ecart: number, taille: number, cx: number): number[] {
  const total = (largeurs.reduce((a, b) => a + b, 0) + ecart * (largeurs.length - 1)) * taille
  let x = cx - total / 2
  return largeurs.map(l => { const debut = x; x += (l + ecart) * taille; return debut })
}

const texte = (x: number, y: number, taille: number, police: string, couleur: string, contenu: string, o: { gras?: boolean, base?: boolean } = {}): string =>
  `<text x="${arrondi(x)}" y="${arrondi(y)}" font-size="${arrondi(taille)}" text-anchor="start"${o.base ? '' : ' dominant-baseline="central"'} `
  + `font-family="${echapper(police)}"${o.gras ? ' font-weight="700"' : ''} fill="${couleur}">${echapper(contenu)}</text>`

/** Une carte : la lettre dans chaque écriture choisie, puis son mot illustré. (x, y) : son coin ; w × h : sa taille (mm). */
function carte(l: string, x: number, y: number, w: number, h: number, { r, ctx, mots, avecMot }: Feuille): string {
  const couleur = r.voyelles ? (estVoyelle(l) ? ROUGE : BLEU) : NOIR
  const styles = r.styles as readonly string[]
  const aScript = styles.some(s => s.startsWith('script')), aAttache = styles.some(s => s.startsWith('attache'))
  const hMot = avecMot ? h * 0.2 : 0
  const nbZones = Number(aScript) + Number(aAttache)
  const hZone = (h - hMot - h * 0.06) / Math.max(1, nbZones)
  const { mesure } = ctx
  // la bordure est dans la carte : son trait déborde d'un quart de millimètre, jamais hors de la zone
  let s = `<rect x="${arrondi(x + 0.25)}" y="${arrondi(y + 0.25)}" width="${arrondi(w - 0.5)}" height="${arrondi(h - 0.5)}" rx="3" fill="white" stroke="#c8ccd4" stroke-width="0.5"/>`
  let haut = y + h * 0.03

  if (aScript) {
    const nom = ctx.nomPolice('script'), famille = ctx.police('script'), m = mesure.metriques(nom)
    const parties = [styles.includes('script-maj') ? majuscule(l) : '', styles.includes('script-min') ? l : ''].filter(Boolean)
    const largeurs = parties.map(p => mesure.largeur(p, nom))
    const enEm = largeurs.reduce((a, b) => a + b, 0) + ECART_SCRIPT * (parties.length - 1)
    // la majuscule occupe 62 % de la zone, sans dépasser 85 % de la largeur de la carte
    const taille = Math.min(hZone * 0.62 / m.majuscule, w * 0.85 / Math.max(enEm, 0.1))
    const base = haut + hZone / 2 + m.majuscule * taille / 2
    const xs = alignes(largeurs, ECART_SCRIPT, taille, x + w / 2)
    parties.forEach((p, k) => { s += texte(xs[k], base, taille, famille, couleur, p, { base: true }) })
    haut += hZone
  }

  if (aAttache) {
    const nom = ctx.nomPolice('attache'), famille = ctx.police('attache'), m = mesure.metriques(nom)
    const parties = [styles.includes('attache-maj') ? majuscule(l) : '', styles.includes('attache-min') ? l : ''].filter(Boolean)
    const largeurs = parties.map(p => mesure.largeur(p, nom))
    const enEm = largeurs.reduce((a, b) => a + b, 0) + ECART_ATTACHE * (parties.length - 1)
    // la zone fait 5 interlignes (hauteur d'x = 1 interligne) : ~3 au-dessus de la ligne d'écriture (hampes, majuscules), ~2 en dessous ;
    // l'interligne se réduit si le texte (ex. « C'h c'h ») est trop large pour la carte
    const interligne = Math.min(hZone / 5, w * 0.85 * m.x / Math.max(enEm, 0.1))
    const taille = interligne / m.x
    const haut5 = haut + (hZone - 5 * interligne) / 2
    const base = haut5 + Math.max(3, Math.min(3.25, 0.25 + m.hampe / m.x)) * interligne
    if (r.lignes) {
      for (let k = -3; k <= 2; k++) {
        const ligne = base + k * interligne
        s += `<line x1="${arrondi(x + 0.5)}" y1="${arrondi(ligne)}" x2="${arrondi(x + w - 0.5)}" y2="${arrondi(ligne)}" stroke="${k === 0 ? '#8e9ad8' : '#d3daf5'}" stroke-width="${k === 0 ? 0.3 : 0.15}"/>`
      }
    }
    const xs = alignes(largeurs, ECART_ATTACHE, taille, x + w / 2)
    parties.forEach((p, k) => { s += texte(xs[k], base, taille, famille, couleur, p, { base: true }) })
    haut += hZone
  }

  const mot = avecMot ? mots[l] : undefined
  if (avecMot) {
    s += `<line x1="${arrondi(x + 0.5)}" y1="${arrondi(haut)}" x2="${arrondi(x + w - 0.5)}" y2="${arrondi(haut)}" stroke="#d0d4dc" stroke-width="0.3" stroke-dasharray="1.5 1"/>`
  }
  if (mot) {
    const [texteMot, image] = mot
    const nom = ctx.nomPolice('script'), famille = ctx.police('script')
    // la lettre est mise en couleur (et en gras) dans le mot : avant, lettre, après
    const k = texteMot.indexOf(l)
    const morceaux: [string, boolean][] = k < 0 ? [[texteMot, false]] : [[texteMot.slice(0, k), false], [l, true], [texteMot.slice(k + l.length), false]]
    const segments = morceaux.filter(([t]) => t)
    const largeurs = segments.map(([t, gras]) => mesure.largeur(t, nom, gras))
    const enMot = largeurs.reduce((a, b) => a + b, 0)
    // l'image (un carré de 1,3 em, selon la préférence « Images ») puis un quart d'em puis le mot : 85 % de la largeur de la carte
    // au plus, 42 % de la hauteur de la ligne
    const taille = Math.min(hMot * 0.42, w * 0.85 / (1.3 + 0.25 + enMot))
    const centre = haut + hMot / 2
    let xm = x + w / 2 - (1.3 + 0.25 + enMot) * taille / 2
    const cote = taille * 1.3
    s += ctx.images.svg(image, xm, centre - cote / 2, cote)
    xm += (1.3 + 0.25) * taille
    segments.forEach(([t, gras], i) => {
      s += texte(xm, centre, taille, famille, gras ? couleur : '#444', t, { gras })
      xm += largeurs[i] * taille
    })
  }
  return s
}

const svg = (W: number, H: number, corps: string): string => `<svg width="${arrondi(W)}mm" height="${arrondi(H)}mm" viewBox="0 0 ${arrondi(W)} ${arrondi(H)}">${corps}</svg>`

/** Lignes et colonnes de la grille : 4 lignes de 7 en paysage et 6 de 5 en portrait pour 26 lettres ; moins de lettres, moins de lignes. */
export function grille(n: number, paysage: boolean): { lignes: number, colonnes: number } {
  const lignes = paysage ? (n > 21 ? 4 : n > 12 ? 3 : 2) : (n > 20 ? 6 : n > 12 ? 4 : 3)
  return { lignes, colonnes: Math.ceil(n / lignes) }
}

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T, ctx) => {
  const pages: Page[] = []
  for (const langue of r.langues) {
    const T = ctx.Tde(langue)
    const lettres = lettresDe(langue, r.serie)
    const mots = motsDe(langue, lettres, T)
    const feuille: Feuille = { r, ctx, mots, avecMot: r.mot && lettres.some(l => mots[l]) }
    const titre = r.titre || T(r.serie === 'speciales' ? 'titre.speciales' : 'titre')
    if (r.disposition === 'carte') {
      // une lettre par page, sans titre : la carte prend toute la feuille sous la marge (la place du titre aussi)
      const hauteur = H + H_TITRE * (r.format === 'A3' ? echelleA3('A3') : 1)
      for (const l of lettres) pages.push({ titre: null, corps: svg(W, hauteur, carte(l, 0, 0, W, hauteur, feuille)) })
    } else {
      const { lignes, colonnes } = grille(lettres.length, r.orientation === 'landscape')
      const ecart = r.format === 'A3' ? 3 : 2
      const cw = (W - (colonnes - 1) * ecart) / colonnes, ch = (H - (lignes - 1) * ecart) / lignes
      const cartes = lettres.map((l, i) => carte(l, (i % colonnes) * (cw + ecart), Math.floor(i / colonnes) * (ch + ecart), cw, ch, feuille)).join('')
      pages.push({ titre, corps: svg(W, H, cartes) })
    }
  }
  return pages
}

export const css = 'h1 { color: #333; }\n  svg { display: block; flex: none; }'
