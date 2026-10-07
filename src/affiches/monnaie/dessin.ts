// Le dessin de l'affiche « Pièces et billets » : une fonction pure (réglages, zone, T, contexte) → pages, sans Vue ni DOM (lisible
// par node). Les pièces et les billets sont ceux de l'exercice (src/dessins/argent.ts) : un seul dessin, donc les mêmes billets partout.
//   - l'affiche : les pièces sur une rangée, les billets sur deux, et les échanges usuels. Les proportions sont vraies entre pièces
//     et entre billets ; les pièces sont agrandies (LOUPE) pour rester lisibles, mais restent plus petites que les billets ;
//   - la planche à découper (`planche`) : les mêmes pièces et billets à la TAILLE RÉELLE (1 mm de la feuille = 1 mm de l'argent) ou
//     réduits (75, 50 %), en bandes alignées pour un massicot, avec traits de coupe (la disposition : planche.ts).
import { echapper } from '../../utils/html.js'
import { VALEURS_BILLETS, VALEURS_PIECES, billet, piece, tailleReelle } from '../../dessins/argent.ts'
import type { ValeurBillet, ValeurPiece } from '../../dessins/argent.ts'
import { ECHELLES, EXEMPLAIRES, GENRES, H_CONSIGNE, disposerPlanche } from './planche.ts'
import type { PagePlanche } from './planche.ts'
import type { Page, Rendu, Zone } from '../types.ts'
import type { Reglages } from './definition.ts'

// ── L'affiche ──
const ECART = 4         // mm entre deux pièces ou deux billets
const LOUPE = 2         // agrandissement des pièces par rapport aux billets (2 € : 5/6 de la hauteur du billet de 5 €)
const H_SECTION = 11    // titre « Les pièces » / « Les billets » (7 mm, interligne compris) et sa marge (cf. .sect)

// Les échanges usuels (textes `relation.<id>.a|b`) ; ceux des centimes s'ajoutent sur l'affiche « euros et centimes »
const RELATIONS = ['deuxUnEuro', 'cinqDeuxEuros', 'dixUnEuro', 'deuxDixEuros'] as const
const RELATIONS_CENTIMES = ['centCentimes', 'dixDixCentimes', 'deuxCinquante'] as const

const affiche: Rendu<Reglages>['dessin'] = (r, { W, H }, T, { mesure, nomPolice }) => {
  const complet = r.centimes
  const pieces = (complet ? VALEURS_PIECES : VALEURS_PIECES.filter(v => v >= 100)).map(v => ({ v, d: tailleReelle(v).w }))
  const billets = (complet ? VALEURS_BILLETS : VALEURS_BILLETS.filter(v => v <= 10000)).map(v => ({ v, ...tailleReelle(v) }))
  // billets sur deux rangées (les plus petits en haut), pour qu'ils restent assez grands
  const coupe = Math.ceil(billets.length / 2)
  const rangees = [billets.slice(0, coupe), billets.slice(coupe)]
  const relations = [...RELATIONS, ...(complet ? RELATIONS_CENTIMES : [])].map(id => [T(`relation.${id}.a`), T(`relation.${id}.b`)] as const)
  // équivalences sur 2 colonnes : chaque ligne doit tenir dans sa colonne (police plus large : texte réduit)
  const plusLongue = Math.max(...relations.map(([a, b]) => mesure.largeur(`${a} ${b}`, nomPolice(), true)))
  const fs = Math.min(H * 0.035, 8, (W - 16) / 2 / plusLongue)
  // hauteur des équivalences et de la note du bas (« c = centime »)
  const hBas = Math.ceil(relations.length / 2) * (fs * 1.4 + 1) + 6 + (complet ? 12 : 0)
  // échelle commune : la plus grande qui tient en largeur (rangée la plus large) et en hauteur
  const largeur = (l: readonly { w: number }[]): number => l.reduce((t, x) => t + x.w, 0) + (l.length - 1) * ECART
  const kLargeur = Math.min((W - 10) / largeur(rangees[0]), (W - 10) / largeur(rangees[1]),
    (W - 10 - (pieces.length - 1) * ECART) / pieces.reduce((t, p) => t + p.d * LOUPE, 0))
  const hautMax = (l: readonly { h: number }[]): number => Math.max(...l.map(b => b.h))
  const kHauteur = (H - 2 * H_SECTION - hBas - 3 * ECART) / (Math.max(...pieces.map(p => p.d)) * LOUPE + hautMax(rangees[0]) + hautMax(rangees[1]))
  const k = Math.min(kLargeur, kHauteur)

  const kp = k * LOUPE
  const hPieces = Math.max(...pieces.map(p => p.d)) * kp + 2
  const rangee = (h: number, dessins: string[]): string => `<div class="rangee" style="height:${h}mm;gap:${ECART}mm">${dessins.join('')}</div>`
  const lignePieces = rangee(hPieces, pieces.map(p => piece(p.v, { echelle: kp, unite: 'mm' })))
  const lignesBillets = rangees.map(l => rangee(hautMax(l) * k, l.map(b => billet(b.v, { echelle: k, unite: 'mm' })))).join('')
  return [`<h2 class="sect">${echapper(T('section.pieces'))}</h2>${lignePieces}<h2 class="sect">${echapper(T('section.billets'))}</h2><div class="billets" style="gap:${ECART}mm">${lignesBillets}</div>
    <div class="rel" style="font-size:${fs}mm">${relations.map(([a, b]) => `<p>${echapper(a)} <b>${echapper(b)}</b></p>`).join('')}</div>${complet ? `<p class="legende" style="margin-top:4mm;font-size:5mm">${echapper(T('legende'))}</p>` : ''}`]
}

