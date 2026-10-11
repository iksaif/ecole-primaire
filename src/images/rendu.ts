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
import { accessibilite, arrondi, caractereDe, systemeHtml, systemeSvg } from './systeme.ts'
import { DEFAUT_IMAGES } from './preference.ts'
import type { ImagesFiche, StyleImages } from './preference.ts'

/** Le dessin d'un emoji tient dans un carré de 72 × 72. */
const COTE = 72


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


function openmojiSvg(nom: NomEmoji, style: StyleImages, x: number, y: number, taille: number): string {
  return `<svg x="${arrondi(x)}" y="${arrondi(y)}" width="${arrondi(taille)}" height="${arrondi(taille)}" viewBox="0 0 ${COTE} ${COTE}" data-image="${sourceDe(nom)}">${dessinDe(nom, style)}</svg>`
}

function openmojiHtml(nom: NomEmoji, style: StyleImages, taille: string, alt: string | undefined): string {
  // une scène (le lever du soleil) est un carré plein : coins arrondis, comme une vignette
  const coins = SCENES.includes(nom) ? ' style="border-radius:12%"' : ''
  return `<svg ${accessibilite(alt)} width="${taille}" height="${taille}" viewBox="0 0 ${COTE} ${COTE}"${coins} data-image="${sourceDe(nom)}">${dessinDe(nom, style)}</svg>`
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
