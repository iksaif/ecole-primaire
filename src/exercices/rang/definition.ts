// Le premier, le dernier — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, rang-maternelle ; BO n° 41 p. 64-65) : à partir de 4 ans, repérer le rang d'un objet dans une file de 6 au plus
// (le premier, le deuxième… le sixième) ; à 5 ans, aussi le dernier et l'avant-dernier, dans une file allant jusqu'à 10. Les ordinaux sont dits par
// la voix : l'enfant montre l'objet. Pas de PS (le rang n'y est pas au programme). Fiche : une file par question, l'enfant colorie celui qu'on dit.
import { definir, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'rang',
  route: '/maternelle/rang',
  domaine: D.nombresCalcul,
  emoji: 'chiffres',
  niveauDefaut: 'ms',
  competences: [K.rangMaternelle],

  reglages: { nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: {
    ms: { reglages: {} },
    gs: { reglages: {} },
  },

  fiches: [
    { id: 'rang', competence: K.rangMaternelle, niveau: 'ms', classes: ['ms', 'gs'], reglages: {} },
  ],
})