// ── La planche à découper ──
// La disposition (planche.ts) est pure et testée à part ; ici on la dessine : le SVG de la page est à l'échelle 1 (1 unité = 1 mm de la
// feuille), chaque pièce et chaque billet est dessiné à sa taille réelle × l'échelle choisie, les traits de coupe sont fins.
const TRAIT = 'stroke="#555" stroke-width=".2"'

/** Les traits de coupe d'une page : horizontaux d'un bord à l'autre de la zone, verticaux sur la hauteur de chaque bande. */
function traitsDeCoupe(page: PagePlanche, W: number): string {
  const ys = [...new Set(page.bandes.flatMap(b => [b.y, mm(b.y + b.h)]))]
  const horizontaux = ys.map(y => `<line x1="0" y1="${y}" x2="${W}" y2="${y}" ${TRAIT}/>`)
  const verticaux = page.bandes.flatMap(b => b.xs.map(x => {
    return `<line x1="${x}" y1="${b.y}" x2="${x}" y2="${mm(b.y + b.h)}" ${TRAIT}/>`
  }))
  return [...horizontaux, ...verticaux].join('')
}
const mm = (n: number): number => Math.round(n * 1000) / 1000

const planche = (r: Reglages, { W, H }: Zone, T: (cle: string, params?: Record<string, unknown>) => string): Page[] => {
  const tp = ECHELLES.find(e => e === r.taillePieces) ?? 100
  const tb = ECHELLES.find(e => e === r.tailleBillets) ?? 100
  const hs = H - H_CONSIGNE
  const exemplaires = EXEMPLAIRES.find(e => e === r.exemplaires) ?? 0
  const genres = GENRES.find(g => g === r.genres) ?? 'tout'
  const pages = disposerPlanche({ centimes: r.centimes, taillePieces: tp, tailleBillets: tb, exemplaires, valeurs: r.valeurs, genres, W, H: hs })
  // la consigne dit la taille : une seule phrase quand pièces et billets ont la même, sinon les deux
  const taille = tp !== tb ? T('planche.tailles', { pieces: tp, billets: tb }) : tp === 100 ? T('planche.taille100') : T('planche.tailleReduite', { n: tp })
  return pages.map((page, i) => {
    // un billet tourné de 90° : sa boîte est « debout » ; on le tourne autour de son coin haut gauche puis on le ramène dans la boîte
    const argent = page.poses.map(({ v, genre, boite, tourne }) => `<g transform="translate(${tourne ? boite.x + boite.w : boite.x} ${boite.y})${tourne ? ' rotate(90)' : ''}">${
      genre === 'piece' ? piece(v as ValeurPiece, { echelle: tp / 100 }) : billet(v as ValeurBillet, { echelle: tb / 100 })}</g>`).join('')
    const corps = `<svg width="${W}mm" height="${hs}mm" viewBox="0 0 ${W} ${hs}">${traitsDeCoupe(page, W)}${argent}</svg>`
      + `<p class="consigne" style="height:${H_CONSIGNE}mm">${echapper(`${T('planche.consigne')} ${taille}`)}</p>`
    return { corps, titre: `${T('planche.titre')}${pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''}` }
  })
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, T, contexte) => (r.planche ? planche(r, zone, T) : affiche(r, zone, T, contexte))

// CSS propre à l'affiche (ajouté après celui du cadre)
export const css = `
  .sect { font-size: 7mm; line-height: 1.3; color: #1d4e9e; margin: 2mm 0 0; flex: none; }
  .rangee { display: flex; align-items: center; justify-content: center; flex: none; }
  .rangee svg { display: block; flex: none; }
  .billets { display: flex; flex-direction: column; margin-top: 1mm; flex: none; }
  .rel { display: grid; grid-template-columns: repeat(2, auto); gap: 1mm 12mm; margin-top: 3mm; flex: none; }
  .rel p { margin: 0; line-height: 1.4; }
  /* sous le titre, le contenu est centré dans la hauteur qui reste (portrait) */
  .sect:first-of-type { margin-top: auto; }
  .contenu > :last-child { margin-bottom: auto; }
  .rel b { color: #d9480f; }
  /* planche : le SVG est à l'échelle 1 ; la consigne sous le dessin */
  svg { display: block; flex: none; }
  .consigne { margin: 0; font-size: 3.5mm; color: #444; text-align: center; display: flex; align-items: center; justify-content: center; }`
