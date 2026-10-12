// Les brevets de ceintures — activité de FICHES : le brevet papier d'une ceinture d'une piste (les tables de multiplication pour commencer) : des questions
// tirées au hasard (graine du lien, « Nouvelle fiche »), le seuil de réussite et le cadre du résultat, avec corrigé (plans/15-ceintures.md §4).
// Les ceintures (couleurs, dessin, seuil, nombre de questions) viennent des réglages communs (src/ceintures/reglages.ts : page des réglages et « Sur la fiche »).
// Programme : les tables de multiplication (CE1 à CM2). D'autres pistes (calcul mental, lettres) viendront avec leurs compétences.
import { definir, choix, pourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import { PISTES_AVEC_BREVET } from '../../ceintures/brevets.ts'

export default definir({
  id: 'ceintures-brevet',
  route: '/maths/ceintures-brevet',
  domaine: D.nombresCalcul,
  emoji: 'trophee',
  jeu: false,
  bilanParClasse: false,
  niveauDefaut: 'ce2',
  competences: [K.tablesMultiplication],
  reglages: {
    piste: choix(PISTES_AVEC_BREVET),
    ceinture: choix([1, 2, 3, 4, 5, 6, 7, 8], { defaut: 1 }),
    prenom: '' as string,
  },
  niveaux: {
    ce1: {},
    ...pourClasses('ce2-cm2', {}),
  },
  fiches: [],
})
