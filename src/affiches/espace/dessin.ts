// Le dessin des repères d'espace : six cartes (dans, sur, sous, devant, derrière, à côté), chacune une petite scène où un chat est placé par
// rapport à une boîte, une table, un mur ou un arbre. Le chat et l'arbre sont des emojis OpenMoji (src/images/), la boîte et la table sont dessinées ici.
// Dessin commun des cartes : src/affiches/cartes.ts. Une scène tient dans un carré de 100 × 100 ; l'ordre de dessin fait « devant » et « derrière ».
import type { Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte } from '../cartes.ts'
import { emojiSvg } from '../../images/openmoji.ts'
import type { Reglages } from './definition.ts'

const SOL = '<line x1="4" y1="90" x2="96" y2="90" stroke="#8d6e63" stroke-width="2" stroke-linecap="round"/>'
const BOIS = '#c68642'
const CONTOUR = '#3e2723'

/** Une table de profil : un plateau (dessus à `haut`) et deux pieds jusqu'au sol. */
function table(haut: number): string {
  const plateau = `<rect x="12" y="${haut}" width="76" height="7" rx="2" fill="${BOIS}" stroke="${CONTOUR}" stroke-width="1.5"/>`
  const pied = (x: number): string => `<rect x="${x}" y="${haut + 7}" width="6" height="${90 - haut - 7}" fill="${BOIS}" stroke="${CONTOUR}" stroke-width="1.5"/>`
  return `${plateau}${pied(16)}${pied(78)}`
}

/** Le fond de la boîte (derrière l'objet) et sa face avant (devant lui) : l'objet posé entre les deux est « dans » la boîte. */
const BOITE_FOND = `<rect x="14" y="48" width="72" height="42" fill="#a1744a" stroke="${CONTOUR}" stroke-width="1.5"/>`
const BOITE_AVANT = `<path d="M14 62 L86 62 L86 90 L14 90 Z" fill="#d2a06b" stroke="${CONTOUR}" stroke-width="1.5"/>`

/** Un mur (ou une grande armoire) : assez large pour cacher la moitié du chat. */
const MUR = `<rect x="22" y="20" width="46" height="70" fill="#b0bec5" stroke="${CONTOUR}" stroke-width="1.5"/><rect x="22" y="20" width="46" height="8" fill="#78909c" stroke="${CONTOUR}" stroke-width="1.5"/>`

/** Les scènes, dans l'ordre de la feuille. Chacune : le contenu SVG d'un carré de 100 × 100. */
const SCENES: Readonly<Record<string, string>> = {
  dans: `${SOL}${BOITE_FOND}${emojiSvg('chat', 28, 22, 44)}${BOITE_AVANT}`,
  sur: `${SOL}${table(58)}${emojiSvg('chat', 28, 16, 44)}`,
  sous: `${SOL}${table(24)}${emojiSvg('chat', 28, 46, 44)}`,
  // le chat est tout entier devant le mur, ou à moitié caché derrière (même place, même taille : seul l'ordre de dessin change)
  devant: `${SOL}${MUR}${emojiSvg('chat', 40, 44, 46)}`,
  derriere: `${SOL}${emojiSvg('chat', 40, 44, 46)}${MUR}`,
  cote: `${SOL}${emojiSvg('arbre', 2, 14, 66)}${emojiSvg('chat', 60, 46, 36)}`,
}

const REPERES = ['dans', 'sur', 'sous', 'devant', 'derriere', 'cote']

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const cartes: Carte[] = REPERES.map(id => ({
    mot: langue => ctx.Tde(langue)(`mot.${id}`),
    dessin: cote => `<svg width="${cote}mm" height="${cote}mm" viewBox="0 0 100 100" aria-hidden="true">${SCENES[id]}</svg>`,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: 'grille' }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
