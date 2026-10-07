// Plus long, plus court — fiche imprimable : la mise en page du tirage de `questionsFiche`. Pure (lisible par node). Entourer le plus
// long (ou le plus court) ; MS et GS : numéroter du plus court au plus long. Le crayon est celui du jeu, en traits (crayon.ts).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { Tirage } from './generateur.ts'
import { rangsAttendus } from './generateur.ts'
import { svgCrayon } from './crayon.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .bloc { display: flex; align-items: center; gap: .8rem; border: 2px solid #ddd; border-radius: 12px; padding: .5rem .8rem; margin-bottom: .7rem; page-break-inside: avoid; }
      .num { font-weight: 700; color: #999; min-width: 1.4rem; } .liste { flex: 1; }
      .ligne { display: flex; align-items: center; gap: .6rem; height: 11mm; border-left: 3px solid #999; }
      .case { width: 8mm; height: 8mm; border: 2px solid #444; border-radius: 6px; flex: none; margin-left: .4rem; }
      .quoi { font-weight: 700; min-width: 7rem; }
      .ligne { height: 15mm; } .liste { min-width: 0; } .quoi { flex: none; white-space: nowrap; min-width: 0; } .corr { columns: 3; font-size: 1.1rem; line-height: 1.8; }
    `

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, Tirage, Cle>): string {
  const { ranger, questions: qs } = x
  const ps = x.niveau === 'ps'
  const blocs = qs.map((q, i) => `<div class="bloc"><span class="num">${i + 1}.</span><div class="liste">${q.crayons.map(c => `<div class="ligne">${ranger ? '<span class="case"></span>' : ''}${svgCrayon(c, { impression: true })}</div>`).join('')}</div>${ranger || ps ? '' : `<span class="quoi">${T(q.cherche === 'long' ? 'fLong' : 'fCourt')}</span>`}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T(ranger ? 'fConsigneRanger' : ps ? 'fConsignePS' : 'fConsigne')}</p>
    ${blocs}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => {
        const rangs = rangsAttendus(q)
        const marques = q.crayons.map((_, j) => ranger ? rangs.indexOf(j) + 1 : (j === rangs[q.cherche === 'long' ? rangs.length - 1 : 0] ? '◯' : '·'))
        return `<div>${i + 1}. ${marques.join(' ')}</div>`
      }).join('')}</div></section>`,
  })
}
