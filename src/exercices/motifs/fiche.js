// Les motifs — fiche imprimable (pure : lisible par node). Frises à continuer (cases vides à dessiner ou à remplir de
// gommettes) ; PS : entourer ce qui vient après.
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { suite } from '../../utils/motifs.js'

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .ligne { display: flex; align-items: center; gap: .35rem; margin-bottom: 1.1rem; font-size: 1.9rem; page-break-inside: avoid; }
      .num { font-size: .9rem; font-weight: 700; color: #999; min-width: 1.6rem; }
      .case { width: 2.4rem; height: 2.4rem; border: 2.5px dashed #444; border-radius: 50%; display: inline-block; }
      .fleche { margin: 0 .6rem; color: #999; } .choix { border: 2px solid #bbb; border-radius: 12px; padding: 0 .3rem; margin-left: .4rem; }
      .corr { columns: 3; font-size: 1.3rem; line-height: 1.9; }
    `

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const ps = x.niveau === 'ps'
  const lignes = x.questions.map((q, i) => {
    const vus = q.place >= q.motif.length ? q.motif : q.motif.map((e, j) => (j === q.place ? null : e))
    const cases = vus.map(e => (e === null ? '<span class="case"></span>' : `<span>${q.elements[e]}</span>`)).join('')
    const fin = q.place >= q.motif.length ? (ps ? `<span class="fleche">→</span>${[...q.choix].map(c => `<span class="choix">${q.elements[c]}</span>`).join('')}` : '<span class="case"></span><span class="case"></span>') : ''
    return `<div class="ligne" data-type="${q.type}"><span class="num">${i + 1}.</span>${cases}${fin}</div>`
  }).join('')
  // corrigé : les deux éléments qui continuent la frise, ou l'élément du trou (PS : celui à entourer)
  const corr = x.questions.map((q, i) => {
    const deux = q.place >= q.motif.length && !ps
    const attendus = deux ? suite(q.type, q.place + 2).slice(q.place) : [q.attendu]
    return `<div>${i + 1}. ${attendus.map(e => q.elements[e]).join(' ')}</div>`
  }).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T(ps ? 'fConsignePS' : x.mode === 'trou' ? 'fConsigneTrou' : 'fConsigne')}</p>
    ${lignes}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2><div class="corr">${corr}</div></section>`,
  })
}
