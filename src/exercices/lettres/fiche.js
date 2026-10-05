// Les lettres — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche() : relier chaque
// majuscule à sa minuscule, par blocs de 6 lettres, et le corrigé.
//   fiche({ questions, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; T et langue : celles de l'interface (alphabet de la langue) ; police : usePoliceFiche() dans l'app
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { echapper as e } from '../../utils/html.js'

// Même police que POLICE_SCRIPT de src/utils/impression.js (module qui lit le navigateur : pas ici)
const SCRIPT = 'Andika'

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .blocs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem 2.5rem; }
      .bloc { display: flex; justify-content: space-between; border: 2px solid #ccc; border-radius: 14px; padding: .6rem 1rem; page-break-inside: avoid; }
      .col { display: flex; flex-direction: column; gap: .35rem; }
      .l { display: flex; align-items: center; gap: .7rem; font-family: '${SCRIPT}', Arial, sans-serif; font-size: 2rem; font-weight: 700; line-height: 1.25; }
      .l span { min-width: 1.6em; text-align: center; }
      .l i { width: .5rem; height: .5rem; border-radius: 50%; background: #333; display: inline-block; }
      .corr { font-size: 1.15rem; line-height: 2; }`

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const { blocs } = x
  const html = blocs.map(({ lettres, droite }) => `<div class="bloc">
      <div class="col">${lettres.map(l => `<div class="l"><span>${e(l)}</span><i></i></div>`).join('')}</div>
      <div class="col min">${droite.map(l => `<div class="l"><i></i><span>${e(l.toLowerCase())}</span></div>`).join('')}</div>
    </div>`).join('')
  // corrigé : un bloc par ligne, dans l'ordre de la fiche, chaque majuscule avec sa minuscule
  const corrige = blocs.map(({ lettres }) => `<div>${lettres.map(l => `${e(l)} – ${e(l.toLowerCase())}`).join(' &nbsp;·&nbsp; ')}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('fConsigne')}</p>
    <div class="blocs">${html}</div>
    <section class="corrige"><h2>${T('corrige')} — ${e(titre)}</h2>
      <div class="corr">${corrige}</div></section>`,
  })
}
