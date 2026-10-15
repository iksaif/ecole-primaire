// Assemblages de formes — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Une page de
// formes à découper (le jeu qu'il faut pour le plus grand modèle), puis les modèles : PS, une silhouette sur laquelle on pose les formes ;
// MS et GS, le modèle en couleurs et un cadre où le reproduire (GS : modèle plus petit que les formes, il faut donc les comparer).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche, Traducteur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { consignesDe } from '../../images/consignes.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { COTE_CASE } from './generateur.ts'
import type { TirageFiche } from './generateur.ts'
import { jeuDePieces, svgCadre, svgModele, svgPiece } from './formes.ts'
import type { FormePiece, Modele } from './formes.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 .8rem; }
      h2.partie { font-size: 1.05rem; margin: 1rem 0 .5rem; }
      .pieces { display: flex; flex-wrap: wrap; gap: .5cm; align-items: flex-end; border: 2px dashed #bbb; border-radius: 12px; padding: .5cm; }
      .modele { display: flex; flex-wrap: wrap; align-items: center; gap: .8cm; margin: .5cm 0; page-break-inside: avoid; border-top: 1px solid #ddd; padding-top: .4cm; }
      .num { font-size: 1.1rem; font-weight: 800; color: #777; min-width: 1.2rem; }
      .corr { columns: 2; font-size: 1.05rem; line-height: 1.9; }
    `

/** La liste des pièces d'un modèle écrite pour le corrigé : « 2 carrés, 1 triangle ». */
function listeDePieces(m: Modele, T: Traducteur<Cle>): string {
  const formes: FormePiece[] = ['carre', 'rectangle', 'triangle']
  return formes
    .map(f => ({ f, n: m.pieces.filter(p => p.forme === f).length }))
    .filter(x => x.n > 0)
    .map(x => T(`forme.${x.f}` as Cle, { n: x.n }))
    .join(', ')
}

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  const cote = COTE_CASE[x.niveau] ?? 2.6
  const ps = x.niveau === 'ps'
  const gs = x.niveau === 'gs'
  // les formes à découper : au moins celles du plus grand modèle, à la taille des cases du cadre
  const jeu = jeuDePieces(x.modeles)
  const pieces = (Object.keys(jeu) as FormePiece[]).flatMap(f => Array.from({ length: jeu[f] }, () => svgPiece(f, cote))).join('')
  // GS : le modèle est plus petit que le cadre (il faut juger des tailles) ; PS : la silhouette est à la taille des formes
  const modeles = x.modeles.map((m, i) => `<div class="modele"><span class="num">${i + 1}</span>
    ${svgModele(m.pieces, ps ? cote : gs ? cote * 0.6 : cote, ps ? 'silhouette' : 'couleur')}
    ${ps ? '' : svgCadre(m.pieces, cote)}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${consigne(['decoupe', 'colle'], T(ps ? 'consignePs' : 'consigneMsGs'))}</p>
    <h2 class="partie">${T('aDecouper')}</h2>
    <div class="pieces">${pieces}</div>
    <h2 class="partie">${T(ps ? 'modelesPs' : 'modelesMsGs')}</h2>
    ${modeles}
    <section class="corrige"><h2>${T('corrige')} — ${titre}</h2>
      <div class="corr">${x.modeles.map((m, i) => `<div>${i + 1}. <b>${listeDePieces(m, T)}</b></div>`).join('')}</div></section>`,
  })
}
