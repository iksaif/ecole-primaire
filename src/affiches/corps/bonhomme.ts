// Le bonhomme : un corps entier dessiné (tête, cou, tronc, ventre, bras, main, jambe, pied) avec une étiquette reliée à chaque partie par un trait,
// pour nommer ce qu'aucun emoji ne montre (le cou, le tronc, le ventre : programme de la MS, « placer les pièces d'un puzzle du corps »). Pur : la mesure du texte
// vient du contexte. Le dessin tient dans un cadre de 100 × 150 (unités du bonhomme) ; les étiquettes sont de part et d'autre, une ligne par langue de la feuille.
import type { ContexteDessin } from '../types.ts'
import { echapper } from '../../utils/html.js'
import { tailleQuiTient } from '../listeMots.ts'

const LARGEUR = 100, HAUTEUR = 150
// Palette et trait d'OpenMoji (https://openmoji.org/styleguide) : contour noir épais et arrondi, aplats, peau jaune avec une ombre orangée.
const PEAU = '#fcea2b', OMBRE = '#f1b15d', HAUT = '#61b2e4', SHORT = '#92d3f5', CHAUSSURE = '#ea5a47', CHEVEUX = '#a57939', CONTOUR = '#000'
const TRAIT = 2.2

/** Une partie du corps nommée : son identifiant (texte `mot.<id>`), le côté de l'étiquette et le point visé dans le dessin. */
interface Partie { id: string, cote: 'gauche' | 'droite', x: number, y: number }

/** Les étiquettes, du haut vers le bas de chaque côté ; (x, y) est le point du bonhomme que le trait désigne. */
const PARTIES: readonly Partie[] = [
  { id: 'tete', cote: 'droite', x: 60, y: 14 },
  { id: 'cou', cote: 'gauche', x: 47, y: 34 },
  { id: 'bras', cote: 'droite', x: 79, y: 58 },
  { id: 'tronc', cote: 'gauche', x: 36, y: 52 },
  { id: 'ventre', cote: 'droite', x: 57, y: 74 },
  { id: 'main', cote: 'gauche', x: 13, y: 86 },
  { id: 'jambe', cote: 'gauche', x: 39, y: 112 },
  { id: 'pied', cote: 'droite', x: 69, y: 137 },
]

/** Un membre : un trait épais arrondi, contour noir puis couleur (le contour dépasse de chaque côté). */
function membre(x1: number, y1: number, x2: number, y2: number, epaisseur: number, couleur: string): string {
  const trait = (largeur: number, teinte: string): string => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${teinte}" stroke-width="${largeur}" stroke-linecap="round"/>`
  return `${trait(epaisseur + 2 * TRAIT, CONTOUR)}${trait(epaisseur, couleur)}`
}

/** Une forme fermée au style OpenMoji : aplat et contour noir arrondi. */
const forme = (balise: string, attributs: string, fond: string): string =>
  `<${balise} ${attributs} fill="${fond}" stroke="${CONTOUR}" stroke-width="${TRAIT}" stroke-linejoin="round" stroke-linecap="round"/>`

/**
 * Le bonhomme, dans un cadre de 100 × 150, au style d'OpenMoji. Le tronc va des épaules à la taille : le haut est caché par un tee-shirt court, le
 * bas laisse voir le ventre (peau, avec le nombril) — le tronc entier est donc visible, et le ventre se distingue de la poitrine.
 */
function figure(): string {
  const jambes = membre(41, 90, 39, 124, 12, SHORT) + membre(59, 90, 61, 124, 12, SHORT)
  const pieds = [34, 66].map(x => forme('ellipse', `cx="${x}" cy="136" rx="11" ry="5.5"`, CHAUSSURE)).join('')
  const bras = membre(30, 46, 15, 80, 8, PEAU) + membre(70, 46, 85, 80, 8, PEAU)
  const mains = [14, 86].map(x => forme('circle', `cx="${x}" cy="85" r="6"`, PEAU)).join('')
  const cou = forme('rect', 'x="45" y="28" width="10" height="12"', OMBRE)
  // le tronc : peau, puis le tee-shirt court sur la moitié haute, puis le short à la taille
  const tronc = forme('rect', 'x="30" y="38" width="40" height="52" rx="9"', PEAU)
  const teeShirt = forme('path', 'd="M30 47 Q30 38 39 38 H61 Q70 38 70 47 V66 H30 Z"', HAUT)
  const short = forme('rect', 'x="30" y="82" width="40" height="12" rx="4"', SHORT)
  const nombril = `<path d="M47.5 75 Q50 78 52.5 75" fill="none" stroke="${CONTOUR}" stroke-width="1.6" stroke-linecap="round"/>`
  const tete = forme('circle', 'cx="50" cy="17" r="14"', PEAU)
    + forme('path', 'd="M36.5 15 Q37 3 50 3 Q63 3 63.5 15 Q56 9 50 10 Q44 9 36.5 15 Z"', CHEVEUX)
    + `<circle cx="44.5" cy="19" r="1.8" fill="${CONTOUR}"/><circle cx="55.5" cy="19" r="1.8" fill="${CONTOUR}"/>`
    + `<path d="M44 24.5 Q50 29 56 24.5" fill="none" stroke="${CONTOUR}" stroke-width="1.8" stroke-linecap="round"/>`
  return `${jambes}${pieds}${bras}${mains}${cou}${tronc}${teeShirt}${nombril}${short}${tete}`
}

