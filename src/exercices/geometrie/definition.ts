// La géométrie — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts) :
//   CE1 : reproduire sur quadrillage, se repérer, figures (carré, rectangle, triangle, triangle rectangle, cercle) et solides (c2maths
//         p. 32-34) ; pas de symétrie ni de losange ;
//   CE2 : + losange, angle droit, symétrie (reconnaître un axe, compléter), patron du cube (p. 35-36).
// Un exercice de la liste = un type de question (symétrie, reproduction, repérage, figures, solides, angles droits, propriétés, cercle,
// patrons) ; les niveaux ne diffèrent que par la liste des exercices et la taille des quadrillages (donnees.ts).
// Les valeurs des réglages (`exercices`, `axeHorizontal`…) sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, cases, choix, fichesPourClasses, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'geometrie',
  route: '/maths/geometrie',
  domaine: D.espaceGeometrie,
  emoji: '📐',
  niveauDefaut: 'ce1',
  competences: [K.figuresPlanes, K.solides, K.tracerFigures, K.reperageDeplacements, K.symetrie, K.angleDroit, K.patrons],

  // axeHorizontal : commun (le réglage mémorisé garde sa clé quel que soit le niveau), proposé au CE2 seulement
  reglages: { nbQ: choix([4, 8, 12], { defaut: 8, libre: NB_LIBRE }), axeHorizontal: false as boolean },

  niveaux: {
    ce1: { reglages: { exercices: cases(['reproduction', 'reperage', 'figures', 'solides']) } },
    ce2: {
      reglages: {
        exercices: cases(['symetrie', 'reproduction', 'reperage', 'figures', 'solides', 'angles', 'proprietes', 'cercle', 'patrons']),
        axeHorizontal: choix([false, true]),
      },
    },
  },

  // fiches par compétence (slugs inchangés : exercices-geometrie-<niveau>-<fiche>)
  fiches: [
    ...fichesPourClasses('ce1-ce2', { id: 'reproduction', competence: K.tracerFigures, reglages: { exercices: ['reproduction'] } }),
    ...fichesPourClasses('ce1-ce2', { id: 'reperage', competence: K.reperageDeplacements, reglages: { exercices: ['reperage'] } }),
    ...fichesPourClasses('ce1-ce2', { id: 'solides', competence: K.solides, reglages: { exercices: ['solides'] } }),
    { id: 'figures', competence: K.figuresPlanes, niveau: 'ce1', reglages: { exercices: ['figures'] } },
    { id: 'figures', competence: K.figuresPlanes, niveau: 'ce2', reglages: { exercices: ['figures', 'proprietes', 'cercle'] } },
    { id: 'symetrie', competence: K.symetrie, niveau: 'ce2', reglages: { exercices: ['symetrie'] } },
    { id: 'angles', competence: K.angleDroit, niveau: 'ce2', reglages: { exercices: ['angles'] } },
    { id: 'patrons', competence: K.patrons, niveau: 'ce2', reglages: { exercices: ['patrons'] } },
  ],
})
