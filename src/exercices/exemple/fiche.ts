// Exemple d'exercice — fiche imprimable : la mise en page des questions que tire `questionsFiche`. Pure (lisible par node).
// Pour un dessin SVG, voir heure/horloge.js ; pour une fiche en plusieurs pages, `h1: null` dans documentFiche.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche, Traducteur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'

// les clés que T accepte : celles du catalogue de l'exercice et les mots communs (une clé inconnue ne compile pas)
type Cle = CleContenu<typeof CONTENU>
import type { Question } from './generateur.ts'

const CSS = `
      .consigne { font-weight: 700; margin: .4rem 0 1rem; }
      .suite { font-size: 1.4rem; margin-bottom: 1.1rem; page-break-inside: avoid; }
      .terme, .case { display: inline-block; min-width: 3rem; text-align: center; margin-right: .3rem; }
      .case { border: 2.5px solid #444; border-radius: 8px; height: 2.4rem; vertical-align: middle; }
      .regle { font-size: 1rem; margin-left: .8rem; }`

const caseVide = '<span class="case"></span>'

// Ce que montre la ligne d'une question. Le switch est exhaustif : une nouvelle forme de question ne compile pas ici.
function ligne(q: Question, T: Traducteur<Cle>): string {
  switch (q.type) {
    case 'complete':
      return q.termes.map((n, i) => (i === q.trou ? caseVide : `<span class="terme">${n}</span>`)).join('')
    case 'regle':
      return `${q.termes.map(n => `<span class="terme">${n}</span>`).join('')}<span class="regle">${T('regleFiche')}</span> ${caseVide}`
  }
}

// Ce que montre le corrigé
function corrige(q: Question, T: Traducteur<Cle>): string {
  switch (q.type) {
    case 'complete':
      return String(q.attendu)
    case 'regle':
      return T('corrigeRegle', { pas: q.pas })
  }
}

export function fiche({ questions, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, Question[], Cle>): string {
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS,
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('consigneFiche', { n: questions.length })}</p>
    ${questions.map((q, i) => `<div class="suite">${i + 1}. ${ligne(q, T)}</div>`).join('')}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <p>${questions.map((q, i) => `${i + 1}. ${corrige(q, T)}`).join(' — ')}</p></section>`,
  })
}
