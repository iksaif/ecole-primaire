// Les fractions — fiche imprimable (pure : lisible par node). Met en page les questions de questionsFiche().
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; police et cssPolices : usePoliceFiche() dans l'app (Andika par défaut)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { formeEnSvg } from './formes.js'
import { svgDroiteFraction } from './droite.js'

const CSS = `
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .q { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; font-size: 1.15rem; page-break-inside: avoid; flex-wrap: wrap; }
      .num { min-width: 1.8rem; font-weight: 700; color: #777; }
      .frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; font-weight: 800; margin: 0 .2rem; }
      .frac > span:first-child { border-bottom: 2px solid #222; padding: 0 .3rem; }
      .frac-vide { display: inline-flex; flex-direction: column; align-items: center; gap: 3px; vertical-align: middle; margin: 0 .3rem; }
      .frac-vide .vide { display: block; width: 2rem; height: 1.6rem; border: 1.5px solid #555; border-radius: 3px; }
      .frac-vide .barre { display: block; width: 2.6rem; border-top: 2.5px solid #222; }
      .case { display: inline-block; width: 2.2rem; height: 2rem; border: 2px solid #555; border-radius: 4px; vertical-align: middle; }
      small { color: #777; }
      .ligne { display: inline-block; width: 4rem; border-bottom: 1.5px solid #555; height: 1.3rem; }
      .ligne.longue { width: 14rem; }
      .reponses { columns: 2; column-gap: 2rem; font-size: 1.05rem; line-height: 1.9; }
      .reponses li { break-inside: avoid; font-weight: 700; }`

const fracHtml = f => `<span class="frac"><span>${f.n}</span><span>${f.d}</span></span>`
const fracVide = '<span class="frac-vide"><span class="vide"></span><span class="barre"></span><span class="vide"></span></span>'

function questionPapier(qu, i, T) {
  const num = `<span class="num">${i + 1}.</span>`
  switch (qu.type) {
    case 'identifier':
      return `<div class="q">${num}<div class="forme">${formeEnSvg(qu.forme, qu.colorees)}</div><div>${T('pIdentifier')} ${fracVide}</div></div>`
    case 'colorier':
      return `<div class="q">${num}<div class="forme">${formeEnSvg(qu.forme)}</div><div>${T('pColorie', { f: fracHtml(qu.reponse) })}</div></div>`
    case 'lettres':
      return qu.choixEn === 'lettres'
        ? `<div class="q">${num}<div>${T('pEnLettres', { f: fracHtml(qu.reponse) })} <span class="ligne longue"></span></div></div>`
        : `<div class="q">${num}<div>${T('pEnChiffres', { f: `<b>${qu.texte}</b>` })} ${fracVide}</div></div>`
    case 'partDe':
      return `<div class="q">${num}<div>${T('pPartDe', { l: qu.libelle })} <span class="ligne"></span></div></div>`
    case 'egales':
      return qu.kind === 'nombre'
        ? `<div class="q">${num}<div>${T('pComplete')} ${fracHtml(qu.egalite.gauche)} = <span class="frac-vide"><span class="vide"></span><span class="barre"></span><b>${qu.egalite.droite.d}</b></span></div></div>`
        : `<div class="q">${num}<div>${T('pEntoure', { f: fracHtml(qu.fracConsigne) })} &nbsp; ${qu.choix.map(fracHtml).join(' &nbsp;&nbsp; ')}</div></div>`
    case 'droite':
      return `<div class="q">${num}<div style="width:100%">${T('pDroite')}<div>${svgDroiteFraction(qu.droite, { fleche: qu.reponse.n })}</div>${T('pReponse')} ${fracVide}</div></div>`
    case 'placer':
      return `<div class="q">${num}<div style="width:100%">${T('pPlacer', { f: fracHtml(qu.reponse) })}<div>${svgDroiteFraction(qu.droite)}</div></div></div>`
    default:
      return ''
  }
}

export function fiche({ questions: qs, reglages, T, langue, police, cssPolices }) {
  const titre = `${T('titre')} — ${reglages.niveau.toUpperCase()}`
  return documentFiche({
    titre, h1: titre, langue, police, cssPolices, css: CSS,
    corps: `<p class="infos">${T('pNbQuestions', { n: qs.length })}</p>
    ${ligneNomDate(langue)}
    ${qs.map((qu, i) => questionPapier(qu, i, T)).join('')}
    <section class="corrige"><h2>${T('corrige')}</h2>
    <ol class="reponses">${qs.map(qu => `<li>${qu.attendu}</li>`).join('')}</ol></section>`,
  })
}
