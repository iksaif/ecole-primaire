// Lire l'heure — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   CP  : heures entières, aiguilles ≤ 12 h (c2maths p. 26 : « se limite aux heures entières ») : pas de minutes, ni sur la fiche
//         ni dans le jeu ;
//   CE1 : demi-heures et quarts d'heure, heures après midi, durées (p. 28-29) ; les 5 minutes sont un bonus ;
//   CE2 : heures et minutes, durées, 1 h = 60 min (p. 31) ; pas de secondes au cycle 2.
// Les identifiants des réglages (`exercices`, `precisions`, `saisie`…) sont aussi les valeurs mémorisées chez les visiteurs
// (clé « heure_config ») : ils ne changent pas ; les libellés affichés sont dans src/langues/<langue>/textes/heure.ts.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'heure',
  route: '/maths/heure',
  domaine: D.grandeursMesures,
  emoji: '🕐',   // celui de l'ancien catalogue (l'emoji du domaine, 📏, ne parle pas)
  niveauDefaut: 'ce1',
  competences: [K.heureEntiere, K.heureDemiQuart, K.heureMinutes, K.durees],

  // saisie : réponse à « Quelle heure est-il ? » (4 propositions ou au clavier) ; aideMinutes : les minutes écrites autour du cadran
  // (jamais au CP, qui ne lit pas les minutes : generateur.aideMinutesPossible) ; nbQ : questions du jeu ; nbHorloges : horloges
  // par partie d'une fiche
  reglages: {
    saisie: choix(['choix', 'clavier']),
    aideMinutes: true as boolean,   // un interrupteur, pas une liste de valeurs : le type est `boolean`, pas `true`
    nbQ: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }),
    nbHorloges: choix([4, 8, 12], { defaut: 8 }),
  },

  // exercices : ce que la partie ou la fiche propose ; precisions : les minutes que montrent les horloges
  niveaux: {
    cp: {
      reglages: {
        exercices: cases(['lire', 'placer'], { defaut: ['lire'] }),
        precisions: cases(['heure']),
      },
    },
    ce1: {
      reglages: {
        exercices: cases(['lire', 'placer', 'journee', 'duree'], { defaut: ['lire'] }),
        precisions: cases(['heure', 'demi', 'quart'], { bonus: ['cinq'] }),
      },
    },
    ce2: {
      reglages: {
        exercices: cases(['lire', 'placer', 'journee', 'duree', 'conversion', 'emploi'], { defaut: ['lire', 'duree', 'conversion'] }),
        precisions: cases(['heure', 'demi', 'quart', 'cinq', 'minute'], { defaut: ['quart', 'cinq', 'minute'] }),
      },
    },
  },

  // Fiches par compétence (le bilan d'une classe : réglages par défaut du niveau). Adresses : exercices-heure-<niveau>-<fiche>
  fiches: [
    { id: 'lire', competence: K.heureDemiQuart, niveau: 'ce1', reglages: { exercices: ['lire', 'placer', 'journee'] } },
    { id: 'lire', competence: K.heureMinutes, niveau: 'ce2', reglages: { exercices: ['lire', 'placer'] } },
    { id: 'durees', competence: K.durees, niveau: 'ce1', reglages: { exercices: ['duree'] } },
    { id: 'durees', competence: K.durees, niveau: 'ce2', reglages: { exercices: ['duree', 'conversion', 'emploi'] } },
  ],
})
