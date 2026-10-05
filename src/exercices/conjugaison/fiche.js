// Conjugaison — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche().
//   fiche({ questions, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; T et langue : toujours le français (exercice de français) ; police : usePoliceFiche() dans l'app
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { verbeDe } from '../../data/conjugaison.js'
import { cleGroupe, cleTemps } from './generateur.js'

const CSS = `
      .consigne { font-size: .95rem; margin: 0 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .verb-box { background: #f5f7fa; border: 1.5px solid #ddd; border-radius: 8px; padding: .8rem 1rem; page-break-inside: avoid; }
      .verb-title { font-size: 1.25rem; font-weight: 900; }
      .verb-title small { font-weight: 400; font-size: .7em; color: #777; }
      .verb-temps { font-size: .95rem; color: #555; margin-bottom: .5rem; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: .35rem 0; font-size: 1.05rem; }
      td.pronom { padding-right: .6rem; font-style: italic; color: #555; font-size: .95rem; white-space: nowrap; width: 1%; }
      .trou { display: inline-block; min-width: 70px; border-bottom: 1.5px solid #888; height: 1.1em; vertical-align: bottom; }
      .trou.long { min-width: 150px; }
      section.corrige .corr { display: inline-block; vertical-align: top; width: 48%; margin: 0 1% .6rem 0; }
      section.corrige h3 { font-size: .95rem; margin: .4rem 0 .2rem; }
      section.corrige td { padding: .05rem .6rem .05rem 0; font-size: .9rem; }`

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const { niveau, lacunes, tableaux } = x
  const nomTemps = temps => T(cleTemps(temps))
  const titreVerbe = p => `${verbeDe(p.verbe).inf} <small>(${T(cleGroupe(p.verbe))})</small>`
  const boites = tableaux.map(p => {
    const rows = p.lignes.map(l => `<tr>
      <td class="pronom">${l.pronom}</td>
      <td class="forme">${lacunes && l.debut ? `<b>${l.debut}</b>` : ''}<span class="trou ${lacunes ? '' : 'long'}"></span></td>
    </tr>`).join('')
    return `<div class="verb-box" data-verbe="${p.verbe}" data-temps="${p.temps}">
      <div class="verb-title">${titreVerbe(p)}</div>
      <div class="verb-temps">${nomTemps(p.temps)}</div>
      <table>${rows}</table>
    </div>`
  }).join('')
  // Corrigé : les formes attendues, partie à écrire en gras
  const corrige = tableaux.map(p => `<div class="corr"><h3>${verbeDe(p.verbe).inf}, ${nomTemps(p.temps).toLowerCase()}</h3><table>${
    p.lignes.map(l => `<tr><td class="pronom">${l.pronom}</td><td>${lacunes ? l.debut : ''}<b>${lacunes ? l.trou : l.forme}</b></td></tr>`).join('')
  }</table></div>`).join('')

  return documentFiche({
    titre: `${T('titre')} — ${niveau.toUpperCase()}`, langue, police, cssPolices, css: CSS,
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${lacunes ? T('ficheLacunes') : T('ficheComplet')}</p>
    <div class="grille">${boites}</div>
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige}</section>`,
  })
}
