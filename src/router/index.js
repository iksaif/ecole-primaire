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
  { path: '/francais',            component: () => import('../views/FrancaisView.vue') },
  { path: '/francais/dictee',     component: () => import('../views/francais/DicteeView.vue') },
  { path: '/francais/conjugaison', component: () => import('../views/ComingSoonView.vue') },
  { path: '/francais/orthographe', component: () => import('../views/ComingSoonView.vue') },
  { path: '/lecture',             component: () => import('../views/ComingSoonView.vue') },
  { path: '/autres',              component: () => import('../views/ComingSoonView.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
