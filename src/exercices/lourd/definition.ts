// Le plus lourd — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, comparer-masses-maternelle ; BO n° 41 p. 69-70) : la masse n'est introduite qu'à partir de 4 ans (MS : comparer
// deux objets) ; à 5 ans, ordonner les masses de trois objets avec une balance (GS). Le BO dit qu'on soupèse : l'exercice reste un appui, la balance
// à plateaux dessinée montre le résultat, l'enfant en tire le plus lourd ou le plus léger (à faire d'abord avec de vrais objets en classe). Des objets
// grands mais légers (ballon) et petits mais lourds (pierre) évitent que la taille de l'image donne la réponse. Pas de PS.
import { definir, choix, cases, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'lourd',
  route: '/maternelle/lourd',
  domaine: D.grandeursMesures,
  emoji: 'balance',
  niveauDefaut: 'ms',
  competences: [K.comparerMassesMaternelle],

  reglages: { nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }) },

  // deux : une balance, deux objets ; trois : deux balances, trois objets (« lequel est le plus lourd des trois ? »)
  niveaux: {
    ms: { reglages: { types: cases(['deux']) } },
    gs: { reglages: { types: cases(['deux', 'trois']) } },
  },

  fiches: [
    { id: 'lourd', competence: K.comparerMassesMaternelle, niveau: 'ms', classes: ['ms', 'gs'], reglages: {} },
  ],
})
