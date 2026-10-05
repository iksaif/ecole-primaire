// Calcul posé — fiche imprimable (pure : lisible par node). Des opérations en colonnes à compléter, avec corrigé.
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'

const CSS = `
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
    `

export function fiche({ questions: qs, reglages, T, langue, police, cssPolices }) {
  const titre = `${T('titre')} — ${reglages.niveau.toUpperCase()}`
  const operations = T(({ add: 'additions', sou: 'soustractions', mul: 'multiplications' })[reglages.op] ?? 'melange')

  const carte = (q, corrige) => {
    const cell = ch => `<td style="width:2.2rem;text-align:center;font-size:1.5rem;font-weight:800;font-family:monospace;">${ch.trim() || '&nbsp;'}</td>`
    const rowA = q.chiffresA.map(cell).join('')
    const rowB = q.chiffresB.map(cell).join('')
    const rowR = q.chiffresR.map(ch => `<td style="width:2.2rem;text-align:center;font-size:1.5rem;font-weight:800;font-family:monospace;color:#1a7f37;border-bottom:2px solid #333;">${corrige ? (ch.trim() || '&nbsp;') : '&nbsp;'}</td>`).join('')
    const signCell = `<td style="width:1.8rem;text-align:center;font-size:1.5rem;font-weight:900;color:#1a5fb4;vertical-align:middle;">`
    return `<div style="display:inline-block;margin:1rem 1.5rem;vertical-align:top;">
      <table style="border-collapse:collapse;">
        <tr>${signCell}&nbsp;</td>${rowA}</tr>
        <tr>${signCell}${q.opLabel}</td>${rowB}</tr>
        <tr><td colspan="${q.cols + 1}" style="padding:0;"><hr style="border:none;border-top:2.5px solid #222;margin:4px 0;"/></td></tr>
        <tr>${signCell}&nbsp;</td>${rowR}</tr>
      </table>
    </div>`
  }
  const cards = qs.map(q => carte(q, false)).join('')
  const corrige = `<section class="corrige"><h2>${T('corrige')}</h2>
    <div style="text-align:center;">${qs.map(q => carte(q, true)).join('')}</div></section>`

  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.5cm',
    corps: `<p class="infos">${operations} &nbsp;|&nbsp; ${T('pNbExercices', { n: qs.length })}</p>
    ${ligneNomDate(langue)}
    <div style="text-align:center;">${cards}</div>
    ${corrige}`,
  })
}
