// Le premier, le dernier — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Une file par question, la consigne
// écrite sous le numéro, et l'enfant colorie l'objet dit (une case dessinée sous chaque objet) ; le corrigé donne la place.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { imagesDe } from '../../images/rendu.ts'
import { consignesDe } from '../../images/consignes.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'
import { corrige as corrigeDe } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .question { margin-bottom: 1.1rem; page-break-inside: avoid; }
      .dit { font-weight: 800; font-size: 1.05rem; margin-bottom: .3rem; }
      .num { color: #999; margin-right: .4rem; }
      .depart { font-size: 1.6rem; color: #1d4e9e; align-self: center; margin-right: .2rem; }
      .file { display: flex; gap: .3rem; align-items: flex-end; flex-wrap: nowrap; }
      .place { display: flex; flex-direction: column; align-items: center; font-size: 2rem; line-height: 1.1; }
      .case { width: 2.1rem; height: 1rem; border: 2px solid #444; border-radius: 4px; margin-top: .15rem; }
      .corr { columns: 2; font-size: 1.1rem; line-height: 2; }
    `

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  const images = imagesDe({ images: preference })
  const questions = x.questions.map((q, i) => `<div class="question">
    <div class="dit"><span class="num">${i + 1}.</span>${T('colorie', { mot: T(`ordinal.${q.mot}` as Cle) })}</div>
    <div class="file"><span class="depart" aria-hidden="true">➜</span>${Array.from({ length: q.longueur }, () => `<div class="place">${images.html(q.emoji)}<div class="case"></div></div>`).join('')}</div>
  </div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${consigne(['colorie'], T('consigneFiche'))}</p>
    ${questions}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${x.questions.map((q, i) => `<div>${i + 1}. <b>${corrigeDe(q, T)}</b></div>`).join('')}</div></section>`,
  })
}
