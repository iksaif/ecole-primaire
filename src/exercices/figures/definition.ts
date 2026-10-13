// Les figures planes — définition : QUI peut faire quoi. Un des exercices de géométrie (moteur commun : src/moteurs/geometrie/), un par partie
// du programme. Programme (src/data/programme.ts, c2maths p. 32, 34, 36) : CP, disque, carré, rectangle, triangle (nommer, côtés, sommets) ;
// CE1, + cercle, triangle rectangle, angle droit et propriétés du carré et du rectangle (« connaitre les propriétés des angles et des égalités de
// longueur pour les carrés et les rectangles »), angles aigus et obtus, « ce n'est pas un rectangle car… » ; CE2, + losange, cercle (centre,
// rayon, diamètre). Les valeurs de `exercices` sont des types de questions du
// moteur. Les fiches gardent les adresses de l'ancien exercice « géométrie » (exercices-geometrie-<niveau>-<fiche>).
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'figures',
  route: '/maths/figures',
  domaine: D.espaceGeometrie,
  emoji: 'losange',
  niveauDefaut: 'ce1',
  competences: [K.figuresPlanes, K.angleDroit],
  bilanParClasse: false,

  reglages: { nbQ: choix([4, 8, 12], { defaut: 8, libre: NB_LIBRE }) },

  niveaux: {
    cp: { reglages: { exercices: cases(['figures']) } },
    ce1: { reglages: { exercices: cases(['figures', 'angles', 'aigus', 'justifier', 'proprietes']) } },
    ce2: { reglages: { exercices: cases(['figures', 'angles', 'aigus', 'justifier', 'proprietes', 'cercle']) } },
  },

  fiches: [
    { id: 'figures', competence: K.figuresPlanes, niveau: 'cp', reglages: { exercices: ['figures'] } },
    { id: 'figures', slug: 'exercices-geometrie-ce1-figures', competence: K.figuresPlanes, niveau: 'ce1', reglages: { exercices: ['figures'] } },
    { id: 'figures', slug: 'exercices-geometrie-ce2-figures', competence: K.figuresPlanes, niveau: 'ce2', reglages: { exercices: ['figures', 'proprietes', 'cercle'] } },
    { id: 'proprietes', competence: K.figuresPlanes, niveau: 'ce1', reglages: { exercices: ['justifier', 'proprietes'] } },
    { id: 'angles', competence: K.angleDroit, niveau: 'ce1', reglages: { exercices: ['angles', 'aigus'] } },
    { id: 'justifier', competence: K.figuresPlanes, niveau: 'ce2', reglages: { exercices: ['justifier', 'proprietes'] } },
    { id: 'angles', slug: 'exercices-geometrie-ce2-angles', competence: K.angleDroit, niveau: 'ce2', reglages: { exercices: ['angles', 'aigus'] } },
  ],
})
