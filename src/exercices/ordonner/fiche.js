// Ranger les nombres — fiche imprimable (pure : lisible par node). Nombres en désordre à recopier dans l'ordre, avec
// corrigé.
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .item { margin-bottom: 1rem; page-break-inside: avoid; }
      .sens { font-size: .9rem; color: #555; font-weight: 700; margin-bottom: .3rem; }
      .ligne { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
      .nombres { display: flex; gap: .5rem; }
      .nombres span { font-size: 1.6rem; font-weight: 800; border: 2px solid #999; border-radius: 50%; width: 2.6rem; height: 2.6rem;
        display: inline-flex; align-items: center; justify-content: center; }
      .cases { display: flex; align-items: center; gap: .3rem; }
      .case { width: 2.8rem; height: 2.8rem; border: 2.5px solid #444; border-radius: 8px; display: inline-block; }
      .signe { font-size: 1.3rem; color: #888; font-weight: 700; }
      .corr { font-size: 1.1rem; line-height: 2; }
    `

export function fiche({ questions: qs, T, langue, police, cssPolices }) {
  const consigne = sens => (sens === 'croissant' ? '⬆️ ' + T('rangeCroissant') : '⬇️ ' + T('rangeDecroissant'))
  const lignes = qs.map((q, i) => {
    const cr = q.sens === 'croissant'
    return `<div class="item"><div class="sens">${i + 1}. ${consigne(q.sens)}</div>
      <div class="ligne"><div class="nombres">${q.nombres.map(n => `<span>${n}</span>`).join('')}</div>
      <div class="cases">${q.nombres.map(() => '<span class="case"></span>').join(`<span class="signe">${cr ? '&lt;' : '&gt;'}</span>`)}</div></div></div>`
  }).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('fConsigne')}</p>
    ${lignes}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => `<div>${i + 1}. ${q.bonne.join(q.sens === 'croissant' ? ' &lt; ' : ' &gt; ')}</div>`).join('')}</div></section>`,
  })
}
