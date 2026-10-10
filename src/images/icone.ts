// Le rendu d'une icône d'interface (Phosphor, src/images/icones.ts) : un petit SVG en ligne, de la couleur du texte (currentColor).
// Pur : lisible par node comme par le navigateur. À l'écran, on passe par <Icone> (Icone.vue).
import { BOLD, FILL } from './donnees/icones.ts'
import type { NomIcone } from './icones.ts'

export interface OptionsIcone {
  /** côté, en unité CSS ; par défaut 1.25em : il suit le texte (20 px pour un texte de 16 px), donc le mode enfant aussi */
  taille?: string
  /** ce que dit l'icône quand elle est seule (bouton sans texte) ; sans libellé, elle est décorative (le texte est à côté) */
  libelle?: string
  /** la version pleine, pour un état actif ou sélectionné (icône de REMPLIES) */
  pleine?: boolean
}

const echapperAttribut = (texte: string): string => texte.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Le dessin d'une icône ; une icône inconnue ou sans version pleine échoue en disant laquelle. */
function dessinDe(nom: NomIcone, pleine: boolean): string {
  const dessin = pleine ? FILL[nom] : BOLD[nom]
  if (!dessin) throw new Error(`Icône « ${nom} »${pleine ? ' pleine' : ''} absente de src/images/donnees/icones.ts : l'écrire dans icones.ts (REMPLIES pour la pleine), puis node scripts/generer/icones.ts`)
  return dessin
}

/** Une icône en HTML. */
export function iconeHtml(nom: NomIcone, { taille = '1.25em', libelle, pleine = false }: OptionsIcone = {}): string {
  const acces = libelle ? `role="img" aria-label="${echapperAttribut(libelle)}"` : 'aria-hidden="true"'
  return `<svg ${acces} class="icone" width="${taille}" height="${taille}" viewBox="0 0 256 256" fill="currentColor" focusable="false">${dessinDe(nom, pleine)}</svg>`
}

/** Une icône dans un SVG : carré de côté `taille` (unités du SVG) dont le coin haut gauche est en (x, y), décorative. */
export function iconeSvg(nom: NomIcone, x: number, y: number, taille: number, pleine = false): string {
  return `<svg x="${x}" y="${y}" width="${taille}" height="${taille}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${dessinDe(nom, pleine)}</svg>`
}
