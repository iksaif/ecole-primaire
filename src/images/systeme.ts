// Le caractère emoji d'un code OpenMoji, pour la famille « emojis du système ». Les codes de tables.ts sont ceux des fichiers
// OpenMoji : points de code en hexadécimal séparés par `-`, sans le sélecteur de variante FE0F. Un emoji n'a pas de caractère
// quand il n'existe pas dans Unicode : dessin maison (`maison:…`) ou extra d'OpenMoji (zone d'usage privé, E000 à F8FF). Et le rendu
// d'un tel caractère, dans un SVG ou du HTML, partagé par les contenus (rendu.ts) et l'interface (icone.ts) : ce module n'importe aucun dessin.

import { EMOJIS } from './tables.ts'
import type { NomEmoji } from './tables.ts'

/** Le sélecteur de variante « présentation emoji » : sans lui, ☀ ou 🍽 s'affichent parfois en noir, comme du texte. */
const SELECTEUR_EMOJI = 0xfe0f
const USAGE_PRIVE = { debut: 0xe000, fin: 0xf8ff }

/** Un point de code emoji qui s'affiche en texte par défaut (propriété Unicode Emoji_Presentation absente) : il lui faut FE0F. */
function texteParDefaut(point: number): boolean {
  const caractere = String.fromCodePoint(point)
  return /\p{Emoji}/u.test(caractere) && !/\p{Emoji_Presentation}/u.test(caractere)
}

/** Le caractère emoji d'un code (`1F34E` → 🍎, `2600` → ☀️, `1F408-200D-2B1B` → 🐈‍⬛), ou null s'il n'y en a pas. */
export function caractereDe(code: string): string | null {
  if (code.startsWith('maison:')) return null
  const points = code.split('-').map(p => parseInt(p, 16))
  if (points.some(p => Number.isNaN(p))) return null
  if (points.some(p => p >= USAGE_PRIVE.debut && p <= USAGE_PRIVE.fin)) return null
  const avecSelecteur: number[] = []
  points.forEach((point, i) => {
    avecSelecteur.push(point)
    // un sélecteur après chaque élément « texte » (☀, ♂ dans 🏃‍♂️), sauf s'il est déjà là
    const suivant = points[i + 1]
    if (texteParDefaut(point) && suivant !== SELECTEUR_EMOJI) avecSelecteur.push(SELECTEUR_EMOJI)
  })
  return String.fromCodePoint(...avecSelecteur)
}

/** Les polices d'emojis des systèmes courants, pour la famille « système ». */
export const POLICES_EMOJI = `'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', sans-serif`
/** Un emoji du système occupe un peu plus que sa taille de police : il tient dans le carré à ce corps-là. */
export const CORPS_SYSTEME = 0.84

export const arrondi = (n: number): number => Math.round(n * 100) / 100

export const echapperAttribut = (texte: string): string => texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Les attributs d'accessibilité : lu par les lecteurs d'écran (`alt`), ou décoratif. */
export const accessibilite = (alt: string | undefined): string => (alt ? `role="img" aria-label="${echapperAttribut(alt)}"` : 'aria-hidden="true"')

/** Un emoji du système dans un SVG : le caractère centré dans le carré. */
export function systemeSvg(caractere: string, x: number, y: number, taille: number): string {
  const centre = (debut: number): number => arrondi(debut + taille / 2)
  return `<text x="${centre(x)}" y="${centre(y)}" font-size="${arrondi(taille * CORPS_SYSTEME)}" text-anchor="middle" dominant-baseline="central" font-family="${POLICES_EMOJI.replace(/'/g, '&apos;')}">${caractere}</text>`
}

/** Un emoji du système dans du HTML : le caractère seul s'il suit le texte, sinon centré dans un carré de la taille demandée. */
export function systemeHtml(caractere: string, taille: string | undefined, alt: string | undefined): string {
  if (taille === undefined && !alt) return caractere
  if (taille === undefined) return `<span ${accessibilite(alt)}>${caractere}</span>`
  const style = `display:inline-block;width:${taille};height:${taille};line-height:${taille};text-align:center;vertical-align:middle;font-size:calc(${taille} * ${CORPS_SYSTEME});font-family:${POLICES_EMOJI}`
  return `<span ${accessibilite(alt)} style="${style.replace(/"/g, '&quot;')}">${caractere}</span>`
}

/**
 * Le caractère d'un emoji du vocabulaire, pour l'écrire dans une phrase (un message, une lecture à voix haute) : là, seul du texte va.
 * Vide pour un emoji qui n'en a pas (dessin maison, extra d'OpenMoji).
 */
export const caractereEmoji = (nom: NomEmoji): string => caractereDe(EMOJIS[nom]) ?? ''
