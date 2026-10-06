// Les nombres — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   CP  : nombres jusqu'à 100 (dizaines et unités) ; en lettres jusqu'à 50 seulement (c2maths p. 3-4) ; pas de suites (« suites-nombres »
//         est une compétence du CE1) ;
//   CE1 : jusqu'à 1 000 (centaines) ; suites et ± 10, ± 100 (période 2 : « jusqu'à mille ») ;
//   CE2 : jusqu'à 10 000.
// « Nombres jusqu'à » (plage) : le plus grand nombre tiré ; il détermine le nombre de chiffres (2, 3 ou 4).
// Les identifiants des types d'exercices (« decomposer »…) sont aussi les valeurs des réglages mémorisés des visiteurs
// (clé « numeration_config ») : ils ne changent pas ; les libellés affichés sont dans src/langues/<langue>/textes/numeration.ts.
import { definir, cases, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export const TYPES = ['decomposer', 'representation', 'lettresChiffres', 'chiffresLettres', 'comparer', 'suites', 'droite', 'ranger'] as const
const SANS_SUITES = TYPES.filter(t => t !== 'suites')
const types = (...v: (typeof TYPES)[number][]): (typeof TYPES)[number][] => v

// Les fiches publiées gardent leur adresse de toujours (`exercices-nombres-<niveau>-<fiche>`) : l'exercice s'appelait « nombres »
const slug = (niveau: string, fiche: string): string => `exercices-nombres-${niveau}-${fiche}`
const COURANTES = ['cp', 'ce1', 'ce2'] as const

export default definir({
  id: 'numeration',
  route: '/maths/numeration',
  domaine: D.nombresCalcul,
  emoji: '💯',   // celui de l'ancien catalogue
  niveauDefaut: 'ce1',
  competences: [K.numeration100, K.numeration1000, K.numeration10000, K.nombresEnLettres, K.comparerRanger, K.droiteGraduee, K.suitesNombres],

  // réglages communs à tous les niveaux : nombre de questions à l'écran et sur la fiche
  reglages: {
    nbQ: choix([5, 10, 15, 20], { defaut: 10 }),
    nbFiche: choix([5, 10, 15, 20, 30], { defaut: 10 }),
  },

  niveaux: {
    cp: { reglages: { types: cases(SANS_SUITES), plage: choix([100]) } },
    ce1: { reglages: { types: cases(TYPES), plage: choix([100, 1000], { defaut: 1000 }) } },
    ce2: { reglages: { types: cases(TYPES), plage: choix([1000, 10000], { defaut: 10000 }) } },
  },

  // fiches par compétence (adresses historiques : `exercices-nombres-…`). Titres et descriptions : `fiche.<id>` de textes.ts.
  fiches: [
    { id: 'numeration', slug: slug('cp', 'numeration'), competence: K.numeration100, niveau: 'cp', reglages: { types: types('decomposer', 'representation', 'lettresChiffres') } },
    { id: 'numeration', slug: slug('ce1', 'numeration'), competence: K.numeration1000, niveau: 'ce1', reglages: { types: types('decomposer', 'representation', 'lettresChiffres') } },
    { id: 'numeration', slug: slug('ce2', 'numeration'), competence: K.numeration10000, niveau: 'ce2', reglages: { types: types('decomposer', 'representation', 'lettresChiffres') } },
    ...COURANTES.flatMap(niveau => [
      { id: 'en-lettres', slug: slug(niveau, 'en-lettres'), competence: K.nombresEnLettres, niveau, reglages: { types: types('chiffresLettres') } },
      { id: 'comparer-ranger', slug: slug(niveau, 'comparer-ranger'), competence: K.comparerRanger, niveau, reglages: { types: types('comparer', 'ranger') } },
      { id: 'droite', slug: slug(niveau, 'droite'), competence: K.droiteGraduee, niveau, reglages: { types: types('droite') } },
    ]),
    ...(['ce1', 'ce2'] as const).map(niveau => ({ id: 'suites', slug: slug(niveau, 'suites'), competence: K.suitesNombres, niveau, reglages: { types: types('suites') } })),
  ],
})
