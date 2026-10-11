// Les motifs — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Frises à continuer (cases vides à
// dessiner ou à remplir de gommettes) ; PS : entourer ce qui vient après.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { suite } from './motifs.ts'
import { imagesDe } from '../../images/rendu.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .ligne { display: flex; align-items: center; gap: .35rem; margin-bottom: 1.1rem; font-size: 1.9rem; page-break-inside: avoid; }
      .num { font-size: .9rem; font-weight: 700; color: #999; min-width: 1.6rem; }
      .case { width: 2.4rem; height: 2.4rem; border: 2.5px dashed #444; border-radius: 50%; display: inline-block; }
      .fleche { margin: 0 .6rem; color: #999; } .choix { border: 2px solid #bbb; border-radius: 12px; padding: 0 .3rem; margin-left: .4rem; }
      .corr { columns: 3; font-size: 1.3rem; line-height: 1.9; }
    `

export function fiche({ questions: x, T, langue, police, cssPolices, images: preference }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  // les éléments : OpenMoji, ou l'emoji de l'appareil (préférence « Images ») ; OpenMoji pour les PDF publiés
  const images = imagesDe({ images: preference })
  const ps = x.niveau === 'ps'
  const lignes = x.questions.map((q, i) => {
    const vus = q.place >= q.motif.length ? q.motif : q.motif.map((e, j) => (j === q.place ? null : e))
    const cases = vus.map(e => (e === null ? '<span class="case"></span>' : `<span>${images.html(q.elements[e])}</span>`)).join('')
    const fin = q.place >= q.motif.length ? (ps ? `<span class="fleche">→</span>${[...q.choix].map(c => `<span class="choix">${images.html(q.elements[c])}</span>`).join('')}` : '<span class="case"></span><span class="case"></span>') : ''
    return `<div class="ligne" data-type="${q.type}"><span class="num">${i + 1}.</span>${cases}${fin}</div>`
  }).join('')
  // corrigé : les deux éléments qui continuent la frise, ou l'élément du trou (PS : celui à entourer)
  const corr = x.questions.map((q, i) => {
    const deux = q.place >= q.motif.length && !ps
    const attendus = deux ? suite(q.type, q.place + 2).slice(q.place) : [q.attendu]
    return `<div>${i + 1}. ${attendus.map(e => images.html(q.elements[e])).join(' ')}</div>`
  }).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${T(ps ? 'consignePS' : x.mode === 'trou' ? 'consigneTrou' : 'consigne')}</p>
    ${lignes}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2><div class="corr">${corr}</div></section>`,
  })
}
