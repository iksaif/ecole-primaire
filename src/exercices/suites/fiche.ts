// Suites de nombres — fiche imprimable : la mise en page des suites que tire `questionsFiche`. Pure (lisible par node).
// Une seule mise en page pour toutes les fiches de l'exercice (bilan, par compétence, à la carte) : seuls les réglages changent.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche, Traducteur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'
import type { Question } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; margin: .3rem 0 .6rem; }
      .suite { font-size: 1.3rem; margin-bottom: .75rem; page-break-inside: avoid; }
      .terme, .case { display: inline-block; min-width: 3.2rem; text-align: center; margin-right: .3rem; }
      .case { border: 2.5px solid #444; border-radius: 8px; height: 2.2rem; vertical-align: middle; }
      .regle { font-size: 1rem; margin: 0 .5rem 0 .8rem; }
      .corrige p { line-height: 1.8; }`

const caseVide = '<span class="case"></span>'
const termes = (q: Question): string => q.termes.map((n, i) => (q.type !== 'regle' && q.trous.includes(i) ? caseVide : `<span class="terme">${n}</span>`)).join('')

// La ligne d'une suite : ses termes (cases vides aux trous), puis « on change de … » pour trouver le pas
function ligne(q: Question, T: Traducteur<Cle>): string {
  return q.type === 'regle' ? `${termes(q)}<span class="regle">${T('regleFiche')}</span> ${caseVide}` : termes(q)
}

// Le corrigé : les nombres à écrire (dans l'ordre des cases), ou le pas
function corrige(q: Question, T: Traducteur<Cle>): string {
  return q.type === 'regle' ? T('corrigeRegle', { pas: q.pas }) : q.attendus.join(' ; ')
}

// Une consigne par sorte d'exercice présent sur la fiche, toujours dans le même ordre
function consignes(questions: Question[], T: Traducteur<Cle>): string {
  const texte = { poursuivre: T('consignePoursuivre'), complete: T('consigneComplete'), regle: T('consigneRegle') }
  return (['poursuivre', 'complete', 'regle'] as const).filter(t => questions.some(q => q.type === t)).map(t => `<p class="consigne">${texte[t]}</p>`).join('')
}

export function fiche({ questions, reglages, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, Question[], Cle>): string {
  const titre = `${T('titre')} — ${reglages.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS,
    corps: `${ligneNomDate(langue)}
    ${consignes(questions, T)}
    ${questions.map((q, i) => `<div class="suite">${i + 1}. ${ligne(q, T)}</div>`).join('')}
    <section class="corrige"><h2>${T('corrige')} — ${T('titre')}</h2>
      <p>${questions.map((q, i) => `${i + 1}. ${corrige(q, T)}`).join(' — ')}</p></section>`,
  })
}
