// Tables de multiplication — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node).
// Les calculs des tables choisies, avec corrigé.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { CalculFiche, TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      h1 { font-size: 1.25rem; }
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 2rem; }
      .question { display: flex; align-items: baseline; gap: .6rem; margin: .7rem 0; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; font-size: .9rem; }
      .calc { min-width: 120px; font-weight: 800; font-size: 1.2rem; font-family: monospace; }
      .ligne { flex: 1; border-bottom: 1.5px solid #aaa; font-weight: 800; font-size: 1.2rem; font-family: monospace; color: #1a7f37; }
    `

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const { tables, jusqu, questions: qs } = x
  const titre = tables.length === 1 ? T('pTable', { n: tables[0] }) : T('pTables', { liste: tables.join(', ') })
  const ligne = (q: CalculFiche, i: number, corrige: boolean): string => `<div class="question">
    <span class="num">${i + 1}.</span>
    <span class="calc">${q.a} × ${q.b} =</span>
    <span class="ligne">${corrige ? q.r : ''}</span>
  </div>`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS,
    corps: `<p class="infos">${T('pJusqua', { n: jusqu })} &nbsp;|&nbsp; ${T('pNbQuestions', { n: qs.length })}</p>
    ${ligneNomDate(langue)}
    <div class="grid">${qs.map((q, i) => ligne(q, i, false)).join('')}</div>
    <section class="corrige"><h2>${T('corrige')}</h2>
    <div class="grid">${qs.map((q, i) => ligne(q, i, true)).join('')}</div></section>`,
  })
}
