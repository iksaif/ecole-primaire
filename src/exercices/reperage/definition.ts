// Le repérage — définition : QUI peut faire quoi. Un des exercices de géométrie. Programme (src/data/programme.ts, reperage-deplacements) et
// exemples de réussite du BO (c2maths) : CP, « utiliser et produire une suite d'instructions qui codent un déplacement » ; robot sur un tapis
// quadrillé, instructions « avancer d'une case », « pivoter d'un quart de tour à droite », « pivoter d'un quart de tour à gauche », « au maximum
// dix instructions, dont deux virages » (p. 33) ; CE1, « avancer de », « au maximum quinze instructions, dont quatre virages » ; « coder un
// déplacement qu'un autre élève doit tracer ensuite sur un plan » (p. 35). Pas de repérage dans l'espace au CE2.
//   suivre   lire un programme : où arrive le robot ?
//   coder    écrire le programme qui mène le robot jusqu'à l'étoile
// L'ancien exercice « géométrie » faisait nommer des cases (« B3 ») : hors du programme du cycle 2, retiré. La fiche du CE1 garde son adresse.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'reperage',
  route: '/maths/reperage',
  domaine: D.espaceGeometrie,
  emoji: 'punaise',
  niveauDefaut: 'ce1',
  competences: [K.reperageDeplacements],
  bilanParClasse: false,

  reglages: { nbQ: choix([4, 8, 12], { defaut: 8, libre: NB_LIBRE }) },

  niveaux: {
    cp: { reglages: { exercices: cases(['suivre', 'coder']) } },
    ce1: { reglages: { exercices: cases(['suivre', 'coder']) } },
  },

  fiches: [
    { id: 'deplacements', competence: K.reperageDeplacements, niveau: 'cp', reglages: { exercices: ['suivre', 'coder'] } },
    { id: 'reperage', slug: 'exercices-geometrie-ce1-reperage', competence: K.reperageDeplacements, niveau: 'ce1', reglages: { exercices: ['suivre', 'coder'] } },
  ],
})
