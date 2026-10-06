// Table des routes de l'application (adresses propres, mode `history`) : chaque route porte `meta.titre`, la clé de texte de
// son titre de document (src/router/titres.ts). Les pages que d'autres paquets écriront sont des composants provisoires
// (AVenirView) derrière un import dynamique : le paquet qui possède la page remplace seulement l'import ici.
// Pur côté données (aucun import de Vue à l'exécution) : lisible par node, les tests le parcourent.
import type { RouteRecordRaw } from 'vue-router'
import type { Langue } from '../langues/registre.ts'
import { LANGUES } from '../langues/registre.ts'
import type { CleTexte } from '../langues/traduire.ts'
import { cheminRegional } from './chemins.ts'

declare module 'vue-router' {
  interface RouteMeta {
    /** clé de texte du titre de document (sans le nom du site) */
    titre?: CleTexte
    /** titre qui n'est pas dans le catalogue (le nom d'une langue régionale, dans elle-même) */
    titreLibre?: string
  }
}

const aVenir = () => import('../pages/AVenirView.vue')
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** Les routes de l'application, hors pages de développement, exercices et page introuvable. `regionales` : langues régionales du site. */
export function routesDeBase(regionales: readonly Langue[]): RouteRecordRaw[] {
  return [
    { path: '/', component: () => import('../pages/AccueilView.vue'), meta: { titre: 'routeur.titre.accueil' } },
    { path: '/maths', component: aVenir, meta: { titre: 'routeur.titre.maths' } },
    { path: '/francais', component: aVenir, meta: { titre: 'routeur.titre.francais' } },
    { path: '/monde', component: aVenir, meta: { titre: 'routeur.titre.monde' } },
    ...regionales.map((l): RouteRecordRaw => ({
      path: cheminRegional(l), component: () => import('../pages/LangueRegionaleView.vue'), meta: { titreLibre: majuscule(LANGUES[l].nomLocal) },
    })),
    // ancienne adresse de la page de la langue régionale
    { path: '/langue-regionale', redirect: to => ({ path: regionales[0] ? cheminRegional(regionales[0]) : '/', query: to.query, hash: to.hash }) },
    { path: '/maths/fiches', component: aVenir, meta: { titre: 'routeur.titre.fichesMaths' } },
    { path: '/francais/fiches', component: aVenir, meta: { titre: 'routeur.titre.fichesFrancais' } },
    { path: '/monde/fiches', component: aVenir, meta: { titre: 'routeur.titre.fichesMonde' } },
    // fiches PDF toutes prêtes : lues dans fiches/index.json et fiches/<slug>.json (src/telechargements/README.md)
    { path: '/telechargements', component: () => import('../views/Telechargements.vue'), meta: { titre: 'nav.telechargements' } },
    { path: '/telechargements/:slug', component: () => import('../views/TelechargementsFiche.vue'), meta: { titre: 'routeur.titre.fiche' } },
    { path: '/programme', component: aVenir, meta: { titre: 'routeur.titre.programme' } },
    { path: '/competence/:id', component: aVenir, meta: { titre: 'routeur.titre.competence' } },
    { path: '/parametres', component: () => import('../pages/ReglagesView.vue'), meta: { titre: 'nav.reglages' } },
    { path: '/about', component: () => import('../pages/AProposView.vue'), meta: { titre: 'nav.apropos' } },
    { path: '/nouveautes', component: () => import('../pages/NouveautesView.vue'), meta: { titre: 'nav.nouveautes' } },
    // nouveau:routes
  ]
}

/** Entrée du registre d'exercices, pour ce dont le routeur a besoin. */
export interface EntreeExercice {
  readonly definition: { readonly route: string }
  readonly exemple?: true
}

/**
 * Une route par exercice du registre (sa `definition.route`, ex. « /maths/heure »). Les exemples n'en ont pas : leurs pages sont
 * les routes /dev. Deux exercices sur une même adresse, ou sur celle d'une autre page, sont une erreur de déclaration.
 */
export function routesDesExercices(entrees: readonly EntreeExercice[], existantes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
  const prises = new Set(existantes.map(r => r.path))
  const routes: RouteRecordRaw[] = []
  for (const { definition, exemple } of entrees) {
    if (exemple) continue
    if (prises.has(definition.route)) throw new Error(`route d’exercice « ${definition.route} » déjà prise`)
    prises.add(definition.route)
    routes.push({ path: definition.route, component: aVenir, meta: { titre: 'routeur.titre.exercice' } })
  }
  return routes
}
