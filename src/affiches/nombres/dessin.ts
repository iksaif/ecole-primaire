// Le dessin de l'affiche des nombres : pur (aucun DOM, aucun hasard). Chaque ligne : le nombre en chiffres, sa représentation en
// matériel (src/dessins/base10.ts, le même que dans l'exercice), puis son écriture en lettres dans chaque langue de la feuille. Le nombre
// de colonnes est celui qui donne le plus grand texte, MESURÉ dans la police choisie (contexte.mesure) : rien ne dépasse, et les
// nombres de deux et trois chiffres restent lisibles, même sur les tableaux de 0 à 100.
import { echapper } from '../../utils/html.js'
import { LANGUES, donneesRegionales } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import { enLettresFr } from '../../langues/fr/nombres.ts'
import { representation } from '../../dessins/base10.ts'
import type { Page, Rendu } from '../types.ts'
import { NOMBRES, REPRESENTATION, nombresPerso } from './sections.ts'
import type { Section } from './sections.ts'
import type { Reglages } from './definition.ts'

type Config = Parameters<Rendu<Reglages>['dessin']>[0]
interface Entree { n?: number, titre?: string, repr?: Section }

const ECART_COLONNES = 6, ENTETE = 8, TAILLE_MAX = 16

/** Les nombres d'une section. */
const nombresDe = (s: Section, r: Config): readonly number[] => (s === 'perso' ? nombresPerso(r.de, r.a, r.pas) : NOMBRES[s])

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T, ctx) => {
  const { mesure } = ctx
  const nom = ctx.nomPolice()
  const langues = r.langues as readonly string[]
  const sections = (r.sections as readonly Section[])
  const bilingue = langues.length > 1
  // l'écriture d'un nombre dans une langue : le français suit l'orthographe choisie, les langues régionales ont leurs données vérifiées
  const ecrit = (n: number): string[] => langues.map(l => (l === 'fr' ? enLettresFr(n, { rectifiee: r.rectifiee }) : donneesRegionales(l as Langue)?.enLettres(n) ?? enLettresFr(n)))
  // les titres de chaque langue, séparés par « · » ; trop longs pour une ligne de titre (A4 portrait), seul celui de la première langue reste
  const joindre = (titres: string[]): string => { const tout = titres.join(' · '); return tout.length > 34 ? titres[0] : tout }
  const titreDe = (s: Section): string => {
    const nb = nombresDe(s, r)
    return joindre(langues.map(l => {
      const T = ctx.Tde(l)
      return s === 'perso' || s === 'onze' || /^d\d$/.test(s) ? T('section.deA', { de: nb[0], a: nb[nb.length - 1] }) : T(`section.${s}`)
    }))
  }

  // Le nombre de colonnes qui donne le plus grand texte lisible
  function disposer(entrees: readonly Entree[], wDispo: number, hDispo: number, avecRepr: boolean) {
    const largeurs = entrees.map(e => {
      if (e.titre) return mesure.largeur(e.titre, nom, true) * 1.15
      const chiffres = mesure.largeur(String(e.n), nom, true) * 1.5
      const textes = Math.max(...ecrit(e.n ?? 0).map(t => mesure.largeur(t, nom)))
      // colonne des chiffres : 2,6 em à 1,5× la taille du texte (cf. .chiffres) ; marge de 8 % pour l'écart des polices
      return (Math.max(chiffres, 1.5 * 2.6) + textes + 4) * 1.08
    })
    const hauteurLigne = bilingue ? 2.6 : 1.6
    let meilleur = { cols: 1, parCol: entrees.length, colW: wDispo, reprW: 0, taille: 0 }
    for (let cols = 1; cols <= 4; cols++) {
      const parCol = Math.ceil(entrees.length / cols)
      const colW = (wDispo - (cols - 1) * ECART_COLONNES) / cols
      const reprW = avecRepr ? colW * 0.3 : 0
      const taille = Math.min(hDispo / (parCol * hauteurLigne), Math.min(...largeurs.map(l => (colW - reprW) / l)), TAILLE_MAX)
      if (cols === 1 || taille > meilleur.taille + 0.05) meilleur = { cols, parCol, colW, reprW, taille }
    }
    return meilleur
  }

  function page(titre: string | null, entrees: readonly Entree[], avecRepr: boolean): Page {
    const hDispo = H - ENTETE
    const d = disposer(entrees, W, hDispo, avecRepr)
    const t = d.taille
    const colonnes: Entree[][] = Array.from({ length: d.cols }, (_, c) => entrees.slice(c * d.parCol, (c + 1) * d.parCol) as Entree[])
    const hLigne = hDispo / d.parCol
    const ligne = (e: Entree): string => {
      if (e.titre !== undefined) return `<div class="sous-titre" style="height:${hLigne}mm;font-size:${t * 1.05}mm">${echapper(e.titre)}</div>`
      const n = e.n ?? 0
      const type = avecRepr && e.repr ? REPRESENTATION[e.repr] : undefined
      const repr = type ? representation(type, n, hLigne * 0.72, d.reprW * 0.92) : ''
      const mots = ecrit(n).map((m, i) => `<span class="l${i}">${echapper(m)}</span>`).join('')
      // l'écart entre le nombre, son dessin et ses lettres suit le corps du texte (2 mm collait « 10 » à « dix » sur les grands corps)
      return `<div class="ligne" style="height:${hLigne}mm;gap:${(t * 0.45).toFixed(2)}mm">
  <span class="chiffres" style="font-size:${t * 1.5}mm;width:${t * 1.5 * 2.6}mm">${n}</span>
  ${avecRepr ? `<span class="repr" style="width:${d.reprW}mm">${repr}</span>` : ''}
  <span class="mots" style="font-size:${t}mm">${mots}</span></div>`
    }
    const legende = bilingue ? langues.map((l, i) => `<span class="l${i}">■ ${echapper(LANGUES[l as Langue].nomLocal)}</span>`).join(' ') : ''
    const corps = `<div class="legende" style="height:${ENTETE}mm">${legende}</div>
  <div class="colonnes" style="gap:${ECART_COLONNES}mm">${colonnes.map(col => `<div class="col" style="width:${d.colW}mm">${col.map(ligne).join('')}</div>`).join('')}</div>`
    return titre === null ? corps : { titre, corps }
  }

  const choisies = sections.length ? sections : (['cent'] as Section[])
  const avecRepr = (s: Section): boolean => r.representation && !!REPRESENTATION[s]
  if (r.miseEnPage === 'affiches') {
    return choisies.map(s => page(titreDe(s), nombresDe(s, r).map(n => ({ n, repr: s })), avecRepr(s)))
  }
  const entrees = choisies.flatMap(s => [{ titre: titreDe(s) }, ...nombresDe(s, r).map(n => ({ n, repr: s }))])
  return [page(joindre(langues.map(l => ctx.Tde(l)('titre.fiche'))), entrees, choisies.some(avecRepr))]
}

export const css = `.legende { text-align: center; font-size: 4mm; flex: none; }
  .colonnes { display: flex; justify-content: center; }
  .ligne { display: flex; align-items: center; gap: 2mm; border-bottom: 0.25mm solid #e1e4ea; overflow: hidden; }
  .chiffres { font-weight: 700; text-align: right; flex: none; color: #222; }
  .repr { flex: none; display: flex; align-items: center; justify-content: center; }
  .repr svg { display: block; }
  .mots { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
  .l0 { color: #1d4e9e; }
  .l1 { color: #111; font-style: italic; font-size: .92em; }
  .sous-titre { display: flex; align-items: flex-end; font-weight: 700; color: #e07a1f; border-bottom: 0.4mm solid #e07a1f; }
  .contenu h1 { color: #333; }`
