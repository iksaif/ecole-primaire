// Les formes — fiche imprimable (pure : lisible par node). Formes à colorier selon une légende, puis à compter ;
// PS : colorier toutes les formes pareilles au modèle.
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { COULEURS_FICHE, contour, formesDuNiveau } from './generateur.js'

const nomForme = (T, nom) => T(nom.normalize('NFD').replace(/[̀-ͯ]/g, ''))

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

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const titre = T('titre')
  const cases = x.formes.map(f => `<div class="cell">${contour(f.nom, f.taille, f.angle)}</div>`).join('')
  const pied = corr => `<section class="corrige"><h2>${T('corrige')} — ${titre}</h2>\n      <div class="corr">${corr}</div></section>`
  if (x.niveau === 'ps') {
    return documentFiche({
      titre, langue, police, cssPolices, css: CSS_PS, largeur: '700px', marge: '1.2cm',
      corps: `${ligneNomDate(langue)}
    <p class="consigne"><span class="modele">${contour(x.modele, 70)}</span> ${T('fConsignePS')}</p>
    <div class="grille">${cases}</div>
    ${pied(`${nomForme(T, x.modele)} : <b>${x.formes.filter(f => f.nom === x.modele).length}</b>`)}`,
    })
  }
  const couleurs = COULEURS_FICHE.filter(c => formesDuNiveau(x.niveau).some(f => f.nom === c.nom))
  const legende = couleurs.map(c => `<div class="leg">${contour(c.nom, 46)}<span class="nom">${nomForme(T, c.nom)}</span>
    <span class="pastille" style="background:${c.hex}"></span><span class="coul">${T(c.couleur)}</span></div>`).join('')
  const comptes = couleurs.map(c => `<div class="cpt">${contour(c.nom, 40)}<span class="case"></span></div>`).join('')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('fConsigne')}</p>
    <div class="legende">${legende}</div>
    <div class="grille">${cases}</div>
    <p class="consigne">${T('fCompte')}</p>
    <div class="comptes">${comptes}</div>
    ${pied(couleurs.map(c => `<div>${nomForme(T, c.nom)} (${T(c.couleur)}) : <b>${x.formes.filter(f => f.nom === c.nom).length}</b></div>`).join(''))}`,
  })
}
