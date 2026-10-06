// Les vues des exercices du registre (src/exercices/index.ts), par route, chargées à la demande : une page par exercice, une
// vue mince par exercice (src/views/<matiere>/<Id>View.vue). Un exercice du registre sans entrée ici montre la page « à venir ».
// `npm run nouveau -- exercice …` ajoute la ligne de l'exercice neuf au repère ci-dessous.
import type { VueExercice } from '../router/routes.ts'

export const VUES: Readonly<Record<string, VueExercice>> = {
  '/maths/calcul-mental': () => import('./maths/CalculMentalView.vue'),
  // nouveau:vues
}
