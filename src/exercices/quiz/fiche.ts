// Quiz — fiche imprimable : chaque question et ses propositions à entourer, puis le corrigé (avec ce qu'on apprend). Pure (lisible par
// node), dans la langue du contenu.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import { echapper as e } from '../../utils/html.js'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; margin: .4rem 0 1rem; }
      .q { margin-bottom: 1rem; page-break-inside: avoid; break-inside: avoid; }
      .enonce { font-size: 1.1rem; font-weight: 700; margin-bottom: .35rem; }
      .num { color: #777; }
      .choix { display: flex; flex-wrap: wrap; gap: .4rem 1.6rem; padding-left: 1.6rem; font-size: 1.05rem; }
      .choix span { padding: .1rem .5rem; }
      .corr { margin: .35rem 0; }
      em { color: #666; font-size: .9em; }`

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const titre = `${T('titre')} — ${T(`theme.${x.theme}`)}`
  const questions = x.questions.map((q, i) => `<div class="q"><div class="enonce"><span class="num">${i + 1}.</span> ${e(q.texte)}</div>
    <div class="choix">${q.options.map(o => `<span>${e(o.label)}</span>`).join('')}</div></div>`).join('')
  const corrections = x.questions.map((q, i) => `<div class="corr"><span class="num">${i + 1}.</span> <b>${e(q.attendu)}</b>${q.info ? ` <em>— ${e(q.info)}</em>` : ''}</div>`).join('')
  const corps = `<h1>${e(titre)}</h1>
    ${ligneNomDate(langue)}
    <p class="consigne">${T('consigne')}</p>
    ${questions}
    <section class="corrige"><h2>${T('corrige')} — ${e(titre)}</h2>${corrections}</section>`
  return documentFiche({ titre, langue, police, cssPolices, css: CSS, h1: null, largeur: '700px', corps })
}
