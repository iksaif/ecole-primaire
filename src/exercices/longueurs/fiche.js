// Plus long, plus court — fiche imprimable (pure : lisible par node). Entourer le plus long (ou le plus court) ;
// MS et GS : numéroter du plus court au plus long.
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { LARGEUR, rangsAttendus } from './generateur.js'

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .bloc { display: flex; align-items: center; gap: .8rem; border: 2px solid #ddd; border-radius: 12px; padding: .5rem .8rem; margin-bottom: .7rem; page-break-inside: avoid; }
      .num { font-weight: 700; color: #999; min-width: 1.4rem; } .liste { flex: 1; }
      .ligne { display: flex; align-items: center; gap: .6rem; height: 11mm; border-left: 3px solid #999; }
      .case { width: 8mm; height: 8mm; border: 2px solid #444; border-radius: 6px; flex: none; margin-left: .4rem; }
      .quoi { font-weight: 700; min-width: 7rem; }
      .ligne { height: 15mm; } .liste { min-width: 0; } .quoi { flex: none; white-space: nowrap; min-width: 0; } .corr { columns: 3; font-size: 1.1rem; line-height: 1.8; }
    `

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const { ranger, questions: qs } = x
  const ps = x.niveau === 'ps'
  // 0,4 mm par unité : le plus long crayon fait au plus 12 cm
  const crayon = c => `<svg viewBox="0 0 ${LARGEUR} 34" width="${LARGEUR * 0.4}mm" height="${34 * 0.4}mm">
    <rect x="2" y="7" width="${c.longueur - 24}" height="20" rx="4" fill="none" stroke="#222" stroke-width="2.5"/>
    <polygon points="${c.longueur - 22},7 ${c.longueur},17 ${c.longueur - 22},27" fill="none" stroke="#222" stroke-width="2.5"/></svg>`
  const blocs = qs.map((q, i) => `<div class="bloc"><span class="num">${i + 1}.</span><div class="liste">${q.crayons.map(c => `<div class="ligne">${ranger ? '<span class="case"></span>' : ''}${crayon(c)}</div>`).join('')}</div>${ranger || ps ? '' : `<span class="quoi">${T(q.cherche === 'long' ? 'fLong' : 'fCourt')}</span>`}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T(ranger ? 'fConsigneRanger' : ps ? 'fConsignePS' : 'fConsigne')}</p>
    ${blocs}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => {
        const rangs = rangsAttendus(q)
        const lettre = q.crayons.map((_, j) => ranger ? rangs.indexOf(j) + 1 : (j === rangs[q.cherche === 'long' ? rangs.length - 1 : 0] ? '◯' : '·'))
        return `<div>${i + 1}. ${lettre.join(' ')}</div>`
      }).join('')}</div></section>`,
  })
}
