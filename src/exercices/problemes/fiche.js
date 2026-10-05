// Problèmes — fiche imprimable (pure : lisible par node). Un cadre pour le calcul et une ligne pour la réponse, avec corrigé.
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { unite, avecUnite } from './generateur.js'

const CSS = `
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .pb { margin: 0 0 1.4rem; page-break-inside: avoid; }
      .enonce { font-size: 1.15rem; line-height: 1.6; }
      .num { font-weight: 700; color: #777; }
      .calcul { border: 1.5px solid #999; border-radius: 6px; height: 4.5rem; margin: .5rem 0; padding: .3rem .5rem; color: #777; font-size: .9rem; }
      .reponse { font-size: 1.05rem; }
      .ligne { display: inline-block; width: 5rem; border-bottom: 1.5px solid #555; }
      .reponses { font-size: 1.1rem; line-height: 2; }
    `

export function fiche({ questions: qs, reglages, T, langue, police, cssPolices }) {
  const niv = reglages.niveau.toUpperCase()
  const blocs = qs.map((p, i) => `
    <div class="pb">
      <div class="enonce"><span class="num">${i + 1}.</span> ${p.enonce} <b>${p.question}</b></div>
      <div class="calcul">${T('pCalcul')}</div>
      <div class="reponse">${T('pReponse')} <span class="ligne"></span> ${unite(p, p.reponse)}</div>
    </div>`).join('')

  const corrige = `<section class="corrige"><h2>${T('corrige')}</h2>
    <ol class="reponses">${qs.map(p => `<li><b>${p.calcul}</b> → ${avecUnite(p, p.reponse)}</li>`).join('')}</ol></section>`

  const titre = `${T('titre')} — ${niv}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.5cm',
    h1: titre,
    corps: `<p class="infos">${T('pNbProblemes', { n: qs.length })}</p>
    ${ligneNomDate(langue)}
    ${blocs}
    ${corrige}`,
  })
}
