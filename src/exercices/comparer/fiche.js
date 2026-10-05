// Comparer les quantités — fiche imprimable (pure : lisible par node). Deux groupes par ligne, entourer celui qui a le
// plus (avec corrigé).
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .ligne { display: flex; align-items: center; gap: 1.5rem; margin-bottom: .8rem; page-break-inside: avoid; }
      .num { font-weight: 700; color: #999; min-width: 1.5rem; }
      .groupe { flex: 1; border: 2px dashed #bbb; border-radius: 18px; padding: .6rem; min-height: 4.2rem;
        display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center; align-content: center; font-size: 1.6rem; line-height: 1.1; }
      .corr { columns: 3; font-size: 1.1rem; line-height: 2; }
    `

export function fiche({ questions: qs, T, langue, police, cssPolices }) {
  const groupe = (n, emoji) => `<div class="groupe">${`<span>${emoji}</span>`.repeat(n)}</div>`
  const lignes = qs.map((q, i) => `<div class="ligne"><span class="num">${i + 1}.</span>
    ${groupe(q.gauche, q.emoji)}${groupe(q.droite, q.emoji)}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('fConsigne')}</p>
    ${lignes}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => `<div>${i + 1}. ${q.reponse === 'gauche' ? `<b>${q.gauche}</b> · ${q.droite}` : `${q.gauche} · <b>${q.droite}</b>`}</div>`).join('')}</div></section>`,
  })
}
