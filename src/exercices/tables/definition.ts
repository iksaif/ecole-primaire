// Tables de multiplication — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), compétence « tables-multiplication » (CE1 → CM2, c2maths p. 14 : A × B = C, A et B entre 0 et
// 10 ; renforcé au CE2 et au cours moyen). L'exercice n'avait pas de niveau : on déduit CE1 → CM2 du programme. Les tables de 1 à 10
// sont au programme à chaque niveau ; les tables de 11 et 12 et « multiplier jusqu'à 12 » sont un bonus. Au CE1 la sélection de départ
// reprend les tables de 2, 3, 4, 5 et 10 (programme du CE1), ailleurs les tables de 2 à 9 (choix d'avant).
// Les valeurs du réglage `mode` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
//   mode : 'entrainement' (voir la table, puis répondre dans l'ordre), 'aleatoire', 'chrono' (1 minute).
import { definir, cases, choix, pourClasses, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const PROGRAMME = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

// tables : à réviser (11 et 12 : bonus) ; jusqu : multiplier jusqu'à (12 : bonus)
const niveau = (defaut: readonly (typeof PROGRAMME)[number][]) => ({
  reglages: { tables: cases(PROGRAMME, { defaut, bonus: [11, 12] }), jusqu: choix([10], { bonus: [12] }) },
})

export default definir({
  id: 'tables',
  route: '/maths/tables',
  domaine: D.nombresCalcul,
  emoji: '✖️',
  niveauDefaut: 'ce2',
  competences: [K.tablesMultiplication],

  // nbQ : questions (mode aléatoire) ; ordreFiche et nbFiche : la fiche papier (nbFiche 0 = tous les calculs des tables choisies)
  reglages: {
    mode: choix(['entrainement', 'aleatoire', 'chrono'], { defaut: 'aleatoire' }),
    nbQ: choix([10, 20, 30], { defaut: 20, libre: NB_LIBRE }),
    ordreFiche: choix(['ordre', 'melange'], { defaut: 'melange' }),
    nbFiche: choix([0, 20, 30, 40], { defaut: 0 }),
  },

  niveaux: {
    ce1: niveau([2, 3, 4, 5, 10]),
    ...pourClasses('ce2-cm2', niveau([2, 3, 4, 5, 6, 7, 8, 9])),
  },

  // aucune fiche par compétence : pas de fiche publiée pour cet exercice (les fiches de tables publiées sont celles du calcul mental)
  fiches: [],
})
