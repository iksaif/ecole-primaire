// Orthographe — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche() : phrases à trous
// (choix à entourer / mot à compléter) et corrigé.
//   fiche({ questions, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; T et langue : toujours le français (exercice de français) ; police : usePoliceFiche() dans l'app
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { echapper as e } from '../../utils/html.js'

const CSS = `
      h2 { font-size: 1rem; margin: 1.4rem 0 .4rem; background: #f0f3f7; padding: .3rem .6rem; border-radius: 6px; }
      .q { display: flex; gap: .6rem; margin: .9rem 0; font-size: 1.2rem; line-height: 2; page-break-inside: avoid; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .paire { white-space: nowrap; margin: 0 .2rem; }
      .choix { display: inline-block; padding: 0 .45rem; font-weight: 700; }
      .sep { color: #aaa; }
      .trou { display: inline-block; min-width: 3.5em; border-bottom: 1.5px solid #888; height: 1.2em; vertical-align: bottom; }
      .indice { color: #777; font-size: .9em; }
      section.corrige { font-size: 1rem; }
      section.corrige h2 { background: none; padding: 0; }
      .corr { margin: .35rem 0; }
      .corr .num { display: inline-block; }`

const TROU = '<span class="trou"></span>'

const enonce = q => {
  if (q.mode === 'choix') {
    const choix = q.choixFiche.map(c => `<span class="choix">${e(c)}</span>`).join('<span class="sep">/</span>')
    return e(q.phrase).replace('___', `<span class="paire">${choix}</span>`)
  }
  // mot à compléter : le trou est dans le mot (« la___in ») ou on donne l'indice entre parenthèses
  const p = e(q.phrase).replace('___', TROU)
  return q.indice && !q.phrase.includes(q.indice) ? `${p} <span class="indice">(${e(q.indice)})</span>` : p
}
const solution = q => (q.mode === 'saisie' && q.indice && q.phrase.includes(q.indice)
  ? e(q.phrase).replace(e(q.indice), `<b>${e(q.attendu)}</b>`)
  : e(q.phrase).replace('___', `<b>${e(q.attendu)}</b>`))

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const { niveau, tous, theme, questions: qs } = x
  const groupes = [
    { mode: 'choix', consigne: T('fEntoure') },
    { mode: 'saisie', consigne: T('fComplete') },
  ].map(g => ({ ...g, qs: qs.filter(q => q.mode === g.mode) })).filter(g => g.qs.length)
  let num = 0
  const corps = groupes.map(g => `<h2>${g.consigne}</h2>
    ${g.qs.map(q => `<div class="q"><span class="num">${++num}.</span><span>${enonce(q)}</span></div>`).join('')}`).join('')
  num = 0
  const corrige = groupes.map(g => g.qs.map(q => `<div class="corr"><span class="num">${++num}.</span> ${solution(q)}</div>`).join('')).join('')
  // « CP → CM2 » : titre sans niveau (fiche publiée exercices-orthographe-cp-cm2)
  const titre = `${T('titre')} — ${T('theme_' + theme)}${tous ? '' : ` — ${niveau.toUpperCase()}`}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px',
    corps: `${ligneNomDate(langue)}
    ${corps}
    <section class="corrige"><h2>${T('corrige')} — ${e(titre)}</h2>${corrige}</section>`,
  })
}
