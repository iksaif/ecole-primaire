// Les nombres — fiche imprimable (pure : lisible par node). Met en page les questions de questionsFiche().
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; police et cssPolices : usePoliceFiche() dans l'app (Andika par défaut)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { fmt, LIBELLES_CDU } from './questions.js'

const CSS = `
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .q { margin: 1rem 0; font-size: 1.15rem; line-height: 2; page-break-inside: avoid; }
      .q.bloc { margin: 1.3rem 0; }
      .num { display: inline-block; min-width: 1.8rem; font-weight: 700; color: #777; }
      .case { display: inline-block; width: 2.2rem; height: 2rem; border: 2px solid #555; border-radius: 4px; vertical-align: middle; }
      .case-ligne { display: inline-block; width: 5rem; border-bottom: 1.5px solid #555; height: 1.4rem; vertical-align: bottom; }
      .case-ligne.longue { width: 22rem; }
      .svg { margin: .4rem 0; }
      .svg svg { max-width: 100%; }
      small { color: #777; }
      .reponses { columns: 2; column-gap: 2rem; font-size: 1.05rem; line-height: 1.9; }
      .reponses li { break-inside: avoid; font-weight: 700; }`

function questionPapier(qu, i, T) {
  const num = `<span class="num">${i + 1}.</span>`
  const ligne = '<span class="case-ligne"></span>'
  switch (qu.type) {
    case 'decomposer':
      if (qu.kind === 'cdu') {
        const champs = qu.champs.map(ch => `<span class="case"></span> ${T(LIBELLES_CDU[ch])}`).join(' &nbsp; ')
        return `<div class="q">${num}<b>${qu.texte}</b> = ${champs}</div>`
      }
      return `<div class="q">${num}<b>${qu.texte}</b> = ${ligne}</div>`
    case 'representation':
      return `<div class="q bloc">${num}${T('pRepresente')} <small>${T('pLegende', { m: qu.milliers ? T('pLegendeM') : '' })}</small><div class="svg">${qu.svg}</div>${T('pCestLeNombre')} ${ligne}</div>`
    case 'lettresChiffres':
      return `<div class="q">${num}<b>${qu.texte}</b> → ${T('pEnChiffres')} ${ligne}</div>`
    case 'chiffresLettres':
      return `<div class="q">${num}${T('pEcrisLettres', { n: `<b>${qu.texte}</b>` })} <span class="case-ligne longue"></span></div>`
    case 'comparer':
      return `<div class="q">${num}<b>${qu.libelle.replace('…', '<span class="case"></span>')}</b> <small>(&lt; , = ou &gt;)</small></div>`
    case 'suites':
      if (qu.termes) {
        // les suites à trou sont plus simples à reconstruire proprement
        const termes = qu.termes.map((v, k) => k === qu.trou ? ligne : `<b>${fmt(v)}</b>`).join(', ')
        return `<div class="q">${num}${T('pSuite')} ${termes}</div>`
      }
      if (qu.texte.endsWith('= ?')) return `<div class="q">${num}<b>${qu.texte.replace('= ?', '=')}</b> ${ligne}</div>`
      return `<div class="q">${num}${qu.texte} : ${ligne}</div>`
    case 'droite':
      return `<div class="q bloc">${num}${T('pFlecheQ')} <small>${T('pFlecheAide', { pas: fmt(qu.pas) })}</small><div class="svg">${qu.svg}</div>${T('pFlecheMontre')} ${ligne}</div>`
    case 'ranger':
      return `<div class="q bloc">${num}${T('pRange')} <b>${qu.nombres.map(fmt).join(' &nbsp; ; &nbsp; ')}</b><div style="margin-top:.6rem;">${qu.nombres.map(() => ligne).join(' &lt; ')}</div></div>`
    default:
      return ''
  }
}

export function fiche({ questions: qs, reglages, T, langue, police, cssPolices }) {
  const niv = reglages.niveau.toUpperCase()
  const titre = `${T('titre', { n: fmt(reglages.plage) })} — ${niv}`
  return documentFiche({
    titre, h1: titre, langue, police, cssPolices, css: CSS,
    corps: `<p class="infos">${T('pNbQuestions', { n: qs.length })}</p>
    ${ligneNomDate(langue)}
    ${qs.map((qu, i) => questionPapier(qu, i, T)).join('')}
    <section class="corrige"><h2>${T('corrige')}</h2>
    <ol class="reponses">${qs.map(qu => `<li>${qu.attendu}</li>`).join('')}</ol></section>`,
  })
}
