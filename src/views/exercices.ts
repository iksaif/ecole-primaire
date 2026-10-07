// Les vues des exercices du registre (src/exercices/index.ts), par route, chargées à la demande : une page par exercice, une
// vue mince par exercice (src/views/<matiere>/<Id>View.vue). Un exercice du registre sans entrée ici montre la page « à venir ».
// `npm run nouveau -- exercice …` ajoute la ligne de l'exercice neuf au repère ci-dessous.
import type { VueExercice } from '../router/routes.ts'

export const VUES: Readonly<Record<string, VueExercice>> = {
  '/maths/calcul-mental': () => import('./maths/CalculMentalView.vue'),
  '/maths/monnaie': () => import('./maths/MonnaieView.vue'),
  '/maths/heure': () => import('./maths/HeureView.vue'),
  '/maths/numeration': () => import('./maths/NumerationView.vue'),
  '/maternelle/compter': () => import('./maternelle/CompterView.vue'),
  '/maternelle/comparer': () => import('./maternelle/ComparerView.vue'),
  '/maternelle/ordonner': () => import('./maternelle/OrdonnerView.vue'),
  '/maths/tables': () => import('./maths/TablesView.vue'),
  '/maths/calcul-pose': () => import('./maths/CalcuPoseView.vue'),
  '/maths/suites': () => import('./maths/SuitesView.vue'),
  '/maternelle/longueurs': () => import('./maternelle/LongueursView.vue'),
  '/maths/fractions': () => import('./maths/FractionsView.vue'),
  '/maths/problemes': () => import('./maths/ProblemesView.vue'),
  '/maths/mesures': () => import('./maths/MesuresView.vue'),
  '/maternelle/formes': () => import('./maternelle/FormesView.vue'),
  '/maternelle/motifs': () => import('./maternelle/MotifsView.vue'),
  '/maths/geometrie': () => import('./maths/GeometrieView.vue'),
  '/maternelle/lettres': () => import('./maternelle/LettresView.vue'),
  '/francais/orthographe': () => import('./francais/OrthographeView.vue'),
  // nouveau:vues
}
