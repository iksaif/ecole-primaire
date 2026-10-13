// Les brevets de ceintures — activité de FICHES : le brevet papier d'une ceinture d'une piste (les tables de multiplication, le calcul mental) : des questions
// tirées au hasard (graine du lien, « Nouvelle fiche »), le seuil de réussite et le cadre du résultat, avec corrigé (plans/15-ceintures.md §4).
// Les ceintures (couleurs, dessin, seuil, nombre de questions) viennent des réglages communs (src/ceintures/reglages.ts : page des réglages et « Sur la fiche »).
// Programme : les tables de multiplication (CE1 à CM2), et pour le calcul mental les doubles et moitiés, les compléments, la multiplication par 10 et 100. Les lettres viendront avec leur compétence.
import { definir, cases, choix, pourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import { PISTES_AVEC_BREVET } from '../../ceintures/brevets.ts'

const niveau = () => ({ reglages: { tables: cases([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { defaut: [2, 5, 10], bonus: [11, 12] }), jusqu: choix([10], { bonus: [12] }) } })

export default definir({
  id: 'ceintures-brevet',
  route: '/maths/ceintures-brevet',
  domaine: D.nombresCalcul,
  emoji: 'trophee',
  jeu: false,
  extensions: ['ceintures'],
  bilanParClasse: false,
  niveauDefaut: 'ce2',
  competences: [K.tablesMultiplication, K.doublesMoities, K.complementDizaine, K.multiplier10100],
  reglages: {
    piste: choix(PISTES_AVEC_BREVET),
    ceinture: choix([1, 2, 3, 4, 5, 6], { defaut: 1 }),
    // options de la piste « tables » : les tables de la ceinture, ou les siennes ; des divisions ; multiplier jusqu'à
    tablesPerso: choix([false, true]),
    divisions: choix(['auto', 'non', 'oui']),
    prenom: '' as string,
  },
  // les tables de 11 et 12 et « jusqu'à 12 » sont un bonus (comme dans l'exercice des tables) : il se déclare dans un niveau
  niveaux: {
    ce1: niveau(),
    ...pourClasses('ce2-cm2', niveau()),
  },
  fiches: [],
})
