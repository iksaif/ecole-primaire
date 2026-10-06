// Calcul mental — fiche imprimable : la mise en page des calculs que tire `questionsFiche`. Pure (lisible par node).
// Une seule mise en page pour toutes les fiches de l'exercice (bilan, par compétence, à la carte) : seuls les réglages changent.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'
import { libelleOp } from './generateur.ts'
import type { Question } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .question { display: flex; align-items: baseline; gap: .75rem; margin: .85rem 0; }
      .num { min-width: 1.8rem; font-weight: 700; color: #777; font-size: 1rem; }
      .calc { min-width: 180px; font-weight: 800; font-size: 1.3rem; font-family: monospace; }
      .ligne { flex: 1; border-bottom: 1.5px solid #aaa; min-width: 80px; }
      .deux-colonnes { columns: 2; column-gap: 2.5rem; }
      .deux-colonnes .question { break-inside: avoid; margin: .7rem 0; }
      .corrige li { margin: .3rem 0; font-family: monospace; font-size: 1.05rem; }
      .corrige ol { columns: 3; }
    `

export function fiche({ questions, reglages, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, Question[], Cle>): string {
  const niveau = reglages.niveau.toUpperCase()
  const ops = reglages.ops.map(o => libelleOp(o, reglages.niveau, T)).join(', ')
  // « 37 + ___ = 40 » : la case est au milieu du calcul, sans ligne de réponse ; « 7 + 5 = » : la ligne suit le calcul
  const lignes = questions.map((q, i) => `
      <div class="question">
        <span class="num">${i + 1}.</span>
        <span class="calc">${q.trou ? q.texte.replace('?', '___') : q.texte.replace(' = ?', ' =')}</span>
        <span class="ligne" style="${q.trou ? 'border-bottom: none;' : ''}"></span>
      </div>`).join('')
  return documentFiche({
    titre: `${T('titre')} — ${niveau}`, langue, police, cssPolices, css: CSS, largeur: '680px',
    corps: `<p class="infos">${T('pOperations', { ops })} &nbsp;|&nbsp; ${T('pNbQuestions', { n: questions.length })}</p>
    ${ligneNomDate(langue)}
    <div class="${questions.length > 20 ? 'deux-colonnes' : ''}">${lignes}</div>
    <section class="corrige"><h2>${T('corrige')}</h2><ol>${questions.map(q => `<li>${q.texte.replace('?', `<b>${q.attendu}</b>`)}</li>`).join('')}</ol></section>`,
  })
}
