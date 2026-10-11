// Les formes — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Formes à colorier selon une
// légende, puis à compter ; PS : colorier toutes les formes pareilles au modèle. Les formes sont celles du jeu (src/dessins/figures.ts).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { svgForme } from '../../dessins/figures.ts'
import type { FormeMaternelle } from '../../dessins/figures.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { COULEURS_FICHE, formesDuNiveau, nomForme } from './generateur.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS_PS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .8rem 0 .6rem; display: flex; align-items: center; gap: 1rem; }
      .modele { border: 3px solid #333; border-radius: 14px; padding: .4rem; display: inline-flex; }
      .grille { display: grid; grid-template-columns: repeat(4, 1fr); gap: .6rem; margin: 1rem 0; }
      .cell { height: 130px; display: flex; align-items: center; justify-content: center; }
      .corr { font-size: 1.15rem; line-height: 2; }
    `
const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .8rem 0 .6rem; }
      .legende { display: grid; grid-template-columns: 1fr 1fr; gap: .4rem 2rem; border: 2px solid #ccc; border-radius: 12px; padding: .5rem 1rem; }
      .leg { display: flex; align-items: center; gap: .6rem; font-size: 1.1rem; font-weight: 700; }
      .leg .nom { min-width: 6rem; }
      .pastille { width: 1.6rem; height: 1.6rem; border-radius: 50%; display: inline-block; border: 1px solid #555; }
      .grille { display: grid; grid-template-columns: repeat(5, 1fr); gap: .3rem; margin: .8rem 0; }
      .cell { height: 100px; display: flex; align-items: center; justify-content: center; }
      .comptes { display: flex; justify-content: space-around; page-break-inside: avoid; }
      .cpt { display: flex; align-items: center; gap: .5rem; }
      .case { width: 2.6rem; height: 2.6rem; border: 2.5px solid #444; border-radius: 8px; display: inline-block; }
      .corr { font-size: 1.15rem; line-height: 2; }
    `

// une forme au trait, à colorier
const contour = (forme: FormeMaternelle, taille: number, angle = 0): string => svgForme(forme, { taille, angle, contour: true })

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const titre = T('titre')
  const cases = x.formes.map(f => `<div class="cell">${contour(f.forme, f.taille, f.angle)}</div>`).join('')
  const pied = (corr: string): string => `<section class="corrige"><h2>${T('corrige')} — ${titre}</h2>\n      <div class="corr">${corr}</div></section>`
  if (x.niveau === 'ps' && x.modele) {
    return documentFiche({
      titre, langue, police, cssPolices, css: CSS_PS, largeur: '700px', marge: '1.2cm',
      corps: `${ligneNomDate(langue)}
    <p class="consigne"><span class="modele">${contour(x.modele, 70)}</span> ${T('consignePS')}</p>
    <div class="grille">${cases}</div>
    ${pied(`${nomForme(T, x.modele)} : <b>${x.formes.filter(f => f.forme === x.modele).length}</b>`)}`,
    })
  }
  const couleurs = COULEURS_FICHE.filter(c => formesDuNiveau(x.niveau).includes(c.forme))
  const legende = couleurs.map(c => `<div class="leg">${contour(c.forme, 46)}<span class="nom">${nomForme(T, c.forme)}</span>
    <span class="pastille" style="background:${c.hex}"></span><span class="coul">${T(`couleur.${c.couleur}` as Cle)}</span></div>`).join('')
  const comptes = couleurs.map(c => `<div class="cpt">${contour(c.forme, 40)}<span class="case"></span></div>`).join('')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('consigne')}</p>
    <div class="legende">${legende}</div>
    <div class="grille">${cases}</div>
    <p class="consigne">${T('compte')}</p>
    <div class="comptes">${comptes}</div>
    ${pied(couleurs.map(c => `<div>${nomForme(T, c.forme)} (${T(`couleur.${c.couleur}` as Cle)}) : <b>${x.formes.filter(f => f.forme === c.forme).length}</b></div>`).join(''))}`,
  })
}
