// La monnaie — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Les pièces et les billets
// sont ceux de l'exercice et de l'affiche (src/dessins/argent.ts).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { svgArgent } from '../../dessins/argent.ts'
import type { ValeurArgent } from '../../dessins/argent.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { fmt, formatSomme, nomArgent, nomObjet } from './generateur.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      h2 { font-size: 1.05rem; margin: 1.2rem 0 .4rem; }
      h2 small { font-weight: 400; color: #666; }
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .bloc { border: 1.5px solid #bbb; border-radius: 8px; padding: .5rem .75rem; margin: .5rem 0; page-break-inside: avoid; }
      .num { font-weight: 700; color: #777; display: inline-block; min-width: 1.6rem; }
      .tas { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: .3rem 0; }
      .arg svg { display: block; }
      .rep { text-align: right; font-size: 1.1rem; margin-top: .3rem; }
      .enonce { display: inline; }
      .ligne-rendre { margin: .9rem 0; font-size: 1.05rem; line-height: 1.6; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 0 .75rem; }
      .duo { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-top: .4rem; }
      .duo > div { border: 1px dashed #ccc; border-radius: 6px; padding: .3rem .5rem; }
      .lettre { font-size: 1.1rem; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const { niveau, centimes, decimale, parties } = x
  const f = (c: number): string => fmt(c, niveau)
  let numPartie = 0
  const titrePartie = (txt: string): string => `<h2>${++numPartie}. ${txt}</h2>`
  const dessin = (items: readonly ValeurArgent[]): string => items.map(v => `<span class="arg">${svgArgent(v, 0.8, nomArgent(v, T))}</span>`).join('')
  const ligneRep = decimale ? '__________ €' : centimes ? '______ € ______ c' : '__________ €'

  const blocCompter = x.compter.map((qu, i) => `
    <div class="bloc">
      <div class="num">${i + 1}.</div>
      <div class="tas">${dessin(qu.items)}</div>
      <div class="rep">${T('ficheIlYa')} : ${ligneRep}</div>
    </div>`).join('')

  const blocEntoure = x.entoure.map((e, i) => `
    <div class="bloc">
      <div class="num">${i + 1}.</div>
      <div class="enonce">${T('ficheEntoure')} <strong>${f(e.cible)}</strong>.</div>
      <div class="tas">${dessin(e.items)}</div>
    </div>`).join('')

  const blocMoins = x.moins.map((m, i) => `
    <div class="bloc">
      <div class="num">${i + 1}.</div>
      <div class="enonce">${T('fichePourPayer')} <strong>${f(m.cible)}</strong>, ${T('ficheMoinsConsigne')}</div>
      <div class="duo"><div><b class="lettre">A</b><div class="tas">${dessin(m.A)}</div></div>
      <div><b class="lettre">B</b><div class="tas">${dessin(m.B)}</div></div></div>
    </div>`).join('')

  const blocComparer = x.comparer.map((qu, i) => `
    <div class="bloc">
      <div class="num">${i + 1}.</div>
      <div class="enonce">${T('ficheComparerConsigne')}</div>
      <div class="duo"><div><b class="lettre">${qu.nomA}</b><div class="tas">${dessin(qu.itemsA)}</div></div>
      <div><b class="lettre">${qu.nomB}</b><div class="tas">${dessin(qu.itemsB)}</div></div></div>
    </div>`).join('')

  const blocRendre = x.rendre.map((qu, i) => `
    <div class="ligne-rendre">
      <span class="num">${i + 1}.</span>
      ${qu.objet.e} ${T('tuAchetes')} ${nomObjet(qu.objet, T)} ${T('ficheA')} <strong>${f(qu.prix)}</strong>.
      ${T('tuDonnes')} <strong>${formatSomme(qu.paye)}</strong>. ${T('ficheOnTeRend')} : ${centimes ? '______________' : '______ €'}
    </div>`).join('')

  const blocConvertir = parties.convertir ? `<div class="grille">`
    + x.convertir.map((qu, i) => `<div class="ligne-rendre"><span class="num">${i + 1}.</span> ${qu.texte
      .replace('? € ? c', '______ € ______ c').replace(/\? € \(.*\)/, '__________ €').replace('? c', '__________ c')}</div>`).join('')
    + '</div>' : ''

  // Corrigé : une ligne par partie, numérotée comme sur la fiche
  const numeros = (l: readonly string[]): string => l.map((r, i) => `${i + 1}. ${r}`).join(' — ')
  const lignes: [string, string][] = []
  if (parties.compter) lignes.push([T('ficheCompterTitre'), numeros(x.compter.map(qu => qu.attendu))])
  if (parties.entoure) lignes.push([T('ficheEntoureTitre'), `${numeros(x.entoure.map(e => e.bons.map(formatSomme).join(' + ')))} ${T('corrigeUneSolution')}`])
  if (parties.moins) lignes.push([T('ficheMoinsTitre'), numeros(x.moins.map(m => m.bonne))])
  if (parties.comparer) lignes.push([T('ficheComparerTitre'), numeros(x.comparer.map(qu => qu.attendu))])
  if (parties.rendre) lignes.push([T('ficheRendreTitre'), numeros(x.rendre.map(qu => qu.attendu))])
  if (parties.convertir) lignes.push([T('ficheConvertirTitre'), numeros(x.convertir.map(qu => qu.attendu))])
  const corrige = lignes.map(([titre, rep], i) => `<p><b>${i + 1}. ${titre}</b> ${rep}</p>`).join('')

  const titre = `${T('titre')} — ${niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, h1: `💶 ${titre}`, css: CSS, largeur: '720px', marge: '1.2cm',
    corps: `<p class="infos">${centimes ? T('ficheEurosCentimes') : T('ficheEuros')}</p>
    ${ligneNomDate(langue)}
    ${parties.compter ? `${titrePartie(`${T('ficheCompterTitre')}${decimale ? ` <small>${T('ficheExempleVirgule')}</small>` : ''}`)}
    <div class="grille">${blocCompter}</div>` : ''}
    ${parties.entoure ? `${titrePartie(T('ficheEntoureTitre'))}
    ${blocEntoure}` : ''}
    ${parties.moins ? `${titrePartie(T('ficheMoinsTitre'))}
    ${blocMoins}` : ''}
    ${parties.comparer ? `${titrePartie(T('ficheComparerTitre'))}
    ${blocComparer}` : ''}
    ${parties.rendre ? `${titrePartie(T('ficheRendreTitre'))}
    ${blocRendre}` : ''}
    ${blocConvertir ? `${titrePartie(`${T('ficheConvertirTitre')} <small>(1 € = 100 c)</small>`)}${blocConvertir}` : ''}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige}</section>`,
  })
}
