// Les formes — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, « formes-maternelle », BO n° 41 p. 68-69) : PS trier sans nommer (disque, carré, triangle) ; MS reconnaître
// ces trois formes ; GS nommer, avec le rectangle (5 ans). Un bouton par niveau : PS, MS, GS.
// Les valeurs de `mode` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
//   « meme » : la même forme que le modèle ; « trouver » : montre le… ; « reconnaitre » : le nom ; « compter » : les côtés.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'formes',
  route: '/maternelle/formes',
  domaine: D.espaceGeometrie,
  emoji: '🔷',
  niveauDefaut: 'ms',
  competences: [K.formesMaternelle],

  niveaux: {
    ps: { reglages: { mode: choix(['meme']) } },
    ms: { reglages: { mode: choix(['meme', 'trouver']) } },
    gs: { reglages: { mode: choix(['reconnaitre', 'trouver', 'compter', 'meme']) } },
  },

  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée ; le mode du jeu ne change pas la
  // fiche (colorier les formes et les compter ; PS : colorier les formes pareilles au modèle). Une seule exception : l'adresse
  // `exercices-formes-ms-gs`, publiée avant les niveaux (la fiche du niveau par défaut, MS), reste servie.
  fiches: [{ id: 'ms-gs', slug: 'exercices-formes-ms-gs', competence: K.formesMaternelle, niveau: 'ms', reglages: {} }],
})
