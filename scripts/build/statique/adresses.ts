// Adresses des pages statiques : site de référence d'une fiche (canonical), adresse publique, langue de la page, entrées sœurs
// (même fiche dans une autre langue : `hreflang`). Aucun code de langue en dur : tout vient du registre de langues et des sites.
import { CODES, LANGUE_SOURCE, LANGUES, estLangue } from '../../../src/langues/registre.ts'
import type { Langue } from '../../../src/langues/registre.ts'
import { SITES } from '../../../src/sites.ts'
import type { Site } from '../../../src/sites.ts'
import type { EntreeIndex } from '../../../src/telechargements/types.ts'

/** Adresse publique d'une fiche, sans base : `telechargements/<slug>/` (la barre finale : les adresses déjà indexées). */
export const adresseFiche = (slug: string): string => `telechargements/${slug}/`
export const ADRESSE_INDEX = 'telechargements/'

/**
 * Site de référence d'une fiche : celui dont la langue régionale active figure dans ses langues (le site de cette langue),
 * sinon le premier site sans langue régionale d'office. Les deux sites publient tout ; les moteurs ne voient pas de doublon
 * parce que le canonical pointe toujours le site de référence.
 */
export function siteDeReference(langues: readonly string[]): Site {
  const tous: readonly Site[] = Object.values(SITES)
  return tous.find(s => s.langueRegionale !== '' && langues.includes(s.langueRegionale)) ?? tous.find(s => s.langueRegionale === '') ?? tous[0]
}

/** Adresse absolue (canonical) d'une adresse de page, sur son site de référence. */
export const absolue = (site: Site, adresse: string): string => `${site.url}${adresse}`

/** Langue de la page d'une fiche : sa langue si elle n'en a qu'une, sinon la langue d'interface du site si elle en fait partie. */
export function langueDePage(e: Pick<EntreeIndex, 'langues'>, site: Site): Langue {
  const connues = e.langues.filter(estLangue)
  if (connues.length === 1) return connues[0]
  return connues.includes(site.langueInterface) ? site.langueInterface : (connues[0] ?? site.langueInterface)
}

/** Racine d'un slug : sans le suffixe de langue (`-<code>`, pour les langues autres que la source). */
export function racineDeSlug(slug: string): string {
  for (const code of CODES) if (code !== LANGUE_SOURCE && slug.endsWith(`-${code}`)) return slug.slice(0, -code.length - 1)
  return slug
}

export interface Soeur {
  langue: Langue
  slug: string
  site: Site
}

/** Les entrées de l'index qui sont la même fiche (même racine de slug), dans leur langue de page ; vide s'il n'y en a pas d'autre. */
export function soeursDe(slug: string, index: readonly EntreeIndex[], site: Site): Soeur[] {
  const racine = racineDeSlug(slug)
  const groupe = index.filter(e => racineDeSlug(e.slug) === racine)
  if (groupe.length < 2) return []
  const langues = new Set<Langue>()
  const resultat: Soeur[] = []
  for (const e of groupe) {
    const langue = langueDePage(e, site)
    if (langues.has(langue)) return []   // deux entrées dans la même langue : pas de lien d'équivalence sûr
    langues.add(langue)
    resultat.push({ langue, slug: e.slug, site: siteDeReference(e.langues) })
  }
  return resultat
}

/** Code `hreflang` d'une langue (« fr », « br » : le code de langue seul). */
export const hreflang = (l: Langue): string => LANGUES[l].bcp47.split('-')[0]


/** Une version d'une fiche dans une autre langue : `hreflang` (« x-default » : la langue source) et adresse absolue. */
export interface Alternative {
  hreflang: string
  href: string
}

/** Les alternatives de langue d'une fiche (elle-même comprise), vide si elle n'a pas de sœur. */
export function alternativesDe(slug: string, index: readonly EntreeIndex[], site: Site): Alternative[] {
  const soeurs = soeursDe(slug, index, site)
  const liens = soeurs.map(s => ({ hreflang: hreflang(s.langue), href: absolue(s.site, adresseFiche(s.slug)) }))
  const source = soeurs.find(s => s.langue === LANGUE_SOURCE)
  return source ? [...liens, { hreflang: 'x-default', href: absolue(source.site, adresseFiche(source.slug)) }] : liens
}
