// La valise — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). La scène de chaque problème (valise.ts :
// objets.ts), le nombre à écrire ou à entourer, et le corrigé ; la même scène que sur l'écran.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { htmlConstellation } from '../../dessins/collections.ts'
import { imagesDe } from '../../images/rendu.ts'
import { consignesDe } from '../../images/consignes.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche, Question } from './generateur.ts'
import { htmlScene, nomObjet } from './objets.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr; gap: .7rem; }
      .item { border: 2px solid #bbb; border-radius: 14px; padding: .6rem .8rem; display: flex; align-items: center; gap: .8rem; page-break-inside: avoid; position: relative; min-height: 4.6rem; }
      .num { font-size: .8rem; font-weight: 700; color: #999; width: 1rem; flex-shrink: 0; }
      .scene { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: .2rem; font-size: 1.9rem; line-height: 1.1; }
      .signe { font-size: 1.6rem; font-weight: 800; margin: 0 .5rem; }
      .enleve { opacity: .35; position: relative; display: inline-block; }
      .enleve::after { content: '✖'; position: absolute; left: 0; right: 0; top: 0; text-align: center; font-size: 1.9rem; color: #000; opacity: 1; }
      .valise { display: inline-flex; flex-direction: column; align-items: center; font-size: 2.2rem; }
      .dans-valise { display: inline-flex; gap: .1rem; font-size: 1.2rem; }
      .points { font-size: 1.2rem; letter-spacing: .15rem; }
      .consigne-q { flex-basis: 100%; font-size: .85rem; font-weight: 700; color: #555; }
      .case { width: 3.2rem; height: 3.2rem; border: 2.5px solid #444; border-radius: 8px; flex-shrink: 0; }
      .choix { display: flex; gap: .6rem; font-size: 1.5rem; font-weight: 800; flex-shrink: 0; }
      .choix span { min-width: 1.6rem; text-align: center; }
      .pts { font-size: 1.1rem; letter-spacing: .15rem; }
      .corr { columns: 4; font-size: 1.15rem; line-height: 2; }
    `

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  const images = imagesDe({ images: preference })
  const ps = x.niveau === 'ps'
  const ecrire = !ps && x.reponse === 'ecrire'
  /** Ce que l'enfant lit sous la scène : la question de ce problème. */
  const phrase = (q: Question): string => T(`question.${q.type === 'ajoute' && q.cache ? 'ajouteCache' : q.type}` as Cle, { n: q.total, nom: nomObjet(q.objet, langue) })
  const cases = x.questions.map((q, i) => `<div class="item"><span class="num">${i + 1}</span>
    <div class="scene">${htmlScene(q, images)}<span class="consigne-q">${phrase(q)}</span></div>
    ${ecrire ? '<div class="case"></div>'
      : `<div class="choix">${[...q.options].sort((a, b) => a.valeur - b.valeur).map(o => `<span>${ps ? htmlConstellation(o.valeur) : o.label}</span>`).join('')}</div>`}
  </div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${ecrire ? consigne(['compte', 'ecris'], T('consigneEcrire')) : consigne(['compte', 'entoure'], T('consigneEntourer'))}</p>
    <div class="grille">${cases}</div>
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${x.questions.map((q, i) => `<div>${i + 1}. <b>${q.reponse}</b></div>`).join('')}</div></section>`,
  })
}
