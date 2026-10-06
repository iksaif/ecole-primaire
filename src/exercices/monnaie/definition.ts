// La monnaie — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   CP  : montants entiers d'euros ≤ 100 € (c2maths p. 26) : compter, payer, rendre ; pas de centimes ;
//   CE1 : centimes (au plus tard en période 2), écriture à virgule à partir de la période 3 (p. 28) ;
//   CE2 : euros et centimes, 1 € = 100 c, écriture à virgule, montants plus grands (p. 30-31).
// Les sommes sont toujours en centimes entiers dans le générateur. Les identifiants des types d'exercices (« compter »…) sont
// aussi les valeurs des réglages mémorisés des visiteurs : ils ne changent pas (les libellés affichés sont dans l'interface).
import { definir, cases, choix, fichesPourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

// Les types d'exercices proposés, par niveau (« 1 € = 100 c » arrive au CE2 : le CP et le CE1 n'ont pas de conversion)
const TYPES = ['compter', 'composer', 'moins', 'rendre', 'comparer'] as const
const TYPES_CE2 = [...TYPES, 'convertir'] as const
const PAR_DEFAUT = ['compter', 'composer'] as const

export default definir({
  id: 'monnaie',
  route: '/maths/monnaie',
  domaine: D.grandeursMesures,
  emoji: '💶',   // la carte du catalogue : de l'argent, pas la règle du domaine « grandeurs et mesures »
  niveauDefaut: 'ce1',
  competences: [K.monnaieEuros, K.monnaieCentimes],

  // réglages communs à tous les niveaux : nombre de questions du jeu ; le total affiché pendant qu'on compose (sans choix : un
  // simple interrupteur, jamais essayé par les tests de fiches)
  reglages: {
    nbQ: choix([5, 10, 15], { defaut: 10 }),
    aideTotal: true as boolean,
  },

  // le CP n'a que des euros entiers ; au CE1 et au CE2 on peut ajouter les centimes
  niveaux: {
    cp: { reglages: { exercices: cases(TYPES, { defaut: PAR_DEFAUT }), centimes: choix([false]) } },
    ce1: { reglages: { exercices: cases(TYPES, { defaut: PAR_DEFAUT }), centimes: choix([false, true]) } },
    ce2: { reglages: { exercices: cases(TYPES_CE2, { defaut: PAR_DEFAUT }), centimes: choix([false, true]) } },
  },

  // Fiches par compétence (le bilan d'une classe : réglages par défaut du niveau). Titres et descriptions : `fiche.<id>` de textes.ts.
  fiches: [
    ...fichesPourClasses('cp-ce2', { id: 'compter', competence: K.monnaieEuros, reglages: { exercices: ['compter', 'composer', 'moins', 'comparer'] } }),
    ...fichesPourClasses('cp-ce2', { id: 'rendre', competence: K.monnaieEuros, reglages: { exercices: ['rendre'] } }),
    { id: 'centimes', competence: K.monnaieCentimes, niveau: 'ce2', reglages: { exercices: ['compter', 'composer', 'convertir'], centimes: true } },
  ],
})
