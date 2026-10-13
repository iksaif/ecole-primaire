// Les solides — définition : QUI peut faire quoi. Un des exercices de géométrie (moteur commun : src/moteurs/geometrie/). Programme
// (src/data/programme.ts, c2maths p. 31-35) : CP, reconnaître cube, boule, cône, cylindre, pavé, nommer cube, pavé, boule, les faces du cube et
// du pavé ; CE1, + pyramide, faces, sommets et arêtes du cube, du pavé et de la pyramide ; CE2, + patron du cube. Les fiches gardent les adresses de l'ancien exercice « géométrie ».
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'solides',
  route: '/maths/solides',
  domaine: D.espaceGeometrie,
  emoji: 'glacon',
  niveauDefaut: 'ce1',
  competences: [K.solides, K.patrons],
  bilanParClasse: false,

  reglages: { nbQ: choix([4, 8, 12], { defaut: 8, libre: NB_LIBRE }) },

  niveaux: {
    cp: { reglages: { exercices: cases(['solides']) } },
    ce1: { reglages: { exercices: cases(['solides']) } },
    ce2: { reglages: { exercices: cases(['solides', 'patrons']) } },
  },

  fiches: [
    { id: 'solides', competence: K.solides, niveau: 'cp', reglages: { exercices: ['solides'] } },
    { id: 'solides', slug: 'exercices-geometrie-ce1-solides', competence: K.solides, niveau: 'ce1', reglages: { exercices: ['solides'] } },
    { id: 'solides', slug: 'exercices-geometrie-ce2-solides', competence: K.solides, niveau: 'ce2', reglages: { exercices: ['solides'] } },
    { id: 'patrons', slug: 'exercices-geometrie-ce2-patrons', competence: K.patrons, niveau: 'ce2', reglages: { exercices: ['patrons'] } },
  ],
})
