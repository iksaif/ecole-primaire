// `sitemap.xml` : l'accueil, les matières, le programme, les compétences, les exercices, l'index des fiches et toutes les fiches
// dont CE site est la référence (canonical : adresses.ts), avec `lastmod` (date de génération de l'index) et `hreflang` des
// entrées sœurs. La liste des pages de l'app vient de la table des routes (src/router/routes.ts) : une seule source ; un site régional n'y met que sa surface
// régionale (indexation.ts), et l'accueil et la page de la langue régionale portent leurs `hreflang`.
import { ADRESSE_INDEX, absolue, adresseFiche, alternativesDe, siteDeReference } from './adresses.ts'
import { adressesApp, adressesIndexees, alternativesApp } from './indexation.ts'
import type { Alternative } from './adresses.ts'
import { echapper } from './html.ts'
import type { ContexteStatique } from './types.ts'

export { adressesApp }

/** Adresses des pages statiques dont ce site est la référence : l'index des fiches et ses fiches. */
export function adressesStatiques(ctx: ContexteStatique): string[] {
  const miennes = ctx.index.entrees.filter(e => siteDeReference(e.langues).id === ctx.site.id)
  return [ADRESSE_INDEX, ...miennes.map(e => adresseFiche(e.slug))]
}

export function sitemap(ctx: ContexteStatique): string {
  const entree = (adresse: string, alternates: string): string =>
    `  <url>\n    <loc>${echapper(absolue(ctx.site, adresse))}</loc>\n    <lastmod>${ctx.date}</lastmod>${alternates}\n  </url>`
  const slugDe = new Map(ctx.index.entrees.map(e => [adresseFiche(e.slug), e.slug] as const))
  const lien = (a: Alternative): string => `\n    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${echapper(a.href)}"/>`
  const url = (adresse: string): string => {
    const slug = slugDe.get(adresse)
    const alternatives = slug ? alternativesDe(slug, ctx.index.entrees, ctx.site) : alternativesApp(adresse)
    return entree(adresse, alternatives.map(lien).join(''))
  }
  const adresses = [...adressesIndexees(ctx), ...adressesStatiques(ctx)]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${adresses.map(url).join('\n')}\n</urlset>\n`
}
