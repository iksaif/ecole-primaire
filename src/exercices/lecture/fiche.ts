// Lecture — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Toujours en français.
//   texte : chaque texte dans un cadre, avec une étoile à colorier quand il est lu (rien à corriger) ;
//   syllabes : chaque mot, et une case pour le nombre de syllabes ; corrigé : le nombre et le découpage ;
//   mots : les syllabes mélangées, et une ligne pour écrire le mot ; corrigé : les mots.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import { echapper as e } from '../../utils/html.js'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { QuestionMots, QuestionSyllabes, QuestionTexte, TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>
type T = ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>['T']

const CSS = `
      .consigne { font-size: .95rem; margin: 0 0 1.5rem; font-weight: 700; }
      .num { font-weight: 700; color: #777; min-width: 1.6rem; }
      .texte { display: flex; align-items: flex-start; gap: .75rem; margin: 1.2rem 0; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; break-inside: avoid; }
      .texte .contenu { flex: 1; font-size: 1.15rem; line-height: 1.6; font-weight: 600; }
      .texte .etoile { font-size: 1.4rem; color: #bbb; }
      .ligne { display: flex; align-items: baseline; gap: .6rem; margin: 1.1rem 0; break-inside: avoid; }
      .mot { font-size: 1.25rem; font-weight: 800; min-width: 9rem; }
      .pointilles { flex: 1; border-bottom: 2px dotted #bbb; }
      .case { font-weight: 700; color: #444; }
      .melangees { font-size: 1.2rem; font-weight: 800; letter-spacing: .03em; min-width: 11rem; background: #f0f4f8; padding: .2rem .5rem; border-radius: 6px; text-align: center; }
      .trait { flex: 1; border-bottom: 1.5px solid #999; }
      .liste-corrige { list-style: none; padding: 0; margin: 0; columns: 3; }
      .liste-corrige li { margin: .2rem 0; break-inside: avoid; }`

const ligneTexte = (q: QuestionTexte, i: number): string =>
  `<div class="texte"><span class="num">${i + 1}.</span><div class="contenu">${e(q.texte)}</div><span class="etoile" aria-hidden="true">☆</span></div>`
const ligneSyllabes = (q: QuestionSyllabes, i: number, T: T): string =>
  `<div class="ligne"><span class="num">${i + 1}.</span><span class="mot">${e(q.mot)}</span><span class="pointilles"></span><span class="case">_____ ${T('uniteSyllabes')}</span></div>`
const ligneMots = (q: QuestionMots, i: number): string =>
  `<div class="ligne"><span class="num">${i + 1}.</span><span class="melangees">${e(q.melangees.join(' - '))}</span><span aria-hidden="true">➔</span><span class="trait"></span></div>`

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const n = x.niveau.toUpperCase()
  const qs = x.questions
  let titre: string, consigne: string, lignes: string, corrige = ''
  if (qs[0]?.mode === 'syllabes') {
    const syllabes = qs as QuestionSyllabes[]
    titre = T('titreSyllabes', { n }); consigne = T('consigneSyllabes')
    lignes = syllabes.map((q, i) => ligneSyllabes(q, i, T)).join('')
    corrige = syllabes.map((q, i) => `<li><span class="num">${i + 1}.</span> ${e(q.mot)} : <b>${q.syllabes.length}</b> (${e(q.syllabes.join('-'))})</li>`).join('')
  } else if (qs[0]?.mode === 'mots') {
    const mots = qs as QuestionMots[]
    titre = T('titreMots', { n }); consigne = T('consigneMots')
    lignes = mots.map(ligneMots).join('')
    corrige = mots.map((q, i) => `<li><span class="num">${i + 1}.</span> <b>${e(q.mot)}</b></li>`).join('')
  } else {
    titre = T('titreTexte', { n }); consigne = T('consigneTexte')
    lignes = (qs as QuestionTexte[]).map(ligneTexte).join('')
  }
  const sectionCorrige = corrige ? `<section class="corrige"><h2>${T('corrige')} — ${e(titre)}</h2><ol class="liste-corrige">${corrige}</ol></section>` : ''
  const corps = `<h1>${e(titre)}</h1>
    ${ligneNomDate(langue)}
    <p class="consigne">${consigne}</p>
    <div>${lignes}</div>
    ${sectionCorrige}`
  return documentFiche({ titre, langue, police, cssPolices, css: CSS, h1: null, largeur: '680px', corps })
}
