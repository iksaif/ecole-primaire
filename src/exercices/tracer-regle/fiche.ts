// Tracer à la règle — fiche imprimable : la mise en page du tirage de questionsFiche(), à la taille réelle (un centimètre entre deux points :
// la règle de l'élève y tombe juste). Pure (lisible par node).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche, Traducteur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { QCompleter, QConstruire, QReproduire, TirageFiche } from './generateur.ts'
import { svgAlignes, svgConstruction, svgGrille } from './dessin.ts'

type Cle = CleContenu<typeof CONTENU>
const ROUGE = '#c92a2a'

const CSS = `
      @page { size: A4; margin: 1.2cm; }
      h2 { font-size: 1.05rem; margin: .5cm 0 .15cm; break-after: avoid; }
      .consigne { font-size: .95rem; margin: .1cm 0 .25cm; }
      .rangee { display: flex; gap: .6cm; flex-wrap: wrap; align-items: flex-start; break-inside: avoid; margin-bottom: .35cm; }
      .case { break-inside: avoid; }
      .case .consigne { margin: 0 0 .1cm; font-weight: 700; }
      .titre-grille { font-size: .9rem; font-weight: 700; color: #333; margin: 0 0 .1cm; }
      /* reproduire : deux grilles bien séparées, chacune dans son cadre (on ne trace pas sur le modèle) */
      .reproduire { gap: 1.2cm; }
      .reproduire .case { border: 1px solid #999; border-radius: 6px; padding: .15cm .2cm .2cm; }
      .corrige .rangee { gap: .3cm; }
      .bloc-corrige { break-inside: avoid; }
      .cadre-uni { height: 7cm; border: 1px solid #999; border-radius: 6px; }
      svg { display: block; }`

/** Une rangée de dessins (ils passent à la ligne s'ils ne tiennent pas). */
const rangee = (classe: string, contenus: readonly string[]): string =>
  `<div class="rangee ${classe}">${contenus.map(c => `<div class="case">${c}</div>`).join('')}</div>`

/** Des rangées de deux : chacune reste entière, mais la page peut se couper entre deux rangées. */
function rangeesDeDeux(contenus: readonly string[]): string {
  const rangees: string[] = []
  for (let i = 0; i < contenus.length; i += 2) rangees.push(rangee('', contenus.slice(i, i + 2)))
  return rangees.join('')
}

/** Compléter : la consigne de la figure, au-dessus de sa grille. */
function caseCompleter(q: QCompleter, T: Traducteur<Cle>, corrige: boolean): string {
  const manquants = corrige ? q.solutions[0] : []
  const dessin = corrige
    ? { polygone: [...q.connus, ...manquants], marques: manquants, couleur: ROUGE, lettreA: q.sommetAngleDroit }
    : { cotes: q.cotes, marques: q.connus, lettreA: q.sommetAngleDroit }
  // à partir du CE1 : « règle […] et équerre » (c2maths p. 34)
  const texte = q.angleDroit ? T(`ficheCompleterConsigneEquerre.${q.figure}`) : T(`ficheCompleterConsigne.${q.figure}`)
  const consigne = corrige ? '' : `<p class="consigne">${texte}</p>`
  return `${consigne}${svgGrille(q.support, q.colonnes, q.lignes, dessin, corrige ? 0.45 : 1)}`
}

/** Construire : la mesure demandée, et un cadre de papier uni où tracer (12 cm de large pour le rectangle, 8,5 cm pour les deux autres). */
function caseConstruire(q: QConstruire, T: Traducteur<Cle>): string {
  const largeur = q.figure === 'rectangle' ? 12 : 8.5
  return `<div style="width: ${largeur}cm"><p class="consigne">${T(`ficheConstruireFigure.${q.figure}`, { a: q.mesures.a, b: q.mesures.b })}</p>`
    + `<div class="cadre-uni"></div></div>`
}

/** Reproduire : le modèle à gauche, la grille vide à droite. */
function rangeeReproduire(q: QReproduire, T: Traducteur<Cle>): string {
  return rangee('reproduire', [
    `<p class="titre-grille">${T('modele')}</p>${svgGrille(q.support, q.colonnes, q.lignes, { polygone: q.modele })}`,
    `<p class="titre-grille">${T('aToi')}</p>${svgGrille(q.support, q.colonnes, q.lignes)}`,
  ])
}

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  let corps = ''
  const corrige: string[] = []
  if (x.alignes) {
    corps += `<h2>${T('ficheAlignes')}</h2><p class="consigne">${T('ficheAlignesConsigne')}</p>`
    corps += rangeesDeDeux(x.alignes.map(q => svgAlignes(q, { aucun: T('aucunCase') })))
    corrige.push(`<p><b>${T('ficheAlignes')} :</b> ${x.alignes.map((q, i) => `${i + 1}. ${q.attendu}`).join(' — ')}</p>`
      + rangee('', x.alignes.map(q => svgAlignes(q, { corrige: true, echelle: 0.45, aucun: T('aucunCase') }))))
  }
  if (x.completer) {
    corps += `<h2>${T('ficheCompleter')}</h2>${rangeesDeDeux(x.completer.map(q => caseCompleter(q, T, false)))}`
    // un carré dont un seul côté est tracé se construit des deux côtés de ce côté : le corrigé en montre un
    const deuxCarres = x.completer.some(q => q.solutions.length > 1) ? ` ${T('corrigeDeuxCarres')}` : ''
    corrige.push(`<p><b>${T('ficheCompleter')} :</b>${deuxCarres}</p>${rangee('', x.completer.map(q => caseCompleter(q, T, true)))}`)
  }
  if (x.construire) {
    const [rectangle, ...autres] = x.construire
    const consigne = rectangle.codeLongueurs ? T('ficheConstruireConsigneCE2') : T('ficheConstruireConsigne')
    corps += `<h2>${T('ficheConstruire')}</h2><p class="consigne">${consigne}</p>`
    corps += rangee('', [caseConstruire(rectangle, T)]) + rangee('', autres.map(q => caseConstruire(q, T)))
    corrige.push(`<p><b>${T('ficheConstruire')} :</b> ${T('corrigeConstruire')}</p>`
      + rangee('', x.construire.map(q => svgConstruction(q.figure, q.mesures, q.codeLongueurs))))
  }
  if (x.reproduire) {
    const support = x.reproduire[0]?.support ?? 'pointe'
    corps += `<h2>${T('ficheReproduire')}</h2><p class="consigne">${T(`ficheReproduireConsigne.${support}`)}</p>`
    corps += x.reproduire.map(q => rangeeReproduire(q, T)).join('')
    corrige.push(`<p><b>${T('ficheReproduire')} :</b> ${T('corrigeReproduire')}</p>`)
  }
  const titre = `${T('titre')} — ${x.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: 'none', marge: '0',
    corps: `${ligneNomDate(langue)}
    ${corps}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige.map(c => `<div class="bloc-corrige">${c}</div>`).join('')}</section>`,
  })
}
