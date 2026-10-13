// La symétrie — définition : QUI peut faire quoi. Un des exercices de géométrie (moteur commun : src/moteurs/geometrie/). Programme
// (src/data/programme.ts, c2maths p. 36) : CE2, compléter une figure sur quadrillage pour la rendre symétrique, axe vertical ou horizontal.
// `axeHorizontal` garde la clé du réglage mémorisé de l'ancien exercice « géométrie ».
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'symetrie',
  route: '/maths/symetrie',
  domaine: D.espaceGeometrie,
  emoji: 'papillon',
  niveauDefaut: 'ce2',
  competences: [K.symetrie],
  bilanParClasse: false,

  reglages: { nbQ: choix([4, 8, 12], { defaut: 8, libre: NB_LIBRE }), axeHorizontal: false as boolean },

  niveaux: {
    ce2: { reglages: { exercices: cases(['symetrie']), axeHorizontal: choix([false, true]) } },
  },

  fiches: [
    { id: 'symetrie', slug: 'exercices-geometrie-ce2-symetrie', competence: K.symetrie, niveau: 'ce2', reglages: { exercices: ['symetrie'] } },
  ],
})
