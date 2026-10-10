// Exemple d'exercice à corpus — définition. Même forme que l'exemple simple (voir ../exemple/definition.ts, qui
// commente chaque mécanisme) ; seul change ce qui tient au corpus : exercice de français, contenu toujours en français.
import { definir, cases, choix, pourClasses, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'exemple-corpus',
  route: '/dev/exemple-corpus',
  domaine: D.exemple,
  // 'fr' : l'exercice (énoncés, fiche) est toujours en français, même avec l'interface en breton. Les textes de
  // l'interface restent traduits (src/i18n) ; le corpus et les textes de la fiche, jamais.
  contenu: 'fr',
  competences: [K.exempleSynonymes],
  reglages: {
    nbQ: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }),
    themes: cases(['sentiments', 'actions']),   // les thèmes du corpus (src/data/exemple-corpus.ts)
  },
  // pas de réglage propre aux niveaux : le niveau ne change que les mots tirés (le corpus dit à partir de quelle classe)
  // `pourClasses('ce1-cm1', …)` : le même niveau pour chaque classe de la plage (plages : `'cp'`, `'cp+'`, `'-gs'`, `'ce1-cm1'`, src/data/classes.ts)
  niveaux: pourClasses('ce1-cm1', {}),
  fiches: [
    { id: 'sentiments', competence: K.exempleSynonymes, niveau: 'ce2', reglages: { themes: ['sentiments'] } },
  ],
})
