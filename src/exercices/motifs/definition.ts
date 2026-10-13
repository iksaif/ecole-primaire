// Les motifs — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, BO n° 41 p. 70-71) : PS : motif répétitif très simple (alternance AB), 5 questions ; MS : AB, ABB, AAB,
// ABC ; GS : + AABB, ABCD et motifs évolutifs (réservés à 5 ans). Les types de motifs de chaque niveau : motifs.ts.
// Les valeurs de `mode` (« apres », « trou ») sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'motifs',
  route: '/maternelle/motifs',
  domaine: D.motifs,
  emoji: 'boucle',
  niveauDefaut: 'ms',
  competences: [K.motifsMaternelle],

  // mode : « apres » (qu'est-ce qui vient après ?) ou « trou » (il en manque un) ; fiche : ce que l'enfant fait sur la fiche, MS et GS
  // (« dessine » : formes et dessins simples, et des images à découper ; « colorie » : formes de couleur à colorier)
  reglages: {
    mode: choix(['apres', 'trou'], { defaut: 'apres' }),
    fiche: choix(['dessine', 'colorie'], { defaut: 'dessine' }),
    nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }),
  },

  // PS : 5 questions (enfants de 3 ans), 2 choix
  niveaux: {
    ps: { reglages: { nbQ: choix([5, 10], { defaut: 5, libre: NB_LIBRE }) } },
    ms: {},
    gs: {},
  },

  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
})
