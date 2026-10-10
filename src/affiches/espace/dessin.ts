// Le dessin des repères d'espace : six cartes (dans, sur, sous, devant, derrière, à côté), chacune une petite scène où un chat est placé par
// rapport à une boîte, une table, un mur ou un arbre. Le chat et l'arbre sont des emojis OpenMoji (src/images/), la boîte et la table sont dessinées ici.
// Dessin commun des cartes : src/affiches/cartes.ts. Une scène tient dans un carré de 100 × 100 ; l'ordre de dessin fait « devant » et « derrière ».
import type { ContexteDessin, Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte } from '../cartes.ts'
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

/** Les scènes, dans l'ordre de la feuille. Chacune : le contenu SVG d'un carré de 100 × 100, avec les emojis du rendu choisi. */
function scenes(images: ContexteDessin['images']): Readonly<Record<string, string>> {
  const emoji = images.svg
  return {
    dans: `${SOL}${BOITE_FOND}${emoji('chat', 28, 22, 44)}${BOITE_AVANT}`,
    sur: `${SOL}${table(58)}${emoji('chat', 28, 16, 44)}`,
    sous: `${SOL}${table(24)}${emoji('chat', 28, 46, 44)}`,
    // le chat est tout entier devant le mur, ou à moitié caché derrière (même place, même taille : seul l'ordre de dessin change)
    devant: `${SOL}${MUR}${emoji('chat', 40, 44, 46)}`,
    derriere: `${SOL}${emoji('chat', 40, 44, 46)}${MUR}`,
    cote: `${SOL}${emoji('arbre', 2, 14, 66)}${emoji('chat', 60, 46, 36)}`,
    // MS : entre deux arbres ; à gauche, à droite d'un arbre (le chat est à gauche ou à droite de l'arbre, vus de face comme l'enfant regarde la feuille)
    entre: `${SOL}${emoji('arbre', 0, 22, 44)}${emoji('arbre', 56, 22, 44)}${emoji('chat', 36, 46, 30)}`,
    gauche: `${SOL}${emoji('arbre', 40, 12, 56)}${emoji('chat', 4, 50, 34)}`,
    droite: `${SOL}${emoji('arbre', 4, 12, 56)}${emoji('chat', 62, 50, 34)}`,
  }
}

// PS, MS, GS : six repères ; dès la MS, « entre », « à gauche », « à droite » (BO 2021 p. 27 : « au milieu, à droite, à gauche, entre… » à partir de 4 ans)
const REPERES: Readonly<Record<string, readonly string[]>> = {
  reperes: ['dans', 'sur', 'sous', 'devant', 'derriere', 'cote'],
  'reperes-plus': ['dans', 'sur', 'sous', 'devant', 'derriere', 'cote', 'entre', 'gauche', 'droite'],
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const SCENES = scenes(ctx.images)
  const cartes: Carte[] = REPERES[r.variante].map(id => ({
    mot: langue => ctx.Tde(langue)(`mot.${id}`),
    dessin: cote => `<svg width="${cote}mm" height="${cote}mm" viewBox="0 0 100 100" aria-hidden="true">${SCENES[id]}</svg>`,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: 'grille' }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
