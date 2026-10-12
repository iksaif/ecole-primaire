// Le dessin d'une ceinture en SVG : pur (une chaîne), sans emoji, partagé par les fiches, les affiches et l'écran. Couleur, ou motif en noir et blanc.
// Les motifs sont des <pattern> dont l'id (`ceint-<motif>`) est le même dans tous les dessins d'un document : leurs définitions sont identiques.
import type { CouleurCeinture, Motif, StyleCeinture } from './types.ts'

export interface OptionsDessin {
  couleur: CouleurCeinture
  style: StyleCeinture
  /** noir et blanc : le motif de la couleur remplace sa teinte */
  noirEtBlanc: boolean
  /** largeur CSS du dessin (`30mm`, `100%`) ; la hauteur suit */
  largeur: string
}

const TRAIT = '#333'

// Le motif de chaque couleur en noir et blanc : un fond clair et un trait gris, assez différents à l'impression.
const MOTIFS: Readonly<Record<Motif, string>> = {
  uni: '<rect width="6" height="6" fill="#fff"/>',
  rayures: '<rect width="6" height="6" fill="#fff"/><rect width="2" height="6" fill="#aaa"/>',
  hachures: '<rect width="6" height="6" fill="#fff"/><path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" stroke="#888" stroke-width="1.2"/>',
  points: '<rect width="6" height="6" fill="#fff"/><circle cx="3" cy="3" r="1.4" fill="#555"/>',
  lignes: '<rect width="6" height="6" fill="#fff"/><rect y="2" width="6" height="1.6" fill="#555"/>',
  gris: '<rect width="6" height="6" fill="#999"/>',
  plein: '<rect width="6" height="6" fill="#222"/>',
  quadrillage: '<rect width="6" height="6" fill="#fff"/><path d="M0 3H6M3 0V6" stroke="#666" stroke-width="1"/>',
}

/** Les définitions de motifs d'un dessin (un <pattern> par motif utilisé). */
const definitions = (motif: Motif): string => `<defs><pattern id="ceint-${motif}" width="6" height="6" patternUnits="userSpaceOnUse">${MOTIFS[motif]}</pattern></defs>`

/** Le remplissage : la teinte, ou le motif en noir et blanc. */
const remplissage = (o: OptionsDessin): string => (o.noirEtBlanc ? `url(#ceint-${o.couleur.motif})` : o.couleur.hex)

/** Les formes du dessin dans un cadre de 100 × 40. */
function formes(style: StyleCeinture, fond: string): string {
  const trait = `stroke="${TRAIT}" stroke-width="2.4" stroke-linejoin="round"`
  if (style === 'rond') return `<circle cx="50" cy="20" r="17" fill="${fond}" ${trait}/>`
  if (style === 'bandeau') return `<rect x="3" y="11" width="94" height="18" rx="3" fill="${fond}" ${trait}/>`
  // ruban : la bande, les deux bouts qui pendent, le nœud au milieu
  return `<rect x="3" y="13" width="94" height="14" rx="3" fill="${fond}" ${trait}/>`
    + `<path d="M44 26L36 38L45 38L52 27Z M56 26L64 38L55 38L48 27Z" fill="${fond}" ${trait}/>`
    + `<rect x="41" y="8" width="18" height="24" rx="4" fill="${fond}" ${trait}/>`
}

/** Une ceinture : un SVG autonome (cadre 100 × 40, largeur CSS donnée). */
export function ceintureSvg(o: OptionsDessin): string {
  const motif = o.noirEtBlanc ? definitions(o.couleur.motif) : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" style="width:${o.largeur};height:auto;display:inline-block;vertical-align:middle" role="img" aria-hidden="true" focusable="false">${motif}${formes(o.style, remplissage(o))}</svg>`
}
