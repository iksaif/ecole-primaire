// Routes de l'ancien monde (exercices, affiches, impressions, programme), DÉCONNECTÉES du routeur (plan 11) : cette table
// ne sert plus qu'à retrouver ce qu'il reste à reporter. Aucun fichier ne l'importe. Elle disparaît avec le dernier report.
export const routes = [
  { path: '/',                  component: () => import('../views/HomeView.vue') },
  { path: '/maths',             component: () => import('../views/MathsView.vue') },
  { path: '/maternelle',               component: () => import('../views/maternelle/MaternelleView.vue') },
  { path: '/francais',            component: () => import('../views/FrancaisView.vue') },
  { path: '/francais/dictee',     component: () => import('../views/francais/DicteeView.vue') },
  { path: '/francais/conjugaison', component: () => import('../views/francais/ConjugaisonView.vue') },
  { path: '/francais/grammaire', component: () => import('../views/francais/GrammaireView.vue') },
  { path: '/lecture',             component: () => import('../views/LectureView.vue') },
  { path: '/langue-regionale',    component: () => import('../views/LangueRegionaleView.vue') },
  { path: '/autres',              component: () => import('../views/AutresView.vue') },
  { path: '/imprimer',            component: () => import('../views/imprimer/ImprimerView.vue') },
  { path: '/imprimer/ecriture',   component: () => import('../views/imprimer/EcritureView.vue') },
  { path: '/imprimer/affiches',   component: () => import('../views/imprimer/AffichesView.vue') },
  { path: '/about',               component: () => import('../views/AboutView.vue') },
  { path: '/programme',           component: () => import('../views/ProgrammeView.vue') },
  { path: '/nouveautes',          component: () => import('../views/NouveautesView.vue') },
  { path: '/mentions-legales',    component: () => import('../views/MentionsLegalesView.vue') },
  { path: '/parametres',          component: () => import('../views/ParentSettingsView.vue') },
]
