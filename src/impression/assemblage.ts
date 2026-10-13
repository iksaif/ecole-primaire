// L'assemblage de fiches : une feuille faite de fragments de plusieurs fiches (src/impression/fragment.ts), avec UNE ligne Prénom / Date en tête et UN corrigé à la fin.
// Pur (lisible par node). Ce que fait l'assemblage de chaque fragment :
//   - la ligne `.entete` est retirée (celle de la feuille la remplace) ;
//   - les sections `section.corrige` sont retirées et réunies dans un seul corrigé, un sous-titre par bloc ;
//   - le CSS du fragment est limité à son bloc (CSS imbriqué : `.bloc-n { … }`), `@page` est retiré (le format est celui de la feuille), `body` devient le bloc lui-même ;
//   - le titre du fragment devient le titre du bloc.
import { documentFiche, ligneNomDate } from './document.ts'
import { echapper } from '../utils/html.js'
import type { Fragment } from './fragment.ts'

export interface Bloc {
  /** titre du bloc ; absent : celui de la fiche */
  titre?: string
  fragment: Fragment
}

export interface OptionsAssemblage {
  /** titre de la feuille (balise <title> et titre affiché) */
  titre: string
  langue: string
  blocs: readonly Bloc[]
  /** « Corrigé » (dans la langue du contenu) */
  corrige: string
  /** familles CSS du texte (la police des fiches) et leurs @font-face */
  police?: string
  cssPolices?: string
  /** une ligne Prénom / Date en tête (défaut : oui) */
  entete?: boolean
  /** chaque bloc commence une page (défaut : non) */
  pageParBloc?: boolean
}

const ENTETE = /<p class="entete">[\s\S]*?<\/p>/g
const CORRIGE = /<section class="corrige"[^>]*>([\s\S]*?)<\/section>/g
const TITRE_DU_CORRIGE = /^\s*<h2[^>]*>[\s\S]*?<\/h2>/
const PAGE = /@page[^{]*\{[^}]*\}/g

/** Le corps d'un fragment sans sa ligne Prénom / Date ni ses corrigés, et ces corrigés (sans leur titre). */
export function separer(corps: string): { sans: string, corriges: string[] } {
  const corriges = [...corps.matchAll(CORRIGE)].map(m => m[1].replace(TITRE_DU_CORRIGE, '').trim())
  return { sans: corps.replace(ENTETE, '').replace(CORRIGE, ''), corriges }
}

/** Le CSS d'un fragment, limité à son bloc : sans `@page`, `body` devient le bloc (`&`), puis le tout dans `.bloc-n { … }`. */
export function cssDuBloc(css: string, n: number): string {
  const sansPage = css.replace(PAGE, '').replace(/(^|[\s}])body\s*\{/g, '$1& {')
  return `.bloc-${n} {\n${sansPage}\n}`
}

const CSS_ASSEMBLAGE = `
      .bloc { margin: 0 0 1.2rem; }
      .bloc-page + .bloc-page { break-before: page; page-break-before: always; }
      h2.titre-bloc { font-size: 1.1rem; margin: 1rem 0 .5rem; border-bottom: 1.5px solid #999; padding-bottom: .2rem; }
      h3.titre-corrige { font-size: .95rem; margin: .8rem 0 .2rem; }`

/** Le titre affiché d'un bloc : le sien, ou le titre de la fiche (le sien propre : `h1` du fragment) ; vide si la fiche n'en a pas. */
function titreDuBloc(b: Bloc): string {
  if (b.titre) return echapper(b.titre)
  if (b.fragment.h1 === null) return ''
  return b.fragment.h1 ?? echapper(b.fragment.titre)
}

export function assemblerFiches({ titre, langue, blocs, corrige, police, cssPolices, entete = true, pageParBloc = false }: OptionsAssemblage): string {
  const parties = blocs.map(b => ({ bloc: b, titre: titreDuBloc(b), ...separer(b.fragment.corps) }))
  const html = parties.map((p, i) => `<section class="bloc bloc-${i}${pageParBloc ? ' bloc-page' : ''}">
      ${p.titre ? `<h2 class="titre-bloc">${p.titre}</h2>` : ''}${p.sans}</section>`).join('\n')
  const corriges = parties.filter(p => p.corriges.length)
    .map(p => `<div class="corrige-bloc">${p.titre ? `<h3 class="titre-corrige">${p.titre}</h3>` : ''}${p.corriges.join('\n')}</div>`)
  const sectionCorrige = corriges.length ? `<section class="corrige"><h2>${echapper(corrige)}</h2>${corriges.join('\n')}</section>` : ''
  // les @font-face des fragments, une fois chacun
  const polices = [...new Set([cssPolices ?? '', ...blocs.map(b => b.fragment.cssPolices)].filter(Boolean))].join('\n')
  const css = [CSS_ASSEMBLAGE, ...blocs.map((b, i) => cssDuBloc(b.fragment.css, i))].join('\n')
  return documentFiche({
    titre, langue, police, cssPolices: polices, css, largeur: '700px', marge: '1.2cm',
    corps: `${entete ? ligneNomDate(langue) : ''}${html}${sectionCorrige}`,
  })
}
