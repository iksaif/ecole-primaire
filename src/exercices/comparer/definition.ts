// Comparer les quantités — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans la compétence « comparer deux quantités » de chaque niveau :
//   PS : comparer « à vue » deux collections dont l'une a au moins deux fois plus d'objets (jusqu'à 10), sans égalité,
//        en touchant le groupe ; MS : nombres jusqu'à 5 (programme : 6), avec égalité ; GS : jusqu'à 10.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'comparer',
  route: '/maternelle/comparer',
  domaine: D.nombresCalcul,
  emoji: '⚖️',
  niveauDefaut: 'ms',
  competences: [K.comparerQuantites],

  reglages: { nbQ: choix([5, 10], { defaut: 10 }) },

  niveaux: {
    // PS : 5 questions (enfants de 3 ans)
    ps: { reglages: { nbQ: choix([5, 10], { defaut: 5 }) } },
    ms: {},
    gs: {},
  },

  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
})
