// Vocabulaire — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche().
//   fiche({ questions, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; T et langue : toujours le français (exercice de français) ; police : usePoliceFiche() dans l'app
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { typesDuNiveau } from './definition.js'
import { valeur } from './generateur.js'

const CSS = `
      h2 { font-size: 1rem; margin: 1.4rem 0 .4rem; background: #f0f3f7; padding: .3rem .6rem; border-radius: 6px; }
      .q { display: flex; gap: .6rem; margin: .7rem 0; font-size: 1.15rem; line-height: 2; page-break-inside: avoid; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .contenu { flex: 1; }
      .ligne { display: inline-block; min-width: 200px; border-bottom: 1.5px solid #888; height: 1.2em; vertical-align: bottom; }
      .ligne.courte { min-width: 80px; }
      .case { display: inline-block; width: 1em; height: 1em; border: 1.5px solid #555; vertical-align: middle; margin: 0 .2rem; }
      .lignebloc .ligne { display: block; width: 100%; margin-top: .3rem; }
      .choix { display: inline-flex; flex-wrap: wrap; gap: 1.2rem; }
      .opt { padding: 0 .3rem; }
      em { color: #555; }
      section.corrige { font-size: .95rem; }
      section.corrige h2 { background: none; padding: 0; }
      .corr { margin: .3rem 0; }`

const LIGNE = '<span class="ligne"></span>'
const b = s => `<strong>${s}</strong>`

// Rendu d'une question sur papier
function questionFiche(q, T) {
  const liste = c => `<span class="choix">${c.map(x => `<span class="opt">${x}</span>`).join('')}</span>`
  const html = valeur(q.html, T)
  switch (q.type) {
    case 'alpha':
      return `<div>${q.etiquettes.join(' – ')}</div><div class="lignebloc">${LIGNE}</div>`
    case 'lettre':
      return `<div>${html.replace(/ \?$/, '')} : <span class="ligne courte"></span></div>`
    case 'contraires': case 'synonymes':
      return `<div>${b(html)} → ${liste(q.choix)}</div>`
    case 'definitions':
      return `<div>${html}</div><div>${liste(q.choix)}</div>`
    case 'familles': case 'intrus':
      return `<div>${liste(q.choix)}</div>`
    case 'categorie':
      return `<div>${html} → ${LIGNE}</div>`
    case 'prefixes':
      return `<div>…${html.replace('<span class="trou">___</span>', '').replace(/<div class="sens">(.*)<\/div>/, ' <em>($1)</em>')} → ${LIGNE}</div>`
    case 'suffixes':
      return `<div>${html.replace('<span class="trou">___</span>', '…').replace(/<div class="sens">(.*)<\/div>/, ' <em>($1)</em>')} → ${LIGNE}</div>`
    case 'dictionnaire':
      return `<div>${b(html)} → ${liste(q.choix)}</div>`
    case 'contexte':
      return `<div>${html}</div><div>${liste(q.choix)}</div>`
    case 'homonymes':
      return `<div>${html.replace('<span class="trou">___</span>', '<span class="ligne courte"></span>')} <em>(${q.choix.join(', ')})</em></div>`
    case 'sensFigure':
      return `<div>${html} &nbsp; <span class="case"></span> ${T('lettreP')} &nbsp; <span class="case"></span> ${T('lettreF')}</div>`
  }
  return ''
}

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const { niveau, questions: qs } = x
  const ordre = typesDuNiveau(niveau)
  const types = [...new Set(qs.map(q => q.type))].sort((a, c) => ordre.indexOf(a) - ordre.indexOf(c))
  const parType = types.map(ty => ({ t: ty, qs: qs.filter(q => q.type === ty) }))
  let num = 0
  const corps = parType.map(g => `
    <h2>${T('f_' + g.t)}</h2>
    ${g.qs.map(q => { num++; return `<div class="q"><span class="num">${num}.</span><div class="contenu">${questionFiche(q, T)}</div></div>` }).join('')}
  `).join('')
  num = 0
  const corrige = parType.map(g => g.qs.map(q => { num++; return `<div class="corr"><span class="num">${num}.</span> ${valeur(q.solution, T)}</div>` }).join('')).join('')
  return documentFiche({
    titre: `${T('titre')} — ${niveau.toUpperCase()}`, langue, police, cssPolices, css: CSS, largeur: '700px',
    corps: `${ligneNomDate(langue)}
    ${corps}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige}</section>`,
  })
}
