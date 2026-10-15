// Trier les images — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Une image par case et
// ses boîtes (image et nom) dessous : l'enfant entoure la bonne ; le corrigé donne le nom de la bonne boîte.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { imagesDe } from '../../images/rendu.ts'
import { consignesDe } from '../../images/consignes.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
      .item { border: 2px solid #bbb; border-radius: 14px; padding: .6rem; page-break-inside: avoid; position: relative; text-align: center; }
      .num { position: absolute; top: .3rem; left: .5rem; font-size: .8rem; font-weight: 700; color: #999; }
      .image { font-size: 3rem; line-height: 1.1; min-height: 3.4rem; }
      .boites { display: flex; justify-content: center; gap: .6rem; margin-top: .4rem; }
      .boite { border: 2.5px solid #444; border-radius: 10px; padding: .3rem .5rem; min-width: 4.6rem; font-size: 1.5rem; line-height: 1.2; }
      .boite small { display: block; font-size: .8rem; font-weight: 700; }
      .corr { columns: 2; font-size: 1.05rem; line-height: 1.9; }
    `

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  const images = imagesDe({ images: preference })
  const cases = x.questions.map((q, i) => `<div class="item"><span class="num">${i + 1}</span>
    <div class="image">${images.html(q.item, '3rem', q.mot)}</div>
    <div class="boites">${q.boites.map(b => `<div class="boite">${images.html(b.emoji, '2.2rem')}<small>${b.label}</small></div>`).join('')}</div>
  </div>`).join('')
  const titre = T('titre')
  // la consigne du thème quand il n'y en a qu'un ; sinon la consigne générale
  const themes = [...new Set(x.questions.map(q => q.theme))]
  const texte = T(`consigneFiche.${themes.length === 1 ? themes[0] : 'plusieurs'}` as Cle)
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${consigne(['entoure'], texte)}</p>
    <div class="grille">${cases}</div>
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${x.questions.map((q, i) => `<div>${i + 1}. <b>${q.attendu}</b></div>`).join('')}</div></section>`,
  })
}
