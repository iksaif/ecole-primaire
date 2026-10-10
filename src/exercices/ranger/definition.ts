// Ranger les nombres — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts) : MS : nombres jusqu'à 6 ; GS : jusqu'à 10 (« voire au-delà ») ; compétence « bande numérique »
// (ranger sur la bande numérique). On range 3 à 5 nombres pris entre 1 et 5 (MS) ou 1 et 10 (GS) : sous le plafond du programme.
// Pas de PS : ranger des nombres n'est pas un attendu avant 4 ans.
// L'identifiant est « ranger » et non « ordonner » : c'est celui des fiches déjà publiées (`exercices-ranger-ms`, `exercices-ranger-gs`,
// pages /telechargements/), qui ne changent pas ; la route reste /maternelle/ordonner. Les réglages mémorisés gardent leur clé
// historique `ordonner_config` (la vue la donne à useReglages). Les valeurs de `sens` sont aussi celles des réglages mémorisés.
import { definir, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'ranger',
  route: '/maternelle/ordonner',
  domaine: D.nombresCalcul,
  emoji: '📶',
  niveauDefaut: 'ms',
  competences: [K.bandeNumerique],

  // sens : croissant, décroissant ou mélangé ; taille : combien de nombres à ranger
  reglages: {
    sens: choix(['croissant', 'decroissant', 'mix'], { defaut: 'croissant' }),
    taille: choix([3, 4, 5], { defaut: 4 }),
    nbQ: choix([5, 10], { defaut: 10, libre: NB_LIBRE }),
  },

  niveaux: { ms: {}, gs: {} },

  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
})
