// Routeur de la base : les pages qui existent vraiment. Les exercices, affiches et impressions de l'ancien monde sont
// déconnectés (leur ancienne table : ancien-routes.js) et reviennent un par un avec leurs reports.
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { journaliser } from '../utils/journal.js'

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('../pages/AccueilView.vue') },
  { path: '/langue-regionale', component: () => import('../pages/LangueRegionaleView.vue') },
  { path: '/parametres', component: () => import('../pages/ReglagesView.vue') },
  { path: '/about', component: () => import('../pages/AProposView.vue') },
  { path: '/nouveautes', component: () => import('../pages/NouveautesView.vue') },
  // fiches PDF toutes prêtes : lues dans fiches/index.json et fiches/<slug>.json (src/telechargements/README.md)
  { path: '/telechargements', component: () => import('../views/Telechargements.vue') },
  { path: '/telechargements/:slug', component: () => import('../views/TelechargementsFiche.vue') },
]

// Pages de développement (liste : src/views/dev/DevView.vue) : ajoutées seulement par `npm run dev`, absentes du build
if (import.meta.env.DEV) {
  routes.push(
    { path: '/dev', component: () => import('../views/dev/DevView.vue') },
    { path: '/dev/exemple', component: () => import('../views/dev/ExempleView.vue') },
    { path: '/dev/affiches', component: () => import('../views/dev/AfficheDevView.vue') },
  )
}

// Une adresse inconnue (ancienne route d'un exercice, lien externe) ramène à l'accueil
routes.push({ path: '/:chemin(.*)*', redirect: '/' })

// L'app ne vit qu'à la racine du site : chargée ailleurs, on la renvoie à la racine en gardant la route
const BASE = import.meta.env.BASE_URL
if (typeof location !== 'undefined' && location.pathname !== BASE && location.pathname !== `${BASE}index.html`) {
  location.replace(`${BASE}${location.search}${location.hash}`)
}

const router = createRouter({
  // base explicite : les liens restent /…/#/route quelle que soit l'adresse de chargement
  history: createWebHashHistory(BASE),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// page vue (sans le détail des réglages) : langue de l'interface, langue régionale, classe filtrée
const lu = (cle: string): string | undefined => localStorage.getItem(`ep_${cle}`)?.replace(/"/g, '')
router.afterEach(to => {
  journaliser('vue', { r: to.path, m: to.query.mode, l: lu('langue_interface'), g: lu('langue_regionale'), c: lu('classe') })
})

export default router
