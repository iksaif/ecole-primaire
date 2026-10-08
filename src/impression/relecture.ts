// Le document de relecture du breton : à imprimer (ou à enregistrer en PDF) et à donner à un·e brittophone. Pour chaque texte : le français
// (la référence), le breton actuel, et de la place pour écrire la correction (lignes à remplir, cases « OK » et « à corriger »).
// Pur (lisible par node) : la page /dev/relecture-breton le met en page, tests/relecture-breton.test.mjs le vérifie.
// Le document est toujours en français ; seul le mot « Brezhoneg » est breton.
import { documentFiche } from './document.ts'
import { traduire } from '../langues/traduire.ts'
import { echapper } from '../utils/html.js'
import type { LigneRelecture } from '../langues/relecture.ts'

export interface OptionsRelecture {
  /** nombre de lignes de correction par texte ; `'auto'` : selon la longueur du texte */
  lignes: number | 'auto'
  /** les cases « OK » et « à corriger » */
  cases: boolean
  /** la clé de chaque texte (repère technique, pour retrouver où corriger) */
  cles: boolean
  /** un saut de page avant chaque section */
  parSection: boolean
  /** adresse où renvoyer le document corrigé */
  contact: string
}

/** Nombre de lignes de correction d'un texte : une par tranche de 60 signes du plus long des deux textes (au moins une, au plus six). */
export function nbLignes(ligne: Pick<LigneRelecture, 'francais' | 'breton'>): number {
  const longueur = Math.max(ligne.francais.length, ligne.breton?.length ?? 0)
  return Math.min(6, Math.max(1, Math.ceil(longueur / 60)))
}

const CSS = `
      @page { size: A4; margin: 13mm 14mm 15mm; }
      body { font-size: 10pt; line-height: 1.3; }
      h1 { font-size: 16pt; }
      .consigne { margin: 0 0 3mm; }
      .contact { margin: 0 0 4mm; color: #555; }
      h2 { font-size: 12pt; margin: 5mm 0 2mm; padding: 1mm 2.5mm; background: #2c3e50; color: #fff; break-after: avoid; }
      h2.page { break-before: page; margin-top: 0; }
      article { border: .3mm solid #999; border-radius: 1.5mm; padding: 1.4mm 3mm 1.8mm; margin: 0 0 2mm; break-inside: avoid; }
      article.incertain { border-left: 1.6mm solid #e0a800; }
      .entete { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; min-height: 3.4mm; margin: 0 0 .8mm; }
      .cle { font: 7pt/1 ui-monospace, Menlo, monospace; color: #777; }
      .cle b { color: #b07d00; font-family: inherit; }
      .cases { font-size: 8.5pt; margin-left: auto; white-space: nowrap; }
      .cases span { margin-left: 5mm; }
      .case { display: inline-block; width: 3mm; height: 3mm; border: .3mm solid #333; margin-right: 1.2mm; vertical-align: -.4mm; }
      .texte { margin: 0 0 .8mm; }
      .texte .lib { display: inline-block; min-width: 19mm; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .03em; color: #555; }
      .texte.bz { font-style: italic; }
      .texte.absent { color: #999; }
      .correction { position: relative; }
      .correction .lib { position: absolute; left: 0; top: 4.2mm; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .03em; color: #555; }
      .ligne { height: 7mm; border-bottom: .3mm solid #888; }
      .correction .ligne:first-of-type { margin-left: 19mm; }`

const T = (cle: Parameters<typeof traduire>[1], ...args: unknown[]): string =>
  (traduire as (l: 'fr', c: string, ...a: unknown[]) => string)('fr', cle, ...args)

/** Un texte à relire : repère et cases sur une ligne, français, breton actuel, lignes de correction. */
function article(l: LigneRelecture, o: OptionsRelecture): string {
  const absent = l.breton === null
  const breton = absent ? T('relecture.docAbsent') : l.breton
  const repere = [o.cles ? `<span>${echapper(`${l.section}.${l.cle}`)}</span>` : '', l.aRelire ? ` <b>${echapper(T('relecture.docIncertain'))}</b>` : '']
    .filter(Boolean).join('')
  const cases = o.cases
    ? `<span class="cases"><span><i class="case"></i>${echapper(T('relecture.docOk'))}</span><span><i class="case"></i>${echapper(T('relecture.docCorriger'))}</span></span>`
    : ''
  const entete = repere || cases ? `<div class="entete"><span class="cle">${repere}</span>${cases}</div>` : ''
  const nb = o.lignes === 'auto' ? nbLignes(l) : o.lignes
  const lignes = Array.from({ length: nb }, () => '<div class="ligne"></div>').join('')
  return `<article${l.aRelire ? ' class="incertain"' : ''}>
    ${entete}
    <p class="texte fr"><span class="lib">${echapper(T('relecture.docFrancais'))}</span> ${echapper(l.francais)}</p>
    <p class="texte bz${absent ? ' absent' : ''}"><span class="lib">${echapper(T('relecture.docBreton'))}</span> ${echapper(breton ?? '')}</p>
    <div class="correction"><span class="lib">${echapper(T('relecture.docCorrection'))}</span>${lignes}</div>
  </article>`
}

/** Les lignes groupées par section, dans l'ordre où elles arrivent. */
function parSection(lignes: readonly LigneRelecture[]): [string, LigneRelecture[]][] {
  const groupes = new Map<string, LigneRelecture[]>()
  for (const l of lignes) {
    const cle = `${T(`relecture.docOrigine.${l.origine}`)} · ${l.section}`
    groupes.set(cle, [...(groupes.get(cle) ?? []), l])
  }
  return [...groupes]
}

/** Le document complet (HTML) : titre, consigne, puis une rubrique par section. */
export function documentRelecture(lignes: readonly LigneRelecture[], options: OptionsRelecture): string {
  const sections = parSection(lignes)
  const corps = sections.map(([titre, textes], i) =>
    `<h2${options.parSection && i > 0 ? ' class="page"' : ''}>${echapper(titre)} (${textes.length})</h2>\n${textes.map(l => article(l, options)).join('\n')}`).join('\n')
  const titre = T('relecture.docTitre')
  return documentFiche({
    titre, langue: 'fr', css: CSS, largeur: '720px', marge: '0',
    h1: `${echapper(titre)} — ${echapper(T('relecture.docNombre', { n: lignes.length }))}`,
    corps: `<p class="consigne">${echapper(T('relecture.docConsigne'))}</p>
    <p class="contact">${echapper(T('relecture.docContact', { contact: options.contact }))}</p>
    ${corps}`,
  })
}
