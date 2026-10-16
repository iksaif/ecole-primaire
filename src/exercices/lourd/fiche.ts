// Le plus lourd — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Une ou deux balances par question, la
// demande écrite (« Le plus lourd »), les objets proposés à entourer ; le corrigé donne le nom de l'objet.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { imagesDe } from '../../images/rendu.ts'
import { consignesDe } from '../../images/consignes.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'
import { htmlPesee, nomObjet } from './dessin.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .question { border: 2px solid #bbb; border-radius: 14px; padding: .5rem .8rem; margin-bottom: .8rem; page-break-inside: avoid; }
      .dit { font-weight: 800; margin-bottom: .2rem; }
      .num { color: #999; margin-right: .4rem; }
      .pesees { display: flex; gap: .6rem; justify-content: center; }
      .pesees svg { width: 8.2cm; height: auto; }
      .choix { display: flex; gap: 2rem; justify-content: center; font-size: 2.6rem; margin-top: .3rem; }
      .corr { columns: 3; font-size: 1.1rem; line-height: 2; }
    `

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  const images = imagesDe({ images: preference })
  const questions = x.questions.map((q, i) => `<div class="question">
    <div class="dit"><span class="num">${i + 1}.</span>${T(`demande.${q.mot}` as Cle)}</div>
    <div class="pesees">${q.pesees.map(p => htmlPesee(p, T)).join('')}</div>
    <div class="choix">${q.options.map(o => `<span>${images.html(o, '2.6rem', nomObjet(o, T))}</span>`).join('')}</div>
  </div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${consigne(['entoure'], T('consigneFiche'))}</p>
    ${questions}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${x.questions.map((q, i) => `<div>${i + 1}. <b>${nomObjet(q.options[q.bonne], T)}</b></div>`).join('')}</div></section>`,
  })
}