/** Le bonhomme et ses étiquettes, centrés dans la zone `{ W, H }` (mm). */
export function dessinerBonhomme({ W, H }: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[]): string {
  const echelle = Math.min(H / HAUTEUR, (W * 0.5) / LARGEUR)
  const xFigure = (W - LARGEUR * echelle) / 2, yFigure = (H - HAUTEUR * echelle) / 2
  const marge = 4, largeurEtiquette = xFigure - marge * 2
  // la taille du texte : celle du plus long mot de chaque langue, dans la place d'une étiquette
  const tailles = langues.map(langue => tailleQuiTient(PARTIES.map(p => ctx.Tde(langue)(`mot.${p.id}`)), ctx.nomPolice(), largeurEtiquette, Math.min(H * 0.055, 9), ctx))
  const hauteurLigne = (i: number): number => tailles[i] * 1.25

  // la hauteur d'une étiquette (une ligne par langue), et la hauteur où elle se place : à celle du point visé, poussée vers le bas
  // si l'étiquette du dessus la gêne, puis remontée si elle sort de la zone (les traits deviennent obliques)
  const hauteurBloc = langues.reduce((somme, _, i) => somme + hauteurLigne(i), 0)
  const ecartMin = hauteurBloc * 1.15
  const hauteurs = new Map<string, number>()
  for (const cote of ['gauche', 'droite'] as const) {
    const duCote = PARTIES.filter(p => p.cote === cote).sort((a, b) => a.y - b.y)
    let precedente = -Infinity
    for (const p of duCote) {
      const y = Math.max(yFigure + p.y * echelle, precedente + ecartMin)
      hauteurs.set(p.id, y)
      precedente = y
    }
    // si la dernière sort par le bas, tout remonte d'autant
    const derniere = hauteurs.get(duCote[duCote.length - 1].id) ?? 0
    const debordement = derniere + hauteurBloc / 2 - H
    if (debordement > 0) for (const p of duCote) hauteurs.set(p.id, (hauteurs.get(p.id) ?? 0) - debordement)
  }

  const etiquettes = PARTIES.map(p => {
    const bord = p.cote === 'gauche' ? xFigure - marge : xFigure + LARGEUR * echelle + marge
    const ancre = p.cote === 'gauche' ? 'end' : 'start'
    const cibleX = xFigure + p.x * echelle, cibleY = yFigure + p.y * echelle
    const centre = hauteurs.get(p.id) ?? cibleY
    let y = centre - hauteurBloc / 2
    const lignes = langues.map((langue, i) => {
      const ligne = `<text x="${bord}" y="${y + hauteurLigne(i) / 2}" font-size="${tailles[i]}" text-anchor="${ancre}" dominant-baseline="central" fill="${i === 0 ? '#222' : '#1d4e9e'}" font-weight="600">${echapper(ctx.Tde(langue)(`mot.${p.id}`))}</text>`
      y += hauteurLigne(i)
      return ligne
    }).join('')
    const departX = p.cote === 'gauche' ? bord + 1 : bord - 1
    return `${lignes}<line x1="${departX}" y1="${centre}" x2="${cibleX}" y2="${cibleY}" stroke="#1d4e9e" stroke-width="0.5"/><circle cx="${cibleX}" cy="${cibleY}" r="1.1" fill="#1d4e9e"/>`
  }).join('')

  return `<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" role="img"><g transform="translate(${xFigure} ${yFigure}) scale(${echelle})">${figure()}</g>${etiquettes}</svg>`
}
