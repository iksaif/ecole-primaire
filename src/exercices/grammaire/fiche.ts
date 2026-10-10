// Grammaire — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Toujours en français (exercice de
// français) : les textes calculés des questions sont lus avec T, le catalogue de contenu (textes.ts).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import { ORDRE_FICHE } from './definition.ts'
import type { CONTENU } from './textes.ts'
import { texteTokens, valeur, tc, consigneFiche } from './generateur.ts'
import type { Question, TirageFiche, Tr } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      h2 { font-size: 1rem; margin: 1.4rem 0 .4rem; background: #f0f3f7; padding: .3rem .6rem; border-radius: 6px; }
      .q { display: flex; gap: .6rem; margin: .7rem 0; font-size: 1.15rem; line-height: 2.1; page-break-inside: avoid; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .contenu { flex: 1; }
      .grand { font-size: 1.3rem; letter-spacing: .02em; word-spacing: .35em; }
      .ligne { display: inline-block; min-width: 220px; border-bottom: 1.5px solid #888; height: 1.2em; vertical-align: bottom; }
      .ligne.courte { min-width: 60px; } .ligne.moyenne { min-width: 120px; }
      .lignebloc .ligne { display: block; width: 100%; margin-top: .3rem; }
      .case { display: inline-block; width: 1em; height: 1em; border: 1.5px solid #555; vertical-align: middle; margin: 0 .2rem; }
      .cases { font-size: 1rem; }
      .etiqs { display: flex; flex-wrap: wrap; gap: .4rem; }
      .etiq { border: 1.5px solid #555; border-radius: 6px; padding: 0 .5rem; line-height: 1.8; }
      section.corrige { font-size: .95rem; }
      section.corrige h2 { background: none; padding: 0; }
      .corr { margin: .3rem 0; }
      u { text-decoration-thickness: 2px; }
      em { color: #555; }`

const LIGNE = '<span class="ligne"></span>'
const CASE = '<span class="case"></span>'
const minuscule = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1)

// Rendu d'une question sur papier
function questionFiche(q: Question, T: Tr): string {
  const tokTxt = q.tokens ? texteTokens(q.tokens) : ''
  const html = valeur(q.html, T)
  const bonne = q.choix?.[q.bonne ?? 0] ?? ''
  switch (q.type) {
    case 'ordre':
      return `<div class="etiqs">${(q.etiquettes ?? []).map(e => `<span class="etiq">${e}</span>`).join('')} <span class="etiq">${q.fin}</span></div><div class="lignebloc">${LIGNE}</div>`
    case 'phrase':
      return `<div>${html}</div><div class="cases">${CASE} ${T('fiche_cestPhrase')} &nbsp;&nbsp; ${CASE} ${T('fiche_pasPhrase')}</div>`
    case 'majuscule': {
      const brut = minuscule(bonne).slice(0, -1)
      return `<div>${brut}</div><div class="lignebloc">${LIGNE}</div>`
    }
    case 'ponctuation':
      return `<div>${html.replace('<span class="trou">…</span>', CASE)}</div>`
    case 'typePhrase':
      return `<div>${html}</div><div class="cases">${CASE} ${tc(T, 'déclarative')} &nbsp; ${CASE} ${tc(T, 'interrogative')} &nbsp; ${CASE} ${tc(T, 'impérative')}</div>`
    case 'pronomPersonne':
      return `<div>${html} &nbsp;→ <span class="ligne moyenne"></span></div>`
    case 'complexe':
      return `<div class="grand">${html}</div><div class="cases">${CASE} ${tc(T, 'phrase simple')} &nbsp;&nbsp; ${CASE} ${tc(T, 'phrase complexe')}</div>`
    case 'negation':
      return `<div>${html.replace(/<div class="sens">(.*)<\/div>/, ' <em>($1)</em>')}</div><div class="lignebloc">${LIGNE}</div>`
    case 'negReconnaitre':
      return (q.choix ?? []).length === 2
        ? `<div>${html}</div><div class="cases">${CASE} ${tc(T, 'affirmative')} &nbsp;&nbsp; ${CASE} ${tc(T, 'négative')}</div>`
        : `<div>${html} &nbsp;→ <span class="ligne moyenne"></span></div>`
    case 'verbe': case 'nom': case 'det': case 'adj': case 'sujet': case 'cplt': case 'gnNoyau':
      return `<div class="grand">${tokTxt}</div>`
    case 'nature':
      return `<div>${html} &nbsp;→ ${LIGNE}</div>`
    case 'pronom':
      return `<div>${html}</div><div class="lignebloc">${LIGNE}</div>`
    case 'cpltQ':
      return `<div>${html} &nbsp;&nbsp; ${CASE} ${tc(T, 'Où ?').toLowerCase()} &nbsp; ${CASE} ${tc(T, 'Quand ?').toLowerCase()}</div>`
    case 'cpltNature':
      return `<div>${html} &nbsp;&nbsp; ${CASE} V &nbsp; ${CASE} ${T('fiche_lettrePhrase')}</div>`
    case 'genre':
      return `<div>${html.replace('<span class="trou">___</span>', '<span class="ligne courte"></span>')}</div>`
    case 'nombre':
      return `<div>${html} &nbsp;&nbsp; ${CASE} ${tc(T, 'singulier')} &nbsp; ${CASE} ${tc(T, 'pluriel')}</div>`
    case 'pluriel':
      return `<div>${html.replace('<span class="trou">…</span>', LIGNE)}</div>`
    case 'accordGN': case 'accordSV':
      return `<div>${html.replace('<span class="trou">___</span>', '<span class="ligne moyenne"></span>')}</div>`
  }
  return ''
}

export function fiche({ questions: x, T: TC, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const T = TC as Tr
  const { niveau, questions: qs } = x
  const ordre = [...new Set(qs.map(q => q.type))].sort((a, b) => ORDRE_FICHE.indexOf(a) - ORDRE_FICHE.indexOf(b))
  const parType = ordre.map(ty => ({ t: ty, qs: qs.filter(q => q.type === ty) }))
  let num = 0
  const corps = parType.map(g => `
    <h2 data-type="${g.t}">${consigneFiche(T, g.t, niveau)}</h2>
    ${g.qs.map(q => { num++; return `<div class="q"><span class="num">${num}.</span><div class="contenu">${questionFiche(q, T)}</div></div>` }).join('')}
  `).join('')
  num = 0
  const corrige = parType.map(g => g.qs.map(q => { num++; return `<div class="corr"><span class="num">${num}.</span> ${valeur(q.solution, T)}</div>` }).join('')).join('')
  return documentFiche({
    titre: `${T('titre')} — ${niveau.toUpperCase()}`, langue, police, cssPolices, css: CSS, largeur: '700px',
    corps: `${ligneNomDate(langue)}
    ${corps}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige}</section>`,
  })
}
