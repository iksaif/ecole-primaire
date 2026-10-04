import { createRouter, createWebHashHistory } from 'vue-router'
import { journaliser } from '../utils/journal'

const routes = [
  { path: '/',                  component: () => import('../views/HomeView.vue') },
  { path: '/maths',             component: () => import('../views/MathsView.vue') },
  { path: '/maths/calcul-mental', component: () => import('../views/maths/CalcuMentalView.vue') },
  { path: '/maths/calcul-pose',   component: () => import('../views/maths/CalcuPoseView.vue') },
  { path: '/maths/tables',        component: () => import('../views/maths/TablesView.vue') },
  { path: '/maths/numeration', component: () => import('../views/maths/NumerationView.vue') },
  { path: '/maths/problemes', component: () => import('../views/maths/ProblemesView.vue') },
  { path: '/maths/fractions', component: () => import('../views/maths/FractionsView.vue') },
  { path: '/maths/heure', component: () => import('../views/maths/HeureView.vue') },
  { path: '/maths/monnaie', component: () => import('../views/maths/MonnaieView.vue') },
  { path: '/maths/mesures', component: () => import('../views/maths/MesuresView.vue') },
  { path: '/maths/geometrie', component: () => import('../views/maths/GeometrieView.vue') },
  { path: '/maternelle',               component: () => import('../views/maternelle/MaternelleView.vue') },
  { path: '/maternelle/compter',       component: () => import('../views/maternelle/CompterView.vue') },
  { path: '/maternelle/comparer',      component: () => import('../views/maternelle/ComparerView.vue') },
  { path: '/maternelle/ordonner',      component: () => import('../views/maternelle/OrdonnerView.vue') },
  { path: '/maternelle/lettres',       component: () => import('../views/maternelle/LettresView.vue') },
  { path: '/maternelle/formes',        component: () => import('../views/maternelle/FormesView.vue') },
  { path: '/maternelle/longueurs',   component: () => import('../views/maternelle/LongueursView.vue') },
  { path: '/maternelle/motifs',      component: () => import('../views/maternelle/MotifsView.vue') },
  { path: '/francais',            component: () => import('../views/FrancaisView.vue') },
  { path: '/francais/dictee',     component: () => import('../views/francais/DicteeView.vue') },
  { path: '/francais/conjugaison', component: () => import('../views/francais/ConjugaisonView.vue') },
  { path: '/francais/orthographe', component: () => import('../views/francais/OrthographeView.vue') },
  { path: '/francais/grammaire', component: () => import('../views/francais/GrammaireView.vue') },
  { path: '/francais/vocabulaire', component: () => import('../views/francais/VocabulaireView.vue') },
  { path: '/lecture',             component: () => import('../views/LectureView.vue') },
  { path: '/autres',              component: () => import('../views/AutresView.vue') },
  { path: '/imprimer',            component: () => import('../views/imprimer/ImprimerView.vue') },
  { path: '/imprimer/ecriture',   component: () => import('../views/imprimer/EcritureView.vue') },
  { path: '/imprimer/alphabet',   component: () => import('../views/imprimer/AlphabetView.vue') },
  { path: '/imprimer/calcul',     component: () => import('../views/imprimer/CalculView.vue') },
  { path: '/imprimer/nombres',    component: () => import('../views/imprimer/NombresView.vue') },
  { path: '/imprimer/affiches',   component: () => import('../views/imprimer/AffichesView.vue') },
  { path: '/about',               component: () => import('../views/AboutView.vue') },
  { path: '/programme',           component: () => import('../views/ProgrammeView.vue') },
  { path: '/nouveautes',          component: () => import('../views/NouveautesView.vue') },
  { path: '/mentions-legales',    component: () => import('../views/MentionsLegalesView.vue') },
  { path: '/parametres',          component: () => import('../views/ParentSettingsView.vue') },
]

// L'app ne vit qu'à la racine du site : chargée ailleurs (ex. /telechargements/#/imprimer, quand la page
// statique n'existe pas encore en dev), on la renvoie à la racine en gardant la route
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
router.afterEach(to => {
  journaliser('vue', {
    r: to.path, m: to.query.mode,
    l: localStorage.getItem('ep_langue_interface')?.replace(/"/g, ''),
    g: localStorage.getItem('ep_langue_regionale')?.replace(/"/g, ''),
    c: localStorage.getItem('ep_classe')?.replace(/"/g, ''),
  })
})

export default router
