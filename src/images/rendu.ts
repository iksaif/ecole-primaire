// Le rendu des emojis selon la préférence « Images » (preference.ts) : OpenMoji en couleur ou en contour, nos dessins maison au même
// style (src/images/maison/), ou les emojis du système de l'appareil. Fonctions pures qui rendent une chaîne : lisibles par node
// (build des PDF, instantanés) comme par le navigateur. Les dessins OpenMoji sont dans le code (src/images/donnees/, générés par
// scripts/generer/images.ts) : aucun fichier ni requête, et le même rendu à l'écran, dans l'aperçu et dans le PDF.
//
// Une fiche ou une affiche ne choisit pas : elle reçoit le rendu (`ctx.images` pour une affiche, `imagesDe(params)` pour une fiche)
// et appelle `svg(…)` ou `html(…)`. Seul src/images/ produit une balise d'image ; seuls le noyau et le cadre des affiches appellent
// creerRenduImages (règle ESLint, src/images/README.md).
// OpenMoji : https://openmoji.org, licence CC BY-SA 4.0 (LICENCE-CONTENU.md, page « À propos »).
import { COULEUR } from './donnees/couleur.ts'
import { CONTOUR } from './donnees/contour.ts'
import { EMOJIS, SCENES } from './tables.ts'
import type { NomEmoji } from './tables.ts'
import { caractereDe } from './systeme.ts'
import { DEFAUT_IMAGES } from './preference.ts'
import type { ImagesFiche, StyleImages } from './preference.ts'

/** Le dessin d'un emoji tient dans un carré de 72 × 72. */
const COTE = 72

/** Les polices d'emojis des systèmes courants, pour la famille « système ». */
const POLICES_EMOJI = `'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', sans-serif`
/** Un emoji du système occupe un peu plus que sa taille de police : il tient dans le carré à ce corps-là. */
const CORPS_SYSTEME = 0.84

const DONNEES: Record<StyleImages, Readonly<Record<string, string>>> = { couleur: COULEUR, contour: CONTOUR }

/** Les emojis rendus, selon la préférence. */
export interface RenduImages {
  readonly preference: ImagesFiche
  /** Un emoji dans un SVG : carré de côté `taille` (unités du SVG) dont le coin haut gauche est en (x, y). */
  svg(nom: NomEmoji, x: number, y: number, taille: number): string
  /**
   * Un emoji dans du HTML, de côté `taille` (n'importe quelle unité CSS : `8mm`, `1.2em`). Sans `taille`, il suit le texte (1em) ; en
   * famille « système », c'est alors le caractère seul, sans balise. `alt` : le mot visé, lu par les lecteurs d'écran ; sans `alt`,
   * l'image est décorative (le mot est écrit à côté).
   */
  html(nom: NomEmoji, taille?: string, alt?: string): string
  /** Vrai si au moins un emoji a été rendu : le formulaire n'offre le choix des images qu'aux documents qui en ont. */
  readonly employe: boolean
}

const arrondi = (n: number): number => Math.round(n * 100) / 100
const echapperAttribut = (texte: string): string => texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Le code d'un emoji de la table ; un nom inconnu (venu d'un JavaScript non vérifié) échoue en disant lequel. */
function codeDe(nom: NomEmoji): string {
  const code: string | undefined = EMOJIS[nom]
  if (!code) throw new Error(`Emoji « ${nom} » absent de src/images/tables.ts`)
  return code
}

/** La source d'un emoji, pour les crédits (`data-image`, lu par les propriétés des PDF) : OpenMoji, ou un dessin maison. */
const sourceDe = (nom: NomEmoji): string => (codeDe(nom).startsWith('maison:') ? 'maison' : 'openmoji')

/** Le dessin d'un emoji dans un style (jamais vide : le script d'import échoue si un dessin manque). */
function dessinDe(nom: NomEmoji, style: StyleImages): string {
  const dessin = DONNEES[style][codeDe(nom)]
  if (!dessin) throw new Error(`Emoji « ${nom} » absent de src/images/donnees/${style}.ts : lancer node scripts/generer/images.ts`)
  return dessin
}

