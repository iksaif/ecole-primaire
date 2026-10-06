// Indexation des pages de l'app : adresse canonique par route (absolue, sans requête) et `noindex` pour les pages qui ne
// s'indexent pas (réglages, développement, page introuvable). Posés par le routeur à chaque navigation (titres.ts).
// Les pages de fiches ont aussi une page statique à la même adresse (scripts/statique/) : mêmes adresses (barre finale sous
// /telechargements), même règle d'indexation (`estIndexable`, partagée avec le sitemap).
import type { RouteLocationNormalizedLoaded, RouteMeta } from 'vue-router'

/** Préfixes d'adresses que les moteurs ne doivent pas indexer. */
const NON_INDEXABLES = ['/parametres', '/dev']

/** Cette adresse (chemin de l'app, avec « / » initial) s'indexe-t-elle ? */
export const estIndexable = (chemin: string): boolean => !NON_INDEXABLES.some(p => chemin === p || chemin.startsWith(`${p}/`))

/** Les pages sous /telechargements ont une barre finale (les adresses déjà indexées) ; les autres n'en ont pas, sauf l'accueil. */
export function cheminCanonique(chemin: string): string {
  if (chemin === '/telechargements' || chemin.startsWith('/telechargements/')) return `${chemin.replace(/\/+$/, '')}/`
  return chemin === '/' ? chemin : chemin.replace(/\/+$/, '')
}

/** Adresse canonique absolue d'un chemin, sur le site `urlSite` (avec barre finale), ou null si la page ne s'indexe pas. */
export function adresseCanonique(chemin: string, meta: RouteMeta, urlSite: string): string | null {
  if (!estIndexable(chemin) || meta.titre === 'routeur.titre.introuvable') return null
  return `${urlSite}${cheminCanonique(chemin).slice(1)}`
}

/** Pose `<link rel="canonical">` et `<meta name="robots">` d'après la route. */
export function poserIndexation(route: RouteLocationNormalizedLoaded, urlSite: string, doc: Document = document): void {
  const adresse = adresseCanonique(route.path, route.meta, urlSite)
  let lien = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (adresse) {
    if (!lien) {
      lien = doc.createElement('link')
      lien.rel = 'canonical'
      doc.head.append(lien)
    }
    lien.href = adresse
  } else lien?.remove()
  let robots = doc.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (adresse) robots?.remove()
  else {
    if (!robots) {
      robots = doc.createElement('meta')
      robots.name = 'robots'
      doc.head.append(robots)
    }
    robots.content = 'noindex'
  }
}
