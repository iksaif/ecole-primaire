// `sitemap.xml` : l'accueil, les matières, le programme, les compétences, les exercices, l'index des fiches et toutes les fiches
// dont CE site est la référence (canonical : adresses.ts), avec `lastmod` (date de génération de l'index) et `hreflang` des
// entrées sœurs. La liste des pages de l'app vient de la table des routes (src/router/routes.ts) : une seule source.
import { COMPETENCES } from '../../src/data/programme.ts'
import { REGISTRE } from '../../src/exercices/index.ts'
import { estIndexable } from '../../src/router/canonique.ts'
import { routesDeBase } from '../../src/router/routes.ts'
import { ADRESSE_INDEX, absolue, adresseFiche, alternativesDe, siteDeReference } from './adresses.ts'
import type { Alternative } from './adresses.ts'
import { echapper } from './html.ts'
import type { ContexteStatique } from './types.ts'

/** Adresses (sans base ni « / » initial) des pages de l'app qui s'indexent ; '' : l'accueil. Les fiches ne sont pas ici. */
export function adressesApp(ctx: ContexteStatique): string[] {
  const fixes = routesDeBase(ctx.site.languesRegionales)
    .filter(r => r.meta?.titre !== undefined || r.meta?.titreLibre !== undefined)
    .map(r => r.path)
    .filter(p => !p.includes(':') && estIndexable(p) && !p.startsWith('/telechargements'))
    .map(p => p.slice(1))
  const exercices = REGISTRE.filter(e => !e.exemple).map(e => e.definition.route.slice(1))
  const competences = COMPETENCES.map(c => `competence/${c.id}`)
  return [...new Set([...fixes, ...exercices, ...competences])]
}

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
    return entree(adresse, slug ? alternativesDe(slug, ctx.index.entrees, ctx.site).map(lien).join('') : '')
  }
  const adresses = [...adressesApp(ctx), ...adressesStatiques(ctx)]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${adresses.map(url).join('\n')}\n</urlset>\n`
}
