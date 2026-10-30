// Indexation des pages de l'app : adresse canonique par route (absolue, sans requête) et `noindex` pour les pages qui ne
// s'indexent pas (réglages, développement, page introuvable). Posés par le routeur à chaque navigation (titres.ts).
// Les pages de fiches ont aussi une page statique à la même adresse (scripts/build/statique/) : mêmes adresses (barre finale sous
// /telechargements), même règle d'indexation (`estIndexable`, partagée avec le sitemap).
import type { RouteLocationNormalizedLoaded, RouteMeta } from 'vue-router'
import type { Langue } from '../langues/registre.ts'
import { cheminRegional } from './chemins.ts'

/** Préfixes d'adresses que les moteurs ne doivent pas indexer. */
const NON_INDEXABLES = ['/parametres', '/dev']

/** Les pages de lecture d'un texte officiel (/programme/officiel/<texte>/<page>) : le texte du PDF, déjà publié par le ministère ; seule la page qui les liste s'indexe. */
const LECTURE_TEXTE_OFFICIEL = /^\/programme\/officiel\/[^/]+/

/** Cette adresse (chemin de l'app, avec « / » initial) s'indexe-t-elle ? */
export const estIndexable = (chemin: string): boolean =>
  !NON_INDEXABLES.some(p => chemin === p || chemin.startsWith(`${p}/`)) && !LECTURE_TEXTE_OFFICIEL.test(chemin)

/** Les pages sous /telechargements ont une barre finale (les adresses déjà indexées) ; les autres n'en ont pas, sauf l'accueil. */
export function cheminCanonique(chemin: string): string {
  if (chemin === '/telechargements' || chemin.startsWith('/telechargements/')) return `${chemin.replace(/\/+$/, '')}/`
  return chemin === '/' ? chemin : chemin.replace(/\/+$/, '')
}

/**
 * Cette page est-elle propre à un site régional : son accueil et la page de la langue régionale (et ses sous-pages) ? Les autres pages de l'app (matières,
 * exercices, compétences…) sont les mêmes sur tous les sites : un site régional les déclare chez le site de référence (`referenceFrancais`, sites.ts). Les pages
 * de compétence qui ont du contenu régional sûr sont propres aussi : elles dépendent du catalogue, donc se décident au build (scripts/build/statique/indexation.ts).
 */
export function estPropreAuSite(chemin: string, regionales: readonly Langue[]): boolean {
  const sansBarre = chemin === '/' ? chemin : chemin.replace(/\/+$/, '')
  return sansBarre === '/' || regionales.some(l => sansBarre === cheminRegional(l) || sansBarre.startsWith(`${cheminRegional(l)}/`))
}

/** Les adresses des pages propres à un site régional et celles du site de référence : ce qu'il faut pour choisir le canonical d'une page de l'app. */
export interface ReferenceFrancais { url: string | null, regionales: readonly Langue[] }

/**
 * Adresse canonique absolue d'un chemin, sur le site `urlSite` (avec barre finale), ou null si la page ne s'indexe pas. Sur un site régional (`reference.url`), une
 * page qui n'est pas propre au site a pour canonical la même page du site de référence.
 */
export function adresseCanonique(chemin: string, meta: RouteMeta, urlSite: string, reference: ReferenceFrancais = { url: null, regionales: [] }): string | null {
  if (!estIndexable(chemin) || meta.titre === 'routeur.titre.introuvable') return null
  const ailleurs = reference.url !== null && !estPropreAuSite(chemin, reference.regionales)
  return `${ailleurs ? reference.url : urlSite}${cheminCanonique(chemin).slice(1)}`
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
export function poserIndexation(route: RouteLocationNormalizedLoaded, urlSite: string, doc: Document = document, reference?: ReferenceFrancais): void {
  const adresse = adresseCanonique(route.path, route.meta, urlSite, reference)
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
