// Table des routes de l'application (adresses propres, mode `history`) : chaque route porte `meta.titre`, la clé de texte de
// son titre de document (src/router/titres.ts). Les pages que d'autres paquets écriront sont des composants provisoires
// (AVenirView) derrière un import dynamique : le paquet qui possède la page remplace seulement l'import ici.
// Pur côté données (aucun import de Vue à l'exécution) : lisible par node, les tests le parcourent.
import type { RouteComponent, RouteRecordRaw } from 'vue-router'
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
const matiere = () => import('../pages/Matiere.vue')
const fiches = () => import('../pages/FichesPretesView.vue')
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** Les routes de l'application, hors pages de développement, exercices et page introuvable. `regionales` : langues régionales du site. */
export function routesDeBase(regionales: readonly Langue[]): RouteRecordRaw[] {
  return [
    { path: '/', component: () => import('../pages/Accueil.vue'), meta: { titre: 'routeur.titre.accueil' } },
    { path: '/maths', component: matiere, meta: { titre: 'routeur.titre.maths' } },
    { path: '/francais', component: matiere, meta: { titre: 'routeur.titre.francais' } },
    { path: '/monde', component: matiere, meta: { titre: 'routeur.titre.monde' } },
    ...regionales.map((l): RouteRecordRaw => ({
      path: cheminRegional(l), component: matiere, meta: { titreLibre: majuscule(LANGUES[l].nomLocal) },
    })),
    // ancienne adresse de la page de la langue régionale
    { path: '/langue-regionale', redirect: to => ({ path: regionales[0] ? cheminRegional(regionales[0]) : '/', query: to.query, hash: to.hash }) },
    { path: '/maths/fiches', component: fiches, props: { matiere: 'maths' }, meta: { titre: 'routeur.titre.fichesMaths' } },
    { path: '/francais/fiches', component: fiches, props: { matiere: 'francais' }, meta: { titre: 'routeur.titre.fichesFrancais' } },
    { path: '/monde/fiches', component: fiches, props: { matiere: 'monde' }, meta: { titre: 'routeur.titre.fichesMonde' } },
    // fiches PDF toutes prêtes : lues dans fiches/index.json et fiches/<slug>.json (src/telechargements/README.md)
    { path: '/telechargements', component: () => import('../pages/FichesPretesIndexView.vue'), meta: { titre: 'fichesPretes.titreIndex' } },
    { path: '/telechargements/:slug', component: () => import('../pages/FeuilleView.vue'), meta: { titre: 'routeur.titre.fiche' } },
    { path: '/programme', component: () => import('../pages/ProgrammeView.vue'), meta: { titre: 'routeur.titre.programme' } },
    { path: '/competence/:id', component: () => import('../pages/CompetenceView.vue'), meta: { titre: 'routeur.titre.competence' } },
    { path: '/parametres', component: () => import('../pages/ReglagesView.vue'), meta: { titre: 'nav.reglages' } },
    { path: '/about', component: () => import('../pages/AProposView.vue'), meta: { titre: 'nav.apropos' } },
    { path: '/nouveautes', component: () => import('../pages/NouveautesView.vue'), meta: { titre: 'nav.nouveautes' } },
    // les affiches au format « définition » (src/affiches/) : une page, le formulaire générique (?affiche=<id>&variante=<v>)
    { path: '/imprimer/affiches', component: () => import('../pages/AfficheView.vue'), meta: { titre: 'routeur.titre.affiche' } },
    // ancienne adresse de l'affiche de l'alphabet (liens externes, favoris)
    { path: '/imprimer/alphabet', redirect: to => ({ path: '/imprimer/affiches', query: { affiche: 'alphabet' }, hash: to.hash }) },
    // nouveau:routes
  ]
}

/** Entrée du registre d'exercices, pour ce dont le routeur a besoin. */
export interface EntreeExercice {
  readonly definition: { readonly route: string }
  readonly exemple?: true
}

/** La vue d'un exercice, chargée à la demande (`() => import('…View.vue')`) : src/views/exercices.ts, par route. */
export type VueExercice = () => Promise<unknown>

/**
 * Une route par exercice du registre (sa `definition.route`, ex. « /maths/heure »). Les exemples n'en ont pas : leurs pages sont
 * les routes /dev. Deux exercices sur une même adresse, ou sur celle d'une autre page, sont une erreur de déclaration.
 * `vues` : la vue de chaque exercice, par route ; un exercice sans vue montre la page provisoire « à venir ».
 */
export function routesDesExercices(entrees: readonly EntreeExercice[], existantes: readonly RouteRecordRaw[], vues: Readonly<Record<string, VueExercice>> = {}): RouteRecordRaw[] {
  const prises = new Set(existantes.map(r => r.path))
  const routes: RouteRecordRaw[] = []
  for (const { definition, exemple } of entrees) {
    if (exemple) continue
    if (prises.has(definition.route)) throw new Error(`route d’exercice « ${definition.route} » déjà prise`)
    prises.add(definition.route)
    routes.push({ path: definition.route, component: (vues[definition.route] ?? aVenir) as RouteComponent, meta: { titre: 'routeur.titre.exercice' } })
  }
  return routes
}
