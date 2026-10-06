// Indexation des pages de l'app : adresse canonique par route (absolue, sans requête) et `noindex` pour les pages qui ne
// s'indexent pas (réglages, développement, page introuvable). Posés par le routeur à chaque navigation (titres.ts).
// Les pages de fiches ont aussi une page statique à la même adresse (scripts/build/statique/) : mêmes adresses (barre finale sous
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

/** Retire le canonical et pose `noindex` : la page (feuille ou compétence inconnue) ne doit pas s'indexer. */
export function poserNonIndexable(doc: Document = document): void {
  doc.head.querySelector('link[rel="canonical"]')?.remove()
  let robots = doc.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (!robots) {
    robots = doc.createElement('meta')
    robots.name = 'robots'
    doc.head.append(robots)
  }
  robots.content = 'noindex'
}

/** Pose `<link rel="canonical">` et `<meta name="robots">` d'après la route. */
export function poserIndexation(route: RouteLocationNormalizedLoaded, urlSite: string, doc: Document = document): void {
  const adresse = adresseCanonique(route.path, route.meta, urlSite)
  if (!adresse) return poserNonIndexable(doc)
  let lien = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!lien) {
    lien = doc.createElement('link')
    lien.rel = 'canonical'
    doc.head.append(lien)
  }
  lien.href = adresse
  doc.head.querySelector('meta[name="robots"]')?.remove()
}
