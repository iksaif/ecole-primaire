// Le dessin des décompositions d'un nombre n : en tête le total (n en grand et n ronds), puis une rangée par façon de le faire (« 0 et n » à « n et 0 »
// en GS, sans les extrêmes en MS). Chaque rangée montre n ronds : les premiers pleins, les autres creux (lisible aussi en noir et blanc), la couleur
// redoublant la forme ; à gauche les deux chiffres, chacun dans un rond de sa sorte (plein ou creux), pour qu'on ne lise jamais « 33 ». Dix : un petit
// espace entre les deux mains. Une seule colonne de rangées, ou deux en paysage pour que les ronds restent grands. Pur : lisible par node.
import { txt } from '../../impression/affiches/cadre.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

const COULEUR_A = '#d9480f'
const COULEUR_B = '#1d4e9e'

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }) => {
  // les façons de faire n : « 0 et n » à « n et 0 » ; sans le zéro : de 1 à n − 1
  const rangs = r.zero ? Array.from({ length: r.n + 1 }, (_, k) => k) : Array.from({ length: r.n - 1 }, (_, k) => k + 1)
  // le total en tête, au-dessus des rangées
  const hTete = H * 0.12
  const hRangees = H - hTete - 3
  // deux colonnes de rangées seulement en paysage et au-delà de 6 ; sinon une seule
  const colonnes = r.n > 6 && W > H ? 2 : 1
  const parColonne = Math.ceil(rangs.length / colonnes)
  const l = W / colonnes
  const h = hRangees / parColonne
  // la rangée : les chiffres à gauche (deux ronds), puis n ronds sur la largeur qui reste (un espace de plus entre les deux mains de dix)
  const rondChiffre = Math.min(h * 0.7, l * 0.12)
  const largeurChiffres = r.chiffres ? rondChiffre * 2 + 10 : 0
  const unites = r.n + (r.n === 10 ? 0.5 : 0)
  const pas = (l - largeurChiffres - 8) / unites
  const diametre = Math.min(h * 0.62, pas * 0.86)
  const centreRond = (x0: number, j: number): number => x0 + largeurChiffres + 5 + pas * (j + 0.5 + (r.n === 10 && j >= 5 ? 0.5 : 0))

  // un rond : plein (groupe A) ou creux (groupe B), dans la couleur de son groupe
  const rond = (cx: number, cy: number, rayon: number, plein: boolean, couleur: string): string => (plein
    ? `<circle cx="${cx}" cy="${cy}" r="${rayon}" fill="${couleur}"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${rayon - 0.7}" fill="#fff" stroke="${couleur}" stroke-width="1.4"/>`)

  const rangee = (k: number, i: number): string => {
    const colonne = Math.floor(i / parColonne), ligne = i % parColonne
    const x0 = colonne * l, yc = hTete + ligne * h + h / 2
    let s = `<rect x="${x0 + 1}" y="${hTete + ligne * h + 1}" width="${l - 2}" height="${h - 2}" rx="3" fill="${ligne % 2 ? '#fff' : '#f6f8fb'}" stroke="#d5dbe5" stroke-width="0.4"/>`
    if (r.chiffres) {
      // deux chiffres (10) : plus petits, pour tenir dans le rond
      const tailleDe = (n: number): number => rondChiffre * (n >= 10 ? 0.62 : 0.95)
      const cA = x0 + 5 + rondChiffre / 2, cB = cA + rondChiffre + 4
      s += rond(cA, yc, rondChiffre / 2, true, COULEUR_A) + txt(cA, yc, k, tailleDe(k), { gras: true, couleur: '#fff' })
      s += rond(cB, yc, rondChiffre / 2, false, COULEUR_B) + txt(cB, yc, r.n - k, tailleDe(r.n - k), { gras: true, couleur: COULEUR_B })
    }
    for (let j = 0; j < r.n; j++) s += rond(centreRond(x0, j), yc, diametre / 2, j < k, j < k ? COULEUR_A : COULEUR_B)
    return s
  }

  // l'en-tête : le total en grand, puis n ronds noirs
  const tailleTete = hTete * 0.62
  const diamTete = Math.min(hTete * 0.5, (W - 3 * tailleTete) / (r.n * 1.4))
  let tete = txt(W / 2 - (r.n * diamTete * 1.4) / 2 - tailleTete * 0.4, hTete / 2, r.n, tailleTete, { gras: true, couleur: '#222' })
  for (let j = 0; j < r.n; j++) tete += `<circle cx="${W / 2 + tailleTete * 0.3 - (r.n * diamTete * 1.4) / 2 + diamTete * 1.4 * (j + 0.5)}" cy="${hTete / 2}" r="${diamTete / 2}" fill="#222"/>`

  return [`<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${tete}${rangs.map(rangee).join('')}</svg>`]
}

// CSS propre à l'affiche (ajouté après celui du cadre) : le SVG hérite la police du texte
export const css = 'svg { display: block; flex: none; } svg text { font-family: inherit; }'
