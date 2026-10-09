// Les emojis OpenMoji (couleur) rendus en SVG, sans fichier ni requête : le dessin de chaque emoji de `tables.ts` est dans
// `openmoji-donnees.ts` (généré par scripts/generer/images.ts). Fonctions pures : lisibles par node (build des PDF, instantanés)
// comme par le navigateur, et le même rendu partout (écran, aperçu, PDF) — contrairement aux emojis du système.
// OpenMoji : https://openmoji.org, licence CC BY-SA 4.0 (LICENCE-CONTENU.md, page de crédits).
import { OPENMOJI } from './openmoji-donnees.ts'
import { EMOJIS, SCENES } from './tables.ts'
import type { NomEmoji } from './tables.ts'

/** Le dessin d'un emoji tient dans un carré de 72 × 72. */
const COTE = 72

/** Le contenu SVG d'un emoji (jamais vide : le script d'import échoue si un dessin manque). */
function dessinDe(nom: NomEmoji): string {
  const dessin = OPENMOJI[EMOJIS[nom]]
  if (!dessin) throw new Error(`Emoji « ${nom} » absent de openmoji-donnees.ts : lancer node scripts/generer/images.ts`)
  return dessin
}

/** Un emoji dans un SVG : carré de côté `taille` (unités du SVG) dont le coin haut gauche est en (x, y). */
export function emojiSvg(nom: NomEmoji, x: number, y: number, taille: number): string {
  const arrondi = (n: number): number => Math.round(n * 100) / 100
  return `<svg x="${arrondi(x)}" y="${arrondi(y)}" width="${arrondi(taille)}" height="${arrondi(taille)}" viewBox="0 0 ${COTE} ${COTE}" data-image="openmoji">${dessinDe(nom)}</svg>`
}

/**
 * Un emoji dans du HTML : un petit SVG en ligne, de côté `taille` (n'importe quelle unité CSS : `8mm`, `1.2em`). `alt` : le mot visé, lu
 * par les lecteurs d'écran ; sans `alt`, l'image est décorative (le mot est écrit à côté).
 */
export function emojiHtml(nom: NomEmoji, taille: string, alt = ''): string {
  // une scène (le lever du soleil) est un carré plein : coins arrondis, comme une vignette
  const coins = SCENES.includes(nom) ? ' style="border-radius:12%"' : ''
  const acces = alt ? `role="img" aria-label="${alt.replace(/"/g, '&quot;')}"` : 'aria-hidden="true"'
  return `<svg ${acces} width="${taille}" height="${taille}" viewBox="0 0 ${COTE} ${COTE}"${coins} data-image="openmoji">${dessinDe(nom)}</svg>`
}
