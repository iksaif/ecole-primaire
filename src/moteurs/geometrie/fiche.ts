// La géométrie (moteur commun) — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node).
//   fiche({ questions, reglages, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate, section.corrige) ;
//   police et cssPolices : usePoliceFiche() dans l'app (Andika par défaut)
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import { svgFigure, svgCercle, svgPatron, svgSolide, svgGrilleCm } from './dessins.ts'
import { SORTES as SORTES_ANGLE, svgAngle } from './angles.ts'
import type { Cle, TirageFiche } from './types.ts'
import type { Reglages } from './generateur.ts'
import { angleDroitAu, ficheGuidee, FIGURES, SOLIDES } from './donnees.ts'
import { imagesDe } from '../../images/rendu.ts'

const CSS = `
      @page { size: A4; margin: 1.2cm; }
      h1 { font-size: 1.25rem; }
      h2 { font-size: 1.05rem; margin: .6cm 0 .2cm; break-after: avoid; }
      .avertissement { font-size: .8rem; color: #a00; margin-bottom: .4cm; }
      .consigne { font-size: .95rem; margin: .1cm 0 .2cm; }
      .bloc { break-inside: avoid; margin-bottom: .4cm; }
      .duo { display: flex; gap: .5cm; align-items: flex-start; flex-wrap: wrap; }
      .galerie { display: flex; flex-wrap: wrap; gap: .4cm; }
      .item { width: 5.5cm; text-align: center; }
      .item.libre { width: auto; padding: .2cm; }
      .item.grand { width: 5.6cm; }
      .item.large { width: 8.4cm; text-align: left; }
      .item.large svg { margin: 0 auto; }
      .mots { font-size: 1rem; font-weight: 700; margin: .1cm 0 .3cm; display: flex; justify-content: center; gap: .3cm; }
      .mots span { border: 1px solid #aaa; border-radius: 6px; padding: .08cm .2cm; }
      .mots-a-recopier { font-size: 1.05rem; margin: .1cm 0 .3cm; }
      .mots-a-recopier span { display: inline-block; border: 1.5px solid #888; border-radius: 6px; padding: .05cm .25cm; margin: 0 .15cm; font-weight: 700; }
      .tableau { border-collapse: collapse; font-size: 1rem; }
      .tableau th, .tableau td { border: 1.5px solid #555; padding: .15cm .4cm; min-width: 2.5cm; height: .9cm; text-align: left; }
      .petit-dessin svg { display: inline-block; vertical-align: middle; margin-right: .2cm; }
      .raisons { list-style: none; padding: 0; margin: .1cm 0 .3cm; font-size: .9rem; }
      .raisons li { margin: .08cm 0; }
      .raisons li::before { content: '○ '; }
      .ligne { border-bottom: 1.5px solid #888; margin: .2cm .4cm 0; height: .8cm; }
      .lignes { font-size: 1rem; margin-top: .2cm; }
      svg { display: block; }
      /* les emojis des titres (rendu des images) restent dans la ligne du texte */
      svg[data-image] { display: inline-block; vertical-align: -0.25em; }
      .mini svg { display: inline-block; vertical-align: middle; margin: .1cm .4cm .1cm 0; }`

/** Les figures du tableau du CP, dessinées petites, droites (un carré, un rectangle, un triangle). */
const FIGURES_DU_TABLEAU = {
  carre: { points: [[55, 55], [145, 55], [145, 145], [55, 145]] as [number, number][], rayon: 0, anglesDroits: [] },
  rectangle: { points: [[30, 65], [170, 65], [170, 135], [30, 135]] as [number, number][], rayon: 0, anglesDroits: [] },
  triangle: { points: [[100, 40], [170, 160], [30, 160]] as [number, number][], rayon: 0, anglesDroits: [] },
} as const

/** Les mots à recopier (CP : écrire les noms sans les avoir sous les yeux n'est pas la compétence travaillée). */
function motsARecopier(mots: readonly string[], T: Parameters<typeof fiche>[0]['T']): string {
  return `<p class="mots-a-recopier">${T('ficheMots')} : ${mots.map(m => `<span>${m}</span>`).join('')}</p>`
}