/** Les attributs d'accessibilité : lu par les lecteurs d'écran (`alt`), ou décoratif. */
const accessibilite = (alt: string | undefined): string => (alt ? `role="img" aria-label="${echapperAttribut(alt)}"` : 'aria-hidden="true"')

function openmojiSvg(nom: NomEmoji, style: StyleImages, x: number, y: number, taille: number): string {
  return `<svg x="${arrondi(x)}" y="${arrondi(y)}" width="${arrondi(taille)}" height="${arrondi(taille)}" viewBox="0 0 ${COTE} ${COTE}" data-image="${sourceDe(nom)}">${dessinDe(nom, style)}</svg>`
}

function openmojiHtml(nom: NomEmoji, style: StyleImages, taille: string, alt: string | undefined): string {
  // une scène (le lever du soleil) est un carré plein : coins arrondis, comme une vignette
  const coins = SCENES.includes(nom) ? ' style="border-radius:12%"' : ''
  return `<svg ${accessibilite(alt)} width="${taille}" height="${taille}" viewBox="0 0 ${COTE} ${COTE}"${coins} data-image="${sourceDe(nom)}">${dessinDe(nom, style)}</svg>`
}

/** Un emoji du système dans un SVG : le caractère centré dans le carré. */
function systemeSvg(caractere: string, x: number, y: number, taille: number): string {
  const centre = (debut: number): number => arrondi(debut + taille / 2)
  return `<text x="${centre(x)}" y="${centre(y)}" font-size="${arrondi(taille * CORPS_SYSTEME)}" text-anchor="middle" dominant-baseline="central" font-family="${POLICES_EMOJI.replace(/'/g, '&apos;')}">${caractere}</text>`
}

/** Un emoji du système dans du HTML : le caractère seul s'il suit le texte, sinon centré dans un carré de la taille demandée. */
function systemeHtml(caractere: string, taille: string | undefined, alt: string | undefined): string {
  if (taille === undefined && !alt) return caractere
  if (taille === undefined) return `<span ${accessibilite(alt)}>${caractere}</span>`
  const style = `display:inline-block;width:${taille};height:${taille};line-height:${taille};text-align:center;vertical-align:middle;font-size:calc(${taille} * ${CORPS_SYSTEME});font-family:${POLICES_EMOJI}`
  return `<span ${accessibilite(alt)} style="${style.replace(/"/g, '&quot;')}">${caractere}</span>`
}

/**
 * Le rendu des emojis pour une préférence. Un emoji sans caractère du système (dessin maison, extra d'OpenMoji) reste dessiné par
 * OpenMoji quelle que soit la famille : mieux qu'un carré vide ; en famille « système », toujours en couleur, comme ses voisins.
 */
export function creerRenduImages(preference: ImagesFiche = DEFAUT_IMAGES): RenduImages {
  let employe = false
  // les emojis du système n'existent qu'en couleur : un dessin OpenMoji de repli parmi eux est en couleur aussi
  const style: StyleImages = preference.famille === 'systeme' ? 'couleur' : preference.style
  /** Le caractère à écrire en famille « système », ou null pour dessiner l'OpenMoji. */
  const caractereSysteme = (nom: NomEmoji): string | null => {
    employe = true
    if (preference.famille !== 'systeme') return null
    return caractereDe(codeDe(nom))
  }
  return {
    preference,
    svg(nom, x, y, taille) {
      const caractere = caractereSysteme(nom)
      if (caractere) return systemeSvg(caractere, x, y, taille)
      return openmojiSvg(nom, style, x, y, taille)
    },
    html(nom, taille, alt) {
      const caractere = caractereSysteme(nom)
      if (caractere) return systemeHtml(caractere, taille, alt)
      return openmojiHtml(nom, style, taille ?? '1em', alt)
    },
    get employe() { return employe },
  }
}

/**
 * Le rendu des emojis d'une fiche d'exercice, selon la préférence que la page lui donne (`images` de ParamsFiche, useFicheExercice),
 * sinon le défaut, OpenMoji en couleur (build des PDF publiés, instantanés, tests).
 *   const images = imagesDe(params)        // dans fiche.ts d'un exercice
 *   images.html('pomme', '12mm', 'pomme')
 */
export function imagesDe(params: { images?: ImagesFiche }): RenduImages {
  return creerRenduImages(params.images ?? DEFAUT_IMAGES)
}
