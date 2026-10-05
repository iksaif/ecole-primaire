// Calcul mental — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche().
//   fiche({ questions, reglages, niveau, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { libelleOp } from './generateur.js'

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

export function fiche({ questions: qs, reglages, T, langue, police, cssPolices }) {
  const niv = reglages.niveau.toUpperCase()
  const ops = reglages.ops.map(o => libelleOp(o, reglages.niveau, T)).join(', ')
  const rows = qs.map((q, i) => {
    const isComplement = !q.texte.endsWith(' = ?')
    const calcText = isComplement ? q.texte.replace('?', '___') : q.texte.replace(' = ?', ' =')
    const ligneStyle = isComplement ? 'border-bottom: none;' : ''
    return `
      <div class="question">
        <span class="num">${i + 1}.</span>
        <span class="calc">${calcText}</span>
        <span class="ligne" style="${ligneStyle}"></span>
      </div>`
  }).join('')
  const titre = `${T('titre')} — ${niv}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '680px',
    corps: `<p class="infos">${T('pOperations', { ops })} &nbsp;|&nbsp; ${T('pNbQuestions', { n: qs.length })}</p>
    ${ligneNomDate(langue)}
    <div class="${qs.length > 20 ? 'deux-colonnes' : ''}">${rows}</div>
    <section class="corrige"><h2>${T('corrige')}</h2><ol>${qs.map(q => `<li>${q.texte.replace('?', `<b>${q.reponse}</b>`)}</li>`).join('')}</ol></section>`,
  })
}
