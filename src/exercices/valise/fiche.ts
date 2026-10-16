// La valise — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). La bande en trois images de chaque problème
// (bande.ts), la question en quelques mots, le nombre à écrire ou à entourer, et le corrigé ; la même bande que sur l'écran.
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
import { htmlBande } from './bande.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr; gap: .7rem; }
      .item { border: 2px solid #bbb; border-radius: 14px; padding: .6rem .8rem; display: flex; align-items: center; gap: .8rem; page-break-inside: avoid; position: relative; min-height: 4.6rem; }
      .num { font-size: .8rem; font-weight: 700; color: #999; width: 1rem; flex-shrink: 0; }
      .scene { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: .3rem; line-height: 1.1; }
      .bande { display: inline-flex; align-items: center; gap: .4rem; flex-wrap: nowrap; }
      .case { display: inline-flex; align-items: center; justify-content: center; min-width: 3.4rem; min-height: 3.4rem; font-size: 1.5rem; }
      .plateau { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .1rem; max-width: 7.6rem; padding: .25rem .4rem; border: 2.5px solid #8d5524; border-radius: 8px; background: #fbf3e6; }
      .fleche { font-size: 1.4rem; color: #1d4e9e; }
      .action { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .1rem; max-width: 7.6rem; }
      .signe { font-size: 1.6rem; font-weight: 800; margin: 0 .2rem; }
      .inconnu { display: inline-block; min-width: 2rem; text-align: center; font-size: 1.8rem; font-weight: 800; border: 2.5px dashed #888; border-radius: 8px; }
      .valise-fermee { position: relative; display: inline-block; line-height: 0; }
      .valise-fermee .sur-valise { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%); line-height: 1; font-size: 1.2rem; font-weight: 800; color: #222; background: #fff; border: 2px solid #5d3a1a; border-radius: 6px; padding: 0 .3rem; white-space: nowrap; }
      .points { font-size: .8rem; letter-spacing: .05rem; }
      .consigne-q { flex-basis: 100%; font-size: .85rem; font-weight: 700; color: #555; }
      .case-reponse { width: 3.2rem; height: 3.2rem; border: 2.5px solid #444; border-radius: 8px; flex-shrink: 0; }
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
  /** Ce que l'enfant lit sous la scène : la question de ce problème, en quelques mots. */
  const phrase = (q: Question): string => T(`question.${q.type}` as Cle)
  const cases = x.questions.map((q, i) => `<div class="item"><span class="num">${i + 1}</span>
    <div class="scene">${htmlBande(q, images)}<span class="consigne-q">${phrase(q)}</span></div>
    ${ecrire ? '<div class="case-reponse"></div>'
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
