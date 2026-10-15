// Trier les images — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts) : ranger des images par catégorie (PS-GS), reconnaître des matériaux (PS-GS), comment un animal se
// déplace et ce dont il a besoin, ici ce qu'il mange (MS-GS). Chaque thème travaille une compétence (corpus.ts). Pas de lecture ni
// d'écriture : l'enfant touche la bonne boîte, la consigne est dite. PS : deux boîtes et deux thèmes seulement (BO n° 19 : manipuler d'abord).
// Les valeurs du réglage `themes` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, choix, cases, herite, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'trier',
  route: '/maternelle/trier',
  domaine: D.vivant,
  autresDomaines: [D.oral, D.objetsTechniques],
  emoji: 'puzzle',
  niveauDefaut: 'ms',
  competences: [K.categoriesMots, K.materiauxObjets, K.deplacementsAnimaux, K.besoinsVivants],

  reglages: { nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: {
    ps: { reglages: { nbQ: choix([5, 10], { defaut: 5, libre: NB_LIBRE }), themes: cases(['groupes', 'matieres']) } },
    ms: { reglages: { themes: cases(['groupes', 'matieres', 'deplacements', 'mange']) } },
    gs: herite('ms', {}),
  },

  // une fiche par thème, de la MS à la GS (la PS a peu de fiches : manipuler d'abord) ; le bilan d'une classe existe toujours
  fiches: [
    { id: 'groupes', competence: K.categoriesMots, niveau: 'ms', classes: ['ms', 'gs'], reglages: { themes: ['groupes'] } },
    { id: 'matieres', competence: K.materiauxObjets, niveau: 'ms', classes: ['ms', 'gs'], reglages: { themes: ['matieres'] } },
    { id: 'deplacements', competence: K.deplacementsAnimaux, niveau: 'ms', classes: ['ms', 'gs'], reglages: { themes: ['deplacements'] } },
    { id: 'mange', competence: K.besoinsVivants, niveau: 'ms', classes: ['ms', 'gs'], reglages: { themes: ['mange'] } },
  ],
})
