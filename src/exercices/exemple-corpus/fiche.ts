// Exemple d'exercice à corpus — fiche imprimable. Toujours en français (`contenu: 'fr'` : le T reçu est le français).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'

// les clés que T accepte : celles du catalogue de l'exercice et les mots communs (une clé inconnue ne compile pas)
type Cle = CleContenu<typeof CONTENU>
import type { Question } from './generateur.ts'

const CSS = `
      .consigne { font-weight: 700; margin: .4rem 0 1rem; }
      .question { margin-bottom: 1.1rem; page-break-inside: avoid; }
      .choix { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: .3rem; }
      .case { display: inline-block; width: .9rem; height: .9rem; border: 2px solid #444; border-radius: 3px; margin-right: .3rem; vertical-align: middle; }`

export function fiche({ questions, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, Question[], Cle>): string {
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS,
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T('consigneFiche')}</p>
    ${questions.map((q, i) => `<div class="question">${i + 1}. <b>${q.mot}</b>
      <div class="choix">${q.options.map(o => `<span><span class="case"></span>${o.label}</span>`).join('')}</div></div>`).join('')}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <p>${questions.map((q, i) => `${i + 1}. ${q.mot} = ${q.attendu}`).join(' — ')}</p></section>`,
  })
}
