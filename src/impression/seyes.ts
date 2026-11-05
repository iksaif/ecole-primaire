// Les lignes d'écriture des fiches d'exercice (mots à recopier, dictée…) : un simple trait, ou, avec l'option « Lignes Seyès » de
// « Sur la fiche » (ParamsFiche.seyes), une bande de lignage Seyès qui prend toute la largeur de sa place. Pur (lisible par node).
//   ligneEcriture({ seyes, niveau }, classe, balise)   le HTML d'une ligne où l'on écrit (sans l'option : le même élément vide qu'avant)
//   CSS_LIGNES_ECRITURE                         ses styles, à ajouter à ceux de la fiche
// Le lignage suit celui des fiches d'écriture (src/exercices/ecriture/definition.ts) : 4 mm d'interligne en GS, 3 mm au CP, 2,5 mm au
// CE1, 2 mm ensuite ; un carreau = 4 interlignes.
import type { Classe } from '../noyau/types.ts'

/** L'interligne Seyès d'une classe, en mm (celui que les fiches d'écriture proposent d'abord). */
export function interligneSeyes(niveau: Classe): number {
  if (niveau === 'ps' || niveau === 'ms' || niveau === 'gs') return 4
  if (niveau === 'cp') return 3
  if (niveau === 'ce1') return 2.5
  return 2
}

const COULEURS = { forte: '#8e9ad8', fine: '#c9d2f3' }
/** Assez de carreaux pour la plus large des places (une feuille A4 en paysage) ; ce qui dépasse est coupé par le SVG. */
const LARGEUR_MAX_MM = 300

/**
 * Une bande Seyès : la ligne forte du haut, trois interlignes fins, la ligne forte où l'on écrit, un interligne pour les jambages ;
 * les verticales des carreaux. Les longueurs sont en mm (le SVG prend la largeur de sa place, le dessin n'est pas déformé).
 */
function bandeSeyes(i: number): string {
  const hauteur = 5 * i
  let s = ''
  for (let k = 0; k <= 5; k++) {
    const forte = k === 0 || k === 4
    s += `<line x1="0" y1="${k * i}mm" x2="100%" y2="${k * i}mm" stroke="${forte ? COULEURS.forte : COULEURS.fine}" stroke-width="${forte ? 1 : 0.6}"/>`
  }
  for (let x = 0; x <= LARGEUR_MAX_MM; x += 4 * i) {
    s += `<line x1="${x}mm" y1="0" x2="${x}mm" y2="${4 * i}mm" stroke="${COULEURS.forte}" stroke-width="0.7"/>`
  }
  return `<svg class="seyes" width="100%" height="${hauteur}mm" aria-hidden="true">${s}</svg>`
}

/**
 * Le HTML d'une ligne où l'on écrit : l'élément vide de la fiche (`balise`, classe `classe` : son trait est dans les styles de la fiche),
 * ou, si l'option est choisie, le même élément avec une bande Seyès dedans.
 */
export function ligneEcriture({ seyes, niveau }: { seyes?: boolean, niveau: Classe }, classe = 'ligne-ecriture', balise: 'span' | 'div' = 'span'): string {
  if (!seyes) return `<${balise} class="${classe}"></${balise}>`
  return `<${balise} class="${classe} avec-seyes">${bandeSeyes(interligneSeyes(niveau))}</${balise}>`
}

/** Les styles d'une ligne Seyès : sans le trait du bas, la bande à pleine largeur. */
export const CSS_LIGNES_ECRITURE = `
      .avec-seyes { border-bottom: none !important; height: auto !important; display: block; }
      .avec-seyes svg.seyes { display: block; overflow: hidden; }`
