// Conjugaison — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Toujours en français
// (exercice de français).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { groupeDe, infinitif } from './generateur.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

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
// fiche « une forme par ligne » : ajouté seulement à ce format (les fiches en tableaux ne changent pas)
const CSS_LIGNES = `
      .lignes { list-style: none; padding: 0; margin: 0; }
      .lignes li { display: flex; align-items: baseline; gap: .5rem; font-size: 1.1rem; padding: .55rem 0; border-bottom: 1px dashed #ddd; page-break-inside: avoid; }
      .lignes .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .lignes .indice { color: #666; font-size: .9rem; min-width: 11rem; }
      .lignes .pronom { font-style: italic; color: #555; }`

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const { niveau, lacunes, tableaux } = x
  const nomTemps = (temps: string): string => T(`temps.${temps}` as Cle)
  const titreVerbe = (p: { verbe: string }): string => `${infinitif(p.verbe)} <small>(${T(`groupe.${groupeDe(p.verbe)}` as Cle)})</small>`
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
  const corrige = tableaux.map(p => `<div class="corr"><h3>${infinitif(p.verbe)}, ${nomTemps(p.temps).toLowerCase()}</h3><table>${
    p.lignes.map(l => `<tr><td class="pronom">${l.pronom}</td><td>${lacunes ? l.debut : ''}<b>${lacunes ? l.trou : l.forme}</b></td></tr>`).join('')
  }</table></div>`).join('')

  // « une forme par ligne » : le verbe et le temps en indice, la forme à écrire (radical donné en mode lacunes)
  if (x.lignes) {
    const items = x.lignes.map((l, i) => `<li data-verbe="${l.verbe}" data-temps="${l.temps}"><span class="num">${i + 1}.</span>
      <span class="indice">${infinitif(l.verbe)}, ${nomTemps(l.temps).toLowerCase()}</span>
      <span class="pronom">${l.pronom}</span> ${lacunes && l.debut ? `<b>${l.debut}</b>` : ''}<span class="trou ${lacunes && l.debut ? '' : 'long'}"></span></li>`).join('')
    const corr = x.lignes.map((l, i) => `<tr><td class="pronom">${i + 1}. ${l.pronom}</td><td>${lacunes ? l.debut : ''}<b>${lacunes ? l.trou : l.forme}</b></td></tr>`).join('')
    return documentFiche({
      titre: `${T('titre')} — ${niveau.toUpperCase()}`, langue, police, cssPolices, css: CSS + CSS_LIGNES,
      corps: `${ligneNomDate(langue)}
    <p class="consigne">${lacunes ? T('ficheLacunes') : T('ficheComplet')}</p>
    <ol class="lignes">${items}</ol>
    <section class="corrige"><h2>${T('corrige')}</h2><table>${corr}</table></section>`,
    })
  }
  return documentFiche({
    titre: `${T('titre')} — ${niveau.toUpperCase()}`, langue, police, cssPolices, css: CSS,
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${lacunes ? T('ficheLacunes') : T('ficheComplet')}</p>
    <div class="grille">${boites}</div>
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige}</section>`,
  })
}
