// La géométrie — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche().
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; police et cssPolices : usePoliceFiche() dans l'app (Andika par défaut)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { svgFigure, svgCercle, svgPatron, svgSolide, svgGrilleCm } from './dessins.js'

const CSS = `
      @page { size: A4; margin: 1.2cm; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      h1 { font-size: 1.25rem; }
      h2 { font-size: 1.05rem; margin: .6cm 0 .2cm; break-after: avoid; }
      .avertissement { font-size: .8rem; color: #a00; margin-bottom: .4cm; }
      .consigne { font-size: .95rem; margin: .1cm 0 .2cm; }
      .bloc { break-inside: avoid; margin-bottom: .4cm; }
      .duo { display: flex; gap: .5cm; align-items: flex-start; flex-wrap: wrap; }
      .galerie { display: flex; flex-wrap: wrap; gap: .4cm; }
      .item { width: 5.5cm; text-align: center; }
      .item.libre { width: auto; padding: .2cm; }
      .ligne { border-bottom: 1.5px solid #888; margin: .2cm .4cm 0; height: .8cm; }
      .lignes { font-size: 1rem; margin-top: .2cm; }
      svg { display: block; }
      .mini svg { display: inline-block; vertical-align: middle; margin: .1cm .4cm .1cm 0; }`

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  let corps = ''
  // corrigé : une ligne par partie, réponses dans l'ordre de la fiche
  const corrige = []
  const ligneCorrige = (titre, rep) => corrige.push(`<p><b>${titre} :</b> ${rep}</p>`)
  const numeros = l => l.map((r, i) => `${i + 1}. ${r}`).join(' — ')
  const nomFig = id => T('figures')[id]
  const nomSol = id => T('solides')[id]

  if (x.symetrie) {
    const qs = x.symetrie
    corps += `<h2>🦋 ${T('ficheSymetrie')}</h2><p class="consigne">${T('ficheSymetrieConsigne')}</p>`
    corps += qs.map(q => `<div class="bloc">${svgGrilleCm({ cols: q.cols, rows: q.rows, pleines: q.modele, axe: q.axe })}</div>`).join('')
    ligneCorrige(T('ficheSymetrie'), `<span class="mini">${qs.map(q =>
      svgGrilleCm({ cols: q.cols, rows: q.rows, pleines: [...q.modele, ...q.cellules], axe: q.axe, echelle: 0.35 })).join('')}</span>`)
  }
  if (x.reproduction) {
    const qs = x.reproduction
    corps += `<h2>✏️ ${T('ficheReproduction')}</h2><p class="consigne">${T('ficheReproductionConsigne')}</p>`
    corps += qs.map(q => `<div class="bloc duo">${svgGrilleCm({ cols: q.cols, rows: q.rows, pleines: q.modele, repere: q.repere })}${svgGrilleCm({ cols: q.cols, rows: q.rows, repere: q.repere })}</div>`).join('')
    ligneCorrige(T('ficheReproduction'), T('corrigeReproduction'))
  }
  if (x.reperage) {
    const { cols, rows, aColorier, symboles, lectures } = x.reperage
    corps += `<h2>📍 ${T('ficheReperage')}</h2><div class="bloc duo">
      <div><p class="consigne">${T('ficheColorie')} : <b>${aColorier.join(', ')}</b></p>${svgGrilleCm({ cols, rows, entetes: true })}</div>
      <div><p class="consigne">${T('ficheNomCase')} :</p>${svgGrilleCm({ cols, rows, entetes: true, symboles })}
      <p class="lignes">${Object.values(symboles).map(s => `${s} : ______`).join(' &nbsp; ')}</p></div></div>`
    ligneCorrige(T('ficheReperage'), lectures.map(l => `${l.symbole} : ${l.nom}`).join(' — '))
  }
  if (x.figures) {
    corps += `<h2>🔷 ${T('ficheFigures')}</h2><p class="consigne">${T('ficheFiguresConsigne')}</p><div class="bloc galerie">`
      + x.figures.map(f => `<div class="item">${svgFigure(f, true, 110)}<div class="ligne"></div></div>`).join('')
      + `</div>`
    ligneCorrige(T('ficheFigures'), numeros(x.figures.map(f => nomFig(f.forme))))
  }
  if (x.solides) {
    corps += `<h2>🧊 ${T('ficheSolides')}</h2><p class="consigne">${T('ficheSolidesConsigne')}</p><div class="bloc galerie">`
      + x.solides.map(s => `<div class="item">${svgSolide(s, 110)}<div class="ligne"></div></div>`).join('')
      + `</div>`
    ligneCorrige(T('ficheSolides'), numeros(x.solides.map(nomSol)))
  }
  if (x.angles) {
    corps += `<h2>📐 ${T('ficheAngles')}</h2><p class="consigne">${T('ficheAnglesConsigne')}</p><div class="bloc galerie">`
      + x.angles.map(q => `<div class="item">${svgFigure(q, false, 130)}<div class="ligne"></div></div>`).join('') + `</div>`
    ligneCorrige(T('ficheAngles'), numeros(x.angles.map(q => q.attendu)))
  }
  if (x.proprietes) {
    corps += `<h2>📋 ${T('ficheVraiFauxTitre')}</h2><p class="consigne">${T('ficheVraiFauxConsigne')}</p>`
      + x.proprietes.map((p, i) => `<p class="lignes">${i + 1}. ${T('proprietes')[p.id]} &nbsp; <b>${T('ficheVraiFaux')}</b></p>`).join('')
    const [vrai, faux] = T('vraiFaux')
    ligneCorrige(T('ficheVraiFauxTitre'), numeros(x.proprietes.map(p => (p.vrai ? vrai : faux))))
  }
  if (x.cercle) {
    corps += `<h2>⭕ ${T('ficheCercle')}</h2><div class="bloc duo">
      <div><p class="consigne">${T('ficheCercleTrace')}</p>
        <svg width="7cm" height="7cm" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"><circle cx="3.5" cy="3.5" r="0.07" fill="#000"/><text x="3.65" y="3.35" font-size="0.4" font-family="Arial">O</text></svg></div>
      <div><p class="consigne">${T('ficheCercleRepasse')}</p>${svgCercle({ sous: 'lequel', rot: x.cercle.rot, pts: { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' } }, 190)}</div></div>`
    ligneCorrige(T('ficheCercle'), T('corrigeCercle', { rayon: '[OA]', diametre: '[BC]' }))
  }
  if (x.patrons) {
    corps += `<h2>🎲 ${T('fichePatrons')}</h2><p class="consigne">${T('fichePatronsConsigne')}</p><div class="bloc galerie">`
      + x.patrons.map(c => `<div class="item libre">${svgPatron(c.cases, { cote: 1, unite: 'cm' })}</div>`).join('') + `</div>`
    const liste = x.patrons.map((c, i) => (c.valide ? i + 1 : 0)).filter(Boolean).join(', ')
    ligneCorrige(T('fichePatrons'), T('corrigePatrons', { liste }))
  }

  const titre = `${T('titre')} — ${x.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: 'none', marge: '0',
    corps: `${ligneNomDate(langue)}
    <p class="avertissement">⚠️ ${T('ficheAvertissement')}</p>
    ${corps}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige.join('')}</section>`,
  })
}
