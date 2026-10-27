// Ce que chaque site indexe pour lui-même parmi les pages de l'app. Le site de référence (ecoleprimaire.app) indexe toutes ses pages. Un site régional (skoolik.app,
// `referenceFrancais` de src/sites.ts) n'indexe que sa surface régionale : son accueil, la page de la langue régionale et ses sous-pages, et les compétences qui
// ont au moins une ressource dans cette langue dont la traduction est assez sûre pour le seuil par défaut. Ses autres pages (matières, exercices…) sont les mêmes
// que sur le site de référence : leur canonical pointe là-bas (coquilles.ts), le sitemap ne les liste pas. Les pages que les deux sites indexent (accueil,
// page de la langue régionale) se déclarent mutuellement en `hreflang`.
import { COMPETENCES } from '../../../src/data/programme.ts'
import { routesDeBase } from '../../../src/router/routes.ts'
import { REGISTRE as EXERCICES } from '../../../src/exercices/index.ts'
import { REGISTRE as AFFICHES } from '../../../src/affiches/index.ts'
import { assezSure, NIVEAU_PAR_DEFAUT } from '../../../src/langues/confiance.ts'
import type { Langue } from '../../../src/langues/registre.ts'
import { estIndexable, estPropreAuSite } from '../../../src/router/canonique.ts'
import { construireCatalogue } from '../../../src/ressources/catalogue.ts'
import { SITES } from '../../../src/sites.ts'
import type { CompetenceId, RessourceDeContenu } from '../../../src/ressources/types.ts'
import { absolue, hreflang } from './adresses.ts'
import type { Alternative } from './adresses.ts'
import type { ContexteStatique } from './types.ts'

/** Adresses (sans base ni « / » initial) des pages de l'app qui s'indexent ; '' : l'accueil. Les fiches ne sont pas ici. */
export function adressesApp(ctx: ContexteStatique): string[] {
  const fixes = routesDeBase(ctx.site.languesRegionales)
    .filter(r => r.meta?.titre !== undefined || r.meta?.titreLibre !== undefined)
    .map(r => r.path)
    .filter(p => !p.includes(':') && estIndexable(p) && !p.startsWith('/telechargements'))
    .map(p => p.slice(1))
  const exercices = EXERCICES.filter(e => !e.exemple).map(e => e.definition.route.slice(1))
  const competences = COMPETENCES.map(c => `competence/${c.id}`)
  return [...new Set([...fixes, ...exercices, ...competences])]
}

/** Les compétences qui ont au moins une ressource dans cette langue, avec une traduction assez sûre pour le seuil. */
export function competencesAvecLangue(catalogue: readonly RessourceDeContenu[], langue: Langue, seuil = NIVEAU_PAR_DEFAUT): Set<CompetenceId> {
  const ids = new Set<CompetenceId>()
  for (const r of catalogue) {
    if (!r.langues.includes(langue) || !assezSure(r.confiance ?? null, seuil)) continue
    for (const c of r.competences) ids.add(c)
  }
  return ids
}

/** Ce site est-il un site régional (il ne fait pas référence pour le français) ? */
export const estSiteRegional = (ctx: Pick<ContexteStatique, 'site'>): boolean => ctx.site.referenceFrancais !== null

/** Les adresses de l'app (sans « / » initial ; '' : l'accueil) que ce site indexe pour lui-même : toutes sur le site de référence, la surface régionale sur un site régional. */
export function adressesIndexees(ctx: ContexteStatique): string[] {
  const toutes = adressesApp(ctx)
  if (!estSiteRegional(ctx)) return toutes
  const regionales = ctx.site.languesRegionales
  const catalogue = construireCatalogue({ exercices: EXERCICES, affiches: AFFICHES, fiches: ctx.index, site: ctx.site, enDeveloppement: false })
  const avecLangue = new Set(regionales.flatMap(l => [...competencesAvecLangue(catalogue, l)]))
  const competences = new Set(COMPETENCES.filter(c => avecLangue.has(c.id)).map(c => `competence/${c.id}`))
  return toutes.filter(a => estPropreAuSite(`/${a}`, regionales) || competences.has(a))
}

/** Le canonical absolu d'une page de l'app : elle-même si ce site l'indexe, sinon la même page du site de référence. */
export function canoniqueApp(ctx: ContexteStatique, adresse: string): string {
  const miennes = new Set(adressesIndexees(ctx))
  return miennes.has(adresse) || ctx.site.referenceFrancais === null ? absolue(ctx.site, adresse) : `${ctx.site.referenceFrancais}${adresse}`
}

/**
 * Les versions d'une page que les deux sites indexent (accueil, page de la langue régionale) : le français et x-default sur le site de référence, la langue
 * régionale sur le site régional. Vide pour une autre page, ou s'il n'y a qu'un site.
 */
export function alternativesApp(adresse: string): Alternative[] {
  const sites = Object.values(SITES)
  const reference = sites.find(s => s.referenceFrancais === null)
  const regional = sites.find(s => s.referenceFrancais !== null)
  if (!reference || !regional || !estPropreAuSite(`/${adresse}`, regional.languesRegionales)) return []
  return [{ hreflang: 'fr', href: absolue(reference, adresse) }, { hreflang: hreflang(regional.languesRegionales[0]), href: absolue(regional, adresse) }, { hreflang: 'x-default', href: absolue(reference, adresse) }]
}
