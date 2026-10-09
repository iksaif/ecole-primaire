// Le dessin de la bande numérique : une case par nombre, le chiffre en grand, puis ce qui le représente (des objets en deux rangées de cinq, comme les
// doigts de deux mains, ou des points) et, au besoin, le nombre en lettres dans chaque langue de la feuille. Une seule rangée jusqu'à 10 ; la bande de
// la comptine (1 à 30) fait trois rangées de dix, une couleur par rangée. Pur : lisible par node ; les objets sont des emojis OpenMoji (src/images/).
import { COULEURS, txt } from '../../impression/affiches/cadre.ts'
import { enLettresFr } from '../../utils/nombres.js'
import { donneesRegionales } from '../../langues/registre.ts'
import { emojiSvg } from '../../images/openmoji.ts'
import type { NomEmoji } from '../../images/tables.ts'
import { tailleQuiTient } from '../listeMots.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

// le nombre en lettres dans une langue : celle d'une langue régionale, sinon le français
const enLettres = (langue: string, n: number): string => donneesRegionales(langue as never)?.enLettres(n) ?? enLettresFr(n)

/**
 * Cases par rangée : la comptine (sans représentation) en dix ; sinon cinq (la main), pour que les objets restent assez grands à regarder : de 1 à 10
 * deux rangées de cinq. Jusqu'à 6, une seule rangée.
 */
function casesParRangee(nbNombres: number, avecRepresentation: boolean): number {
  if (!avecRepresentation) return 10
  return nbNombres <= 6 ? nbNombres : 5
}

/** Une place dans une case, en côtés d'objet depuis le centre du bloc (x) et depuis son haut (y). */
interface Place { x: number, y: number }

/** Les places du dé (grille de 3 × 3) : les constellations que l'enfant reconnaît sans compter. Colonne et rangée valent 0, 1 ou 2. */
const DE: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
}

/** Au-delà de 6, des rangées de cinq (la main), la dernière rangée centrée. */
const PAR_RANGEE_OBJETS = 5

/** Les places de `n` objets : le dé jusqu'à 6, sinon des rangées de cinq. `cote` est le côté d'un objet. */
function placesDe(n: number): { places: Place[], largeur: number, hauteur: number } {
  const de = DE[n]
  if (de) return { places: de.map(([colonne, rangee]) => ({ x: colonne - 1, y: rangee })), largeur: 3, hauteur: 3 }
  const places: Place[] = []
  for (let k = 0; k < n; k++) {
    const rangee = Math.floor(k / PAR_RANGEE_OBJETS), dansLaRangee = Math.min(n - rangee * PAR_RANGEE_OBJETS, PAR_RANGEE_OBJETS)
    places.push({ x: (k % PAR_RANGEE_OBJETS) - (dansLaRangee - 1) / 2, y: rangee * 1.1 })
  }
  return { places, largeur: PAR_RANGEE_OBJETS, hauteur: 2.1 }
}

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T, ctx) => {
  const nombres = Array.from({ length: r.max - r.debut + 1 }, (_, i) => r.debut + i)
  const avecRepresentation = r.representation !== 'aucune'
  const colonnes = Math.min(nombres.length, casesParRangee(nombres.length, avecRepresentation))
  const rangees = Math.ceil(nombres.length / colonnes)
  const ecart = rangees > 1 ? 4 : 0
  // une case par nombre, toutes de la même largeur ; leur hauteur suit la largeur, sans dépasser la place d'une rangée
  const l = W / colonnes
  const hMax = !avecRepresentation ? 1.4 : (r.lettres ? 2.1 : 1.6)
  const h = Math.min((H - (rangees - 1) * ecart) / rangees, l * hMax)
  const y0 = (H - (rangees * h + (rangees - 1) * ecart)) / 2
  const objet = r.objet as NomEmoji
  // la taille des nombres en lettres, par langue : celle du plus long (« vingt-huit »), dans la largeur d'une case
  const tailleLettres = r.langues.map(langue => tailleQuiTient(nombres.map(n => enLettres(langue, n)), ctx.nomPolice(), l, Math.min(l * 0.24, 7), ctx))

  // la case se lit en trois étages : le chiffre dans un bandeau coloré, un filet, puis le contenu (objets ou points) et enfin les mots
  const hBandeau = h * 0.3
  const hautContenu = hBandeau + h * 0.05
  const basContenu = h * (r.lettres ? 0.74 : 0.96)
  // les objets ont partout la même taille (jusqu'à 10 : rangées de cinq ; jusqu'à 6 : le dé) : celle qui convient au plus gros bloc
  const blocs = nombres.map(n => placesDe(n))
  const largeurMax = Math.max(...blocs.map(b => b.largeur)), hauteurMax = Math.max(...blocs.map(b => b.hauteur))
  const cote = Math.min((l * 0.84) / largeurMax, (basContenu - hautContenu) / hauteurMax)
  // tous les blocs commencent à la même hauteur, centrés ensemble dans la place du contenu
  const hautBloc = hautContenu + (basContenu - hautContenu - hauteurMax * cote) / 2

  const case1 = (n: number, i: number): string => {
    const rangee = Math.floor(i / colonnes), colonne = i % colonnes
    const x = colonne * l, y = y0 + rangee * (h + ecart)
    // une couleur par groupe de 5 sur une rangée ; trois rangées : une couleur par rangée
    const couleur = rangees > 1 ? COULEURS[rangee % COULEURS.length] : COULEURS[Math.floor(n / 5) % COULEURS.length]
    let s = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${l - 1}" height="${h - 1}" rx="2" fill="white" stroke="${couleur}" stroke-width="1"/>`
    if (!avecRepresentation) {
      s += txt(x + l / 2, y + h * 0.5, n, Math.min(l * 0.5, h * 0.55), { gras: true, couleur })
      return s
    }
    // le bandeau du chiffre : un fond de la couleur de la case (très clair) et un filet dessous
    s += `<path d="M${x + 0.5} ${y + hBandeau} V${y + 2.5} a2 2 0 0 1 2 -2 H${x + l - 2.5} a2 2 0 0 1 2 2 V${y + hBandeau} Z" fill="${couleur}" fill-opacity="0.12"/>`
    s += `<line x1="${x + 0.5}" y1="${y + hBandeau}" x2="${x + l - 0.5}" y2="${y + hBandeau}" stroke="${couleur}" stroke-width="0.6"/>`
    s += txt(x + l / 2, y + hBandeau / 2, n, Math.min(l * 0.5, hBandeau * 0.85), { gras: true, couleur })
    for (const place of blocs[i].places) {
      const cx = x + l / 2 + place.x * cote, cy = y + hautBloc + place.y * cote
      if (r.representation === 'objets') s += emojiSvg(objet, cx - cote / 2, cy, cote)
      else s += `<circle cx="${cx}" cy="${cy + cote / 2}" r="${cote * 0.32}" fill="${couleur}"/>`
    }
    // les nombres en lettres : une ligne par langue de la feuille
    // (le premier texte en sombre, le suivant en bleu, comme sur les autres affiches)
    if (r.lettres) r.langues.forEach((langue, j) => { s += txt(x + l / 2, y + h * (0.84 + 0.085 * j), enLettres(langue, n), tailleLettres[j], { couleur: j === 0 ? '#222' : '#1d4e9e', gras: true }) })
    return s
  }

  const cases = nombres.map((n, i) => case1(n, i)).join('')
  return [`<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${cases}</svg>`]
}

// CSS propre à l'affiche (ajouté après celui du cadre) : le SVG hérite la police du texte
export const css = 'svg { display: block; flex: none; } svg text { font-family: inherit; }'
