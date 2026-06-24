import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',                  component: () => import('../views/HomeView.vue') },
  { path: '/maths',             component: () => import('../views/MathsView.vue') },
  { path: '/maths/calcul-mental', component: () => import('../views/maths/CalcuMentalView.vue') },
  { path: '/maths/calcul-pose',   component: () => import('../views/maths/CalcuPoseView.vue') },
  { path: '/maths/tables',        component: () => import('../views/maths/TablesView.vue') },
  { path: '/maternelle',               component: () => import('../views/maternelle/MaternelleView.vue') },
  { path: '/maternelle/compter',       component: () => import('../views/maternelle/CompterView.vue') },
  { path: '/maternelle/comparer',      component: () => import('../views/maternelle/ComparerView.vue') },
  { path: '/maternelle/ordonner',      component: () => import('../views/maternelle/OrdonnerView.vue') },
  { path: '/maternelle/lettres',       component: () => import('../views/maternelle/LettresView.vue') },
  { path: '/maternelle/formes',        component: () => import('../views/maternelle/FormesView.vue') },
  { path: '/francais',            component: () => import('../views/FrancaisView.vue') },
  { path: '/francais/dictee',     component: () => import('../views/francais/DicteeView.vue') },
  { path: '/francais/conjugaison', component: () => import('../views/francais/ConjugaisonView.vue') },
  { path: '/francais/orthographe', component: () => import('../views/francais/OrthographeView.vue') },
  { path: '/lecture',             component: () => import('../views/LectureView.vue') },
  { path: '/autres',              component: () => import('../views/AutresView.vue') },
  { path: '/about',               component: () => import('../views/AboutView.vue') },
  { path: '/parametres',          component: () => import('../views/ParentSettingsView.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
