// Les motifs — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Frises à continuer (cases vides à
// dessiner, à colorier, ou d'images à découper en bas de la fiche) ; PS : entourer ce qui vient après ou ce qui manque.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { casesAContinuer, suite } from './motifs.ts'
import { imagesDe } from '../../images/rendu.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { FormeCase, Question, TirageFiche } from './generateur.ts'
import type { NomEmoji } from '../../images/tables.ts'
import { consignesDe } from '../../images/consignes.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .ligne { display: flex; align-items: center; gap: .35rem; margin-bottom: 1.1rem; font-size: 1.9rem; page-break-inside: avoid; }
      .num { font-size: .9rem; font-weight: 700; color: #999; min-width: 1.6rem; }
      .ciseaux { font-size: 1rem; color: #777; min-width: 1.2rem; }
      .case { width: 2.4rem; height: 2.4rem; border: 2.5px dashed #444; display: inline-block; box-sizing: border-box; flex: none; }
      .case.rond { border-radius: 50%; } .case.carre { border-radius: 3px; } .case.place { border-radius: 10px; }
      .case.contour { width: 1.75rem; height: 1.75rem; margin: 0 .3rem; border-style: solid; border-width: 2px; }
      .case.coeur { border: none; width: 2.4rem; height: 2.4rem; } .case.coeur svg { width: 100%; height: 100%; display: block; }
      .case.coeur.contour { width: 2rem; height: 2rem; margin: 0 .2rem; }
      .fleche { margin: 0 .6rem; color: #999; } .choix { border: 2px solid #bbb; border-radius: 12px; padding: 0 .3rem; margin-left: .4rem; }
      .decouper { margin-top: 1.4rem; padding-top: .6rem; border-top: 2px dashed #999; break-inside: avoid; page-break-inside: avoid; }
      .decouper h3 { font-size: 1rem; margin: 0 0 .6rem; color: #555; }
      .case.image { width: 3.4rem; height: 3.4rem; }
      .vignettes { display: grid; grid-template-columns: repeat(auto-fill, 3.2rem); font-size: 2.3rem; }
      .vignette { width: 3.2rem; height: 3.2rem; box-sizing: border-box; border: 1.5px dashed #888; margin: 0 -1.5px -1.5px 0; display: inline-flex; align-items: center; justify-content: center; }
      .corr { columns: 3; font-size: 1.3rem; line-height: 1.9; }
    `

/** Le contour d'un cœur (la case d'un cœur à colorier ; en pointillé, la case d'un cœur à dessiner). */
const coeur = (pointille: boolean): string => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.6-4.6-9.4-9.3C1.4 8 3.5 4.6 6.9 4.6c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.4 0 5.5 3.4 4.3 6.6-1.8 4.7-9.4 9.3-9.4 9.3z" '
  + `fill="none" stroke="#444" stroke-width="${pointille ? 1.4 : 1.1}"${pointille ? ' stroke-dasharray="2.2 1.6"' : ''}/></svg>`

/**
 * La case vide d'une frise : de la forme des éléments (rond, carré, cœur ; une place aux coins arrondis pour un dessin ou une image) ;
 * à colorier, un contour plein à la taille de l'élément ; pour une image à coller, assez grande pour la vignette découpée.
 */
function caseVide(forme: FormeCase, aColorier: boolean, image: boolean): string {
  // une image découpée (vignette de 3,2 rem) doit tenir dans sa case
  const classes = ['case', forme, aColorier ? 'contour' : '', image ? 'image' : ''].filter(Boolean).join(' ')
  return `<span class="${classes}">${forme === 'coeur' ? coeur(!aColorier) : ''}</span>`
}

/** Les éléments qui remplissent les cases d'une frise : ceux qui la continuent (casesAContinuer), ou celui du trou. */
function attendusDe(q: Question): number[] {
  if (q.place < q.motif.length) return [q.attendu]
  return suite(q.type, q.place + casesAContinuer(q.type, q.place)).slice(q.place)
}

/** Les vignettes à découper : pour chaque ligne d'images, ce qui va dans ses cases et un élément en trop (il faut choisir). */
function vignettesADecouper(questions: readonly Question[]): NomEmoji[] {
  const vignettes: NomEmoji[] = []
  for (const q of questions.filter(x => x.sorte === 'image')) {
    const attendus = attendusDe(q)
    const enTrop = q.elements.findIndex((_, i) => !attendus.includes(i))
    vignettes.push(...attendus.map(e => q.elements[e]), q.elements[enTrop])
  }
  // rangées par nom : mélangées entre les lignes, toujours dans le même ordre (la fiche est pure)
  return vignettes.sort()
}

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  // les pictogrammes des consignes, selon « Sur la fiche » (aucun dans les PDF publiés : src/images/consignes.ts)
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  // les éléments : OpenMoji, ou l'emoji de l'appareil (préférence « Images ») ; OpenMoji pour les PDF publiés
  const images = imagesDe({ images: preference })
  const ps = x.niveau === 'ps'
  const aColorier = !ps && x.fiche === 'colorie'
  const vignettes = ps ? [] : vignettesADecouper(x.questions)
  /** La consigne de la fiche : entourer (PS), colorier les formes, ou dessiner (et découper les images, s'il y en a). */
  const consigneMotifs = (): string => {
    const trou = x.mode === 'trou'
    if (ps) return consigne(['entoure'], T(trou ? 'consignePSTrou' : 'consignePS'))
    if (aColorier) return consigne(['colorie'], T(trou ? 'consigneColorieTrou' : 'consigneColorie'))
    const dessine = consigne(['dessine'], T(trou ? 'consigneTrou' : 'consigne'))
    if (!vignettes.length) return dessine
    return `${dessine}</p><p class="consigne">${consigne(['decoupe', 'colle'], T('consigneDecoupe'))}`
  }
  const lignes = x.questions.map((q, i) => {
    const aLaFin = q.place >= q.motif.length
    const vide = caseVide(q.forme, aColorier, !ps && q.sorte === 'image')
    const vus = aLaFin ? q.motif : q.motif.map((e, j) => (j === q.place ? null : e))
    const cases = vus.map(e => (e === null ? vide : `<span>${images.html(q.elements[e])}</span>`)).join('')
    // PS : les éléments à entourer, après une flèche ; sinon, à la fin, les cases qui continuent la frise
    const choix = `<span class="fleche">→</span>${[...q.choix].map(c => `<span class="choix">${images.html(q.elements[c])}</span>`).join('')}`
    let fin = ''
    if (ps) fin = choix
    else if (aLaFin) fin = vide.repeat(casesAContinuer(q.type, q.place))
    const ciseaux = !ps && q.sorte === 'image' ? '<span class="ciseaux" aria-hidden="true">✂</span>' : ''
    return `<div class="ligne" data-type="${q.type}"><span class="num">${i + 1}.</span>${ciseaux}${cases}${fin}</div>`
  }).join('')
  const decouper = vignettes.length
    ? `<section class="decouper"><h3>✂ ${T('aDecouper')}</h3><div class="vignettes">${vignettes.map(e => `<span class="vignette">${images.html(e)}</span>`).join('')}</div></section>`
    : ''
  // corrigé : les éléments des cases (PS : celui à entourer)
  const corr = x.questions.map((q, i) => `<div>${i + 1}. ${(ps ? [q.attendu] : attendusDe(q)).map(e => images.html(q.elements[e])).join(' ')}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '720px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${consigneMotifs()}</p>
    ${lignes}
    ${decouper}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2><div class="corr">${corr}</div></section>`,
  })
}
