// Page `telechargements/index.html` : toutes les fiches (sans les fiches par compétence, qui sont sous leur bilan) par matière,
// puis de A à Z, en HTML statique : un moteur de recherche et une personne sans JavaScript y trouvent chaque fiche. L'app se
// charge par-dessus (la grille filtrable de /telechargements). Titre du document : celui de la route de l'app (`nav.telechargements`).
import { contenu } from '../../../src/langues/traduire.ts'
import type { Langue } from '../../../src/langues/registre.ts'
import { MATIERES } from '../../../src/data/programme.ts'
import type { Matiere } from '../../../src/data/programme.ts'
import { langueDuTexte, texteDe } from '../../../src/telechargements/recherche.ts'
import type { EntreeIndex } from '../../../src/telechargements/types.ts'
import { texteClasses } from '../../../src/data/classes.ts'
import { ADRESSE_INDEX, absolue, adresseFiche } from './adresses.ts'
import { echapper, meta, propriete } from './html.ts'
import { habiller, STYLE_STATIQUE } from './modele.ts'
import type { ContexteStatique, PageStatique } from './types.ts'

/** Les fiches de l'index rangées par matière (ordre de MATIERES), `null` : hors programme ; chaque liste de A à Z. */
export function parMatiere(ctx: ContexteStatique, langue: Langue): { matiere: Matiere | null, entrees: EntreeIndex[] }[] {
  const matiereDe = new Map(ctx.index.filtres.domaines.map(d => [d.id, d.matiere] as const))
  const groupes = new Map<Matiere | null, EntreeIndex[]>()
  for (const e of ctx.index.entrees) {
    if (e.parent !== null) continue
    const m = (e.domaine === null ? null : matiereDe.get(e.domaine)) ?? null
    groupes.set(m, [...(groupes.get(m) ?? []), e])
  }
  const az = (a: EntreeIndex, b: EntreeIndex): number => texteDe(a.titre, langue).localeCompare(texteDe(b.titre, langue), langue)
  return [...MATIERES, null].filter(m => groupes.has(m)).map(m => ({ matiere: m, entrees: (groupes.get(m) ?? []).sort(az) }))
}

export function pageIndex(ctx: ContexteStatique): PageStatique {
  const langue = ctx.site.langueInterface
  const { t } = contenu(langue)
  const titreDoc = `${t('nav.telechargements')} — ${ctx.site.nom}`
  const description = t('statique.indexIntro')
  const canonique = absolue(ctx.site, ADRESSE_INDEX)
  const groupes = parMatiere(ctx, langue).map(g => {
    const nom = g.matiere ? t(`statique.matiere.${g.matiere}`) : t('statique.horsProgramme')
    const items = g.entrees.map(e => {
      const lang = langueDuTexte(e.titre, langue) === langue ? '' : ` lang="${langueDuTexte(e.titre, langue)}"`
      return `<li><a href="${echapper(`${ctx.base}${adresseFiche(e.slug)}`)}"${lang}>${echapper(texteDe(e.titre, langue))}</a> (${echapper(texteClasses(e.niveaux))})</li>`
    }).join('\n        ')
    return `<h2>${echapper(nom)}</h2>\n      <ul>\n        ${items}\n      </ul>`
  })
  const tete = [
    `<title>${echapper(titreDoc)}</title>`, meta('description', description), `<link rel="canonical" href="${echapper(canonique)}">`,
    propriete('og:type', 'website'), propriete('og:site_name', ctx.site.nom), propriete('og:title', titreDoc), propriete('og:description', description),
    propriete('og:url', canonique), meta('twitter:card', 'summary'), STYLE_STATIQUE,
  ].join('\n    ')
  const corps = `<main class="statique">
    <nav aria-label="${echapper(t('statique.filAriane'))}"><ol class="fil">
      <li><a href="${echapper(ctx.base)}">${echapper(t('statique.accueil'))}</a></li>
      <li aria-current="page">${echapper(t('statique.fichesAImprimer'))}</li></ol></nav>
    <h1>${echapper(t('statique.indexTitre'))}</h1>
    <p>${echapper(description)}</p>
    ${groupes.length ? groupes.join('\n      ') : `<p>${echapper(t('statique.indexVide'))}</p>`}
  </main>`
  return { adresse: ADRESSE_INDEX, langue, canonique, titre: titreDoc, description, html: habiller(ctx.modele, { langue, tete, corps }) }
}
