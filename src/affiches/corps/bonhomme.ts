// Le bonhomme : un corps entier dessiné (tête, cou, tronc, ventre, bras, main, jambe, pied) avec une étiquette reliée à chaque partie par un trait,
// pour nommer ce qu'aucun emoji ne montre (le cou, le tronc, le ventre : programme de la MS, « placer les pièces d'un puzzle du corps »). Pur : la mesure du texte
// vient du contexte. Le dessin tient dans un cadre de 100 × 150 (unités du bonhomme) ; les étiquettes sont de part et d'autre, une ligne par langue de la feuille.
import type { ContexteDessin } from '../types.ts'
import { echapper } from '../../utils/html.js'
import { tailleQuiTient } from '../listeMots.ts'

const LARGEUR = 100, HAUTEUR = 150
const PEAU = '#ffe0b2', HAUT = '#90caf9', CONTOUR = '#37474f'

/** Une partie du corps nommée : son identifiant (texte `mot.<id>`), le côté de l'étiquette et le point visé dans le dessin. */
interface Partie { id: string, cote: 'gauche' | 'droite', x: number, y: number }

/** Les étiquettes, du haut vers le bas de chaque côté ; (x, y) est le point du bonhomme que le trait désigne. */
const PARTIES: readonly Partie[] = [
  { id: 'tete', cote: 'droite', x: 60, y: 14 },
  { id: 'cou', cote: 'gauche', x: 47, y: 34 },
  { id: 'bras', cote: 'droite', x: 79, y: 58 },
  { id: 'tronc', cote: 'gauche', x: 38, y: 52 },
  { id: 'ventre', cote: 'droite', x: 56, y: 74 },
  { id: 'main', cote: 'gauche', x: 13, y: 86 },
  { id: 'jambe', cote: 'gauche', x: 39, y: 112 },
  { id: 'pied', cote: 'droite', x: 69, y: 137 },
]

/** Un membre : un trait épais arrondi, contour sombre puis couleur (le contour dépasse un peu de chaque côté). */
function membre(x1: number, y1: number, x2: number, y2: number, epaisseur: number, couleur: string): string {
  const trait = (largeur: number, teinte: string): string => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${teinte}" stroke-width="${largeur}" stroke-linecap="round"/>`
  return `${trait(epaisseur + 2.4, CONTOUR)}${trait(epaisseur, couleur)}`
}

/** Le bonhomme lui-même, dans un cadre de 100 × 150. */
function figure(): string {
  const bras = membre(30, 44, 14, 80, 8, PEAU) + membre(70, 44, 86, 80, 8, PEAU)
  const jambes = membre(41, 86, 39, 126, 11, PEAU) + membre(59, 86, 61, 126, 11, PEAU)
  const mains = [13, 87].map(x => `<circle cx="${x}" cy="84" r="5.5" fill="${PEAU}" stroke="${CONTOUR}" stroke-width="1.2"/>`).join('')
  const pieds = [36, 64].map(x => `<ellipse cx="${x}" cy="135" rx="10" ry="5" fill="#8d6e63" stroke="${CONTOUR}" stroke-width="1.2"/>`).join('')
  const cou = `<rect x="45" y="28" width="10" height="11" fill="${PEAU}" stroke="${CONTOUR}" stroke-width="1.2"/>`
  const tronc = `<rect x="30" y="38" width="40" height="48" rx="9" fill="${HAUT}" stroke="${CONTOUR}" stroke-width="1.2"/>`
  const ventre = `<ellipse cx="50" cy="72" rx="13" ry="10" fill="#bbdefb"/><circle cx="50" cy="73" r="1.4" fill="${CONTOUR}"/>`
  const tete = `<circle cx="50" cy="16" r="13" fill="${PEAU}" stroke="${CONTOUR}" stroke-width="1.2"/>`
    + `<circle cx="45" cy="14" r="1.6" fill="${CONTOUR}"/><circle cx="55" cy="14" r="1.6" fill="${CONTOUR}"/>`
    + `<path d="M44 20 Q50 25 56 20" fill="none" stroke="${CONTOUR}" stroke-width="1.3" stroke-linecap="round"/>`
  return `${jambes}${pieds}${bras}${mains}${cou}${tronc}${ventre}${tete}`
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