export function fiche({ questions: x, T, langue, police, cssPolices , images: preference }: ParamsFiche<Reglages, TirageFiche, Cle>): string {
  // les marqueurs des titres : OpenMoji, ou l'emoji de l'appareil (préférence « Images ») ; OpenMoji pour les PDF publiés
  const images = imagesDe({ images: preference })
  let corps = ''
  // corrigé : une ligne par partie, réponses dans l'ordre de la fiche
  const corrige: string[] = []
  const ligneCorrige = (titre: string, rep: string): void => { corrige.push(`<p><b>${titre} :</b> ${rep}</p>`) }
  const numeros = (l: readonly string[]): string => l.map((r, i) => `${i + 1}. ${r}`).join(' — ')

  if (x.symetrie) {
    const qs = x.symetrie
    corps += `<h2>${images.html('papillon')} ${T('ficheSymetrie')}</h2><p class="consigne">${T('ficheSymetrieConsigne')}</p>`
    corps += qs.map(q => `<div class="bloc">${svgGrilleCm({ cols: q.cols, rows: q.rows, pleines: q.modele, axe: q.axe })}</div>`).join('')
    ligneCorrige(T('ficheSymetrie'), `<span class="mini">${qs.map(q =>
      svgGrilleCm({ cols: q.cols, rows: q.rows, pleines: [...q.modele, ...q.cellules], axe: q.axe, echelle: 0.35 })).join('')}</span>`)
  }
  const guidee = ficheGuidee(x.niveau)
  if (x.figures) {
    corps += `<h2>${images.html('losangeBleu')} ${T('ficheFigures')}</h2><p class="consigne">${T('ficheFiguresConsigne')}</p>`
      + (guidee ? motsARecopier([...new Set(x.figures.map(f => T(`figure.${f.forme}` as Cle)))], T) : '')
      + `<div class="bloc galerie">${x.figures.map(f => `<div class="item">${svgFigure(f, angleDroitAu(x.niveau), 110)}<div class="ligne"></div></div>`).join('')}</div>`
    ligneCorrige(T('ficheFigures'), numeros(x.figures.map(f => T(`figure.${f.forme}` as Cle))))
    if (guidee) {
      // CP : « donner une première description du carré, du rectangle, du triangle en utilisant les termes « sommet » et « côté » » (p. 32)
      const polygones = (['carre', 'rectangle', 'triangle'] as const).filter(f => x.figures!.some(g => g.forme === f))
      // chaque ligne : le nom et un petit dessin (un CP qui déchiffre « rectangle » retrouve la figure) ; « un sommet, c'est un coin »
      const dessinDe = (f: typeof polygones[number]): string => svgFigure({ forme: f, ...FIGURES_DU_TABLEAU[f] }, false, 46)
      corps += `<div class="bloc"><p class="consigne">${T('ficheTableauConsigne')} <i>${T('ficheSommetCoin')}</i></p><table class="tableau"><tr><th></th><th>${T('ficheCotes')}</th><th>${T('ficheSommets')}</th></tr>`
        + polygones.map(f => `<tr><th><span class="petit-dessin">${dessinDe(f)}</span>${T(`figure.${f}` as Cle)}</th><td></td><td></td></tr>`).join('') + `</table></div>`
      const n = (f: typeof polygones[number]): number => FIGURES[f].cotes
      ligneCorrige(T('ficheTableau'), polygones.map(f => `${T(`figure.${f}` as Cle)} : ${n(f)} ${T('ficheCotes')}, ${n(f)} ${T('ficheSommets')}`).join(' — '))
    }
  }
  if (x.solides) {
    corps += `<h2>${images.html('glacon')} ${T('ficheSolides')}</h2><p class="consigne">${T('ficheSolidesConsigne')}</p>`
      + (guidee ? motsARecopier([...new Set(x.solides.map(s => T(`solide.${s}` as Cle)))], T) : '')
      + `<div class="bloc galerie">${x.solides.map(s => `<div class="item">${svgSolide(s, 110)}<div class="ligne"></div></div>`).join('')}</div>`
    ligneCorrige(T('ficheSolides'), numeros(x.solides.map(s => T(`solide.${s}` as Cle))))
  }
  if (x.solides && guidee) {
    // CP : « nombre de faces et nature des faces (carré ou rectangle) » du cube et du pavé (p. 32)
    const lignes = (['cube', 'pave'] as const).map(s => `<tr><th><span class="petit-dessin">${svgSolide(s, 46)}</span>${T(`solide.${s}` as Cle)}</th><td></td><td></td></tr>`)
    corps += `<div class="bloc"><p class="consigne">${T('ficheFacesConsigne')}</p><table class="tableau"><tr><th></th><th>${T('ficheNbFaces')}</th><th>${T('ficheFormeFaces')}</th></tr>${lignes.join('')}</table></div>`
    ligneCorrige(T('ficheFacesConsigne'), `${T('solide.cube')} : 6, ${T('nature.carres')} — ${T('solide.pave')} : 6, ${T('nature.rectangles')}`)
  }
  if (x.rouler) {
    corps += `<div class="bloc"><p class="consigne">${T('ficheRoulerConsigne')}</p><div class="galerie">`
      + x.rouler.map(s => `<div class="item libre">${svgSolide(s, 95)}</div>`).join('') + `</div></div>`
    ligneCorrige(T('ficheRouler'), x.rouler.filter(s => SOLIDES[s].roule).map(s => T(`solide.${s}` as Cle)).join(', '))
  }
  if (x.angles) {
    corps += `<h2>${images.html('equerre')} ${T('ficheAngles')}</h2><p class="consigne">${T('ficheAnglesConsigne')}</p><div class="bloc galerie">`
      + x.angles.map(q => `<div class="item grand">${svgFigure(q, false, 200)}<div class="ligne"></div></div>`).join('') + `</div>`
    ligneCorrige(T('ficheAngles'), numeros(x.angles.map(q => q.attendu)))
  }
  if (x.aigus) {
    // les trois mots, chacun dans sa case (facile à entourer)
    const mots = (): string => SORTES_ANGLE.map(s => `<span>${T(`angle.${s}` as Cle)}</span>`).join('')
    // le titre reste avec ses angles (sinon il tombe seul en bas de page)
    corps += `<div class="bloc"><h2>${images.html('equerre')} ${T('ficheAigus')}</h2><p class="consigne">${T('ficheAigusConsigne')}</p><div class="galerie">`
      + x.aigus.map(q => `<div class="item grand">${svgAngle(q, 190)}<p class="mots">${mots()}</p></div>`).join('') + `</div></div>`
    ligneCorrige(T('ficheAigus'), numeros(x.aigus.map(q => q.attendu)))
  }
  if (x.justifier) {
    corps += `<div class="bloc"><h2>${images.html('presseFeuilles')} ${T('ficheJustifier')}</h2><p class="consigne">${T('ficheJustifierConsigne')}</p><div class="galerie">`
      + x.justifier.map((q, i) => `<div class="item large">${svgFigure(q, false, 150)}<p><b>${i + 1}. ${q.texte}</b></p>`
        + `<ul class="raisons">${q.choix.map(c => `<li>${c}</li>`).join('')}</ul></div>`).join('') + `</div></div>`
    ligneCorrige(T('ficheJustifier'), numeros(x.justifier.map(q => q.attendu)))
  }
  if (x.proprietes) {
    corps += `<h2>${images.html('presseFeuilles')} ${T('ficheVraiFauxTitre')}</h2><p class="consigne">${T('ficheVraiFauxConsigne')}</p>`
      + x.proprietes.map((p, i) => `<p class="lignes">${i + 1}. ${T(`propriete.${p.id}` as Cle)} &nbsp; <b>${T('ficheVraiFaux')}</b></p>`).join('')
    ligneCorrige(T('ficheVraiFauxTitre'), numeros(x.proprietes.map(p => (p.vrai ? T('vrai') : T('faux')))))
  }
  if (x.cercle) {
    corps += `<h2>${images.html('cercleRouge')} ${T('ficheCercle')}</h2><div class="bloc duo">
      <div><p class="consigne">${T('ficheCercleTrace')}</p>
        <svg width="7cm" height="7cm" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"><circle cx="3.5" cy="3.5" r="0.07" fill="#000"/><text x="3.65" y="3.35" font-size="0.4" font-family="Arial">O</text></svg></div>
      <div><p class="consigne">${T('ficheCercleRepasse')}</p>${svgCercle({ sous: 'lequel', rot: x.cercle.rot, pts: { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' } }, 190)}</div></div>`
    ligneCorrige(T('ficheCercle'), T('corrigeCercle', { rayon: '[OA]', diametre: '[BC]' }))
  }
  if (x.patrons) {
    corps += `<h2>${images.html('de')} ${T('fichePatrons')}</h2><p class="consigne">${T('fichePatronsConsigne')}</p><div class="bloc galerie">`
      + x.patrons.map(c => `<div class="item libre">${svgPatron(c.cases, { cote: 1, unite: 'cm' })}</div>`).join('') + `</div>`
    const liste = x.patrons.map((c, i) => (c.valide ? i + 1 : 0)).filter(Boolean).join(', ')
    ligneCorrige(T('fichePatrons'), T('corrigePatrons', { liste }))
  }

  // « chaque carreau mesure 1 cm » : seulement quand la fiche a un quadrillage, un patron ou un cercle à tracer à la taille réelle
  const aLaTailleReelle = Boolean(x.symetrie || x.patrons || x.cercle)
  const titre = `${T('titre')} — ${x.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: 'none', marge: '0',
    corps: `${ligneNomDate(langue)}
    ${aLaTailleReelle ? `<p class="avertissement">${images.html('attention')} ${T('ficheAvertissement')}</p>` : ''}
    ${corps}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige.join('')}</section>`,
  })
}
