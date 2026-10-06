// Compter les objets — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Collections à
// compter, nombre à écrire ou à entourer (avec corrigé) ; les objets et les points sont ceux du jeu (src/dessins/collections.ts).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { htmlCollection, htmlConstellation } from '../../dessins/collections.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
      .item { border: 2px solid #bbb; border-radius: 14px; padding: .6rem; display: flex; align-items: center; gap: .6rem; page-break-inside: avoid; position: relative; min-height: 6.2rem; }
      .num { position: absolute; top: .3rem; left: .5rem; font-size: .8rem; font-weight: 700; color: #999; }
      .objets { flex: 1; display: flex; flex-wrap: wrap; gap: .25rem; justify-content: center; font-size: 1.7rem; line-height: 1.1; }
      .case { width: 3.2rem; height: 3.2rem; border: 2.5px solid #444; border-radius: 8px; flex-shrink: 0; }
      .choix { display: grid; grid-template-columns: 1fr 1fr; gap: .2rem .6rem; font-size: 1.5rem; font-weight: 800; flex-shrink: 0; }
      .choix span { min-width: 1.5rem; text-align: center; }
      .corr { columns: 4; font-size: 1.15rem; line-height: 2; }
      .choix.ps { grid-template-columns: 1fr; gap: .5rem; } .pts { font-size: 1.1rem; letter-spacing: .15rem; }
    `

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const qs = x.questions
  // PS : on entoure toujours la bonne constellation (jamais de chiffre à écrire)
  const ps = x.niveau === 'ps'
  const ecrire = !ps && x.reponse === 'ecrire'
  const cases = qs.map((q, i) => `<div class="item"><span class="num">${i + 1}</span>
    <div class="objets">${htmlCollection(q.nb, q.emoji)}</div>
    ${ecrire ? '<div class="case"></div>'
      : `<div class="choix${ps ? ' ps' : ''}">${[...q.choix].sort((a, b) => a - b).map(c => `<span>${ps ? htmlConstellation(c) : c}</span>`).join('')}</div>`}
  </div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T(ecrire ? 'consigneEcrire' : 'consigneEntourer')}</p>
    <div class="grille">${cases}</div>
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => `<div>${i + 1}. <b>${q.nb}</b></div>`).join('')}</div></section>`,
  })
}
