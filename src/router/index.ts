// Routeur : adresses propres (mode `history`, base = `import.meta.env.BASE_URL` : `/` sur les VPS, `/ecole-primaire/` sur
// GitHub Pages). La table est dans routes.ts ; les titres dans titres.ts ; le focus dans focus.ts ; le contexte (classes,
// langue…) dans src/contexte/. Le serveur renvoie toute adresse inconnue vers index.html (deploy/setup-nginx.sh).
// Les anciennes adresses `/#/chemin` sont réécrites en `/chemin` avant le démarrage par le script d'index.html.
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { SITE } from '../sites.ts'
import { extraireParamsContexte, sansContexte } from '../contexte/url.ts'
import { useContexte } from '../contexte/useContexte.ts'
import { journaliser } from '../utils/journal.js'
import { routesDeBase, routesDesExercices } from './routes.ts'
import { VUES } from '../views/exercices.ts'
import { idsParRoute } from '../ressources/recents.ts'
import { enregistrerOuverture } from '../ressources/useRecents.ts'

const routes: RouteRecordRaw[] = routesDeBase(SITE.languesRegionales)

// Pages de développement (liste : src/views/dev/DevView.vue) : ajoutées seulement par `npm run dev`, absentes du build
if (import.meta.env.DEV || import.meta.env.VITE_AVEC_DEV) {   // expression écrite ici (src/dev.ts) : Vite la remplace avant le graphe de modules, la branche et ses pages /dev disparaissent
  routes.push(
    { path: '/dev', component: () => import('../views/dev/DevView.vue'), meta: { titre: 'nav.dev' } },
    { path: '/dev/exemple', component: () => import('../views/dev/ExempleView.vue'), meta: { titre: 'nav.dev' } },
    { path: '/dev/exemple-corpus', component: () => import('../views/dev/ExempleCorpusView.vue'), meta: { titre: 'nav.dev' } },
    { path: '/dev/affiches', component: () => import('../views/dev/AfficheDevView.vue'), meta: { titre: 'nav.dev' } },
    { path: '/dev/composants', component: () => import('../views/dev/ComposantsView.vue'), meta: { titre: 'nav.dev' } },
    { path: '/dev/couverture', component: () => import('../views/dev/CouvertureDevView.vue'), meta: { titre: 'nav.dev' } },
    { path: '/dev/relecture-breton', component: () => import('../views/dev/RelectureBretonDevView.vue'), meta: { titre: 'nav.dev' } },
  )
}

// Une route par exercice du registre. Le registre est un chunk à part, attendu avant le premier affichage : tant qu'il reste
// léger ce n'est rien ; s'il grossit, il faudra un index des routes seul (sans les générateurs).
const { REGISTRE } = await import('../exercices/index.ts')
routes.push(...routesDesExercices(REGISTRE, routes, VUES))

// « Reprendre » (accueil) : l'arrivée sur la page d'un exercice du registre est mémorisée sur l'appareil (src/ressources/recents.ts)
const idsExercices = idsParRoute(REGISTRE)

// Une adresse inconnue (ancienne route, lien externe) : page « introuvable » avec un lien vers l'accueil. Toujours en dernier.
routes.push({ path: '/:chemin(.*)*', component: () => import('../pages/IntrouvableView.vue'), meta: { titre: 'routeur.titre.introuvable' } })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // un changement de contexte ou de filtre (même page) ne ramène pas en haut
  scrollBehavior: (to, from, enregistree) => enregistree ?? (to.path === from.path ? false : { top: 0 }),
})

// Une adresse qui porte son propre contexte (`?classes=cm1`) le garde d'une page à l'autre tant qu'on suit des liens du site :
// les liens internes n'ont pas à le répéter. Un changement sur la même page (replace) est voulu tel quel : on n'y touche pas.
router.beforeEach((to, from) => {
  if (to.path !== from.path && sansContexte(to.query) && !sansContexte(from.query)) {
    return { path: to.path, query: { ...to.query, ...extraireParamsContexte(from.query) }, hash: to.hash }
  }
})

// page vue (sans le détail des réglages) : langue de l'interface, mode de langue et langue régionale, classes filtrées (celles du contexte)
const lu = (cle: string): string | undefined => localStorage.getItem(`ep_${cle}`)?.replace(/"/g, '')
router.afterEach(to => {
  const id = idsExercices.get(to.path)
  if (id) enregistrerOuverture(id)
})

router.afterEach((to, from) => {
  if (to.path === from.path) return
  const contexte = useContexte().contexteDeLAdresse(to)
  journaliser('vue', { r: to.path, m: contexte.mode, l: lu('langue_interface'), g: contexte.regionale ?? undefined, c: contexte.classes.join(',') })
})

export default router
