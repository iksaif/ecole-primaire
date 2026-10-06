// Les nombres — fiche imprimable : la mise en page des questions de questionsFiche(). Pure (lisible par node).
// Les dessins (matériel de base 10, droite graduée) sont ceux du jeu : src/dessins/base10.ts, src/dessins/droite.ts.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import { echapper } from '../../utils/html.js'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { fmt, LIBELLES_CDU } from './generateur.ts'
import type { Question, TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

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

const LIGNE = '<span class="case-ligne"></span>'

function questionPapier(qu: Question, i: number, T: (cle: Cle, params?: Record<string, unknown>) => string): string {
  const num = `<span class="num">${i + 1}.</span>`
  switch (qu.type) {
    case 'decomposer':
      if (qu.kind === 'cdu') {
        const champs = qu.champs.map(ch => `<span class="case"></span> ${T(LIBELLES_CDU[ch])}`).join(' &nbsp; ')
        return `<div class="q">${num}<b>${qu.texte}</b> = ${champs}</div>`
      }
      return `<div class="q">${num}<b>${qu.texte}</b> = ${LIGNE}</div>`
    case 'representation':
      return `<div class="q bloc">${num}${T('pRepresente')} <small>${T('pLegende', { m: qu.milliers ? T('pLegendeM') : '' })}</small><div class="svg">${qu.svg}</div>${T('pCestLeNombre')} ${LIGNE}</div>`
    case 'lettresChiffres':
      return `<div class="q">${num}<b>${qu.texte}</b> → ${T('pEnChiffres')} ${LIGNE}</div>`
    case 'chiffresLettres':
      return `<div class="q">${num}${T('pEcrisLettres', { n: `<b>${qu.texte}</b>` })} <span class="case-ligne longue"></span></div>`
    case 'comparer':
      return `<div class="q">${num}<b>${qu.libelle.replace('…', '<span class="case"></span>')}</b> <small>${echapper(T('pComparerAide'))}</small></div>`
    case 'suites':
      if (qu.termes) {
        // les suites à trou sont plus simples à reconstruire proprement
        const termes = qu.termes.map((v, k) => (k === qu.trou ? LIGNE : `<b>${fmt(v)}</b>`)).join(', ')
        return `<div class="q">${num}${T('pSuite')} ${termes}</div>`
      }
      if (qu.texte.endsWith('= ?')) return `<div class="q">${num}<b>${qu.texte.replace('= ?', '=')}</b> ${LIGNE}</div>`
      return `<div class="q">${num}${qu.texte} : ${LIGNE}</div>`
    case 'droite':
      return `<div class="q bloc">${num}${T('pFlecheQ')} <small>${T('pFlecheAide', { pas: fmt(qu.pas ?? 1) })}</small><div class="svg">${qu.svg}</div>${T('pFlecheMontre')} ${LIGNE}</div>`
    case 'ranger':
      return `<div class="q bloc">${num}${T('pRange')} <b>${qu.nombres.map(fmt).join(' &nbsp; ; &nbsp; ')}</b><div style="margin-top:.6rem;">${qu.nombres.map(() => LIGNE).join(' &lt; ')}</div></div>`
  }
}

export function fiche({ questions: qs, reglages, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
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
