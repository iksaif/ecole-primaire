// Les mesures — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   CE1 : longueurs (m, cm, km) et masses (g, kg, 1 kg = 1 000 g) ; pas de contenances avant le CE2 (c2maths p. 27-30) ;
//   CE2 : + mm, contenances (L, dL, cL) (p. 29-30).
// Écarts connus (plan 09, « Étape 2 — audit maths ») : le CE2 ne propose ni le dm, ni la tonne, ni le périmètre (les ajouter
// changerait les fiches publiées : un lot à part, voir docs/TODO.md).
// Le calendrier (jours, mois) n'est pas dans le programme de mathématiques : exercice « hors programme », jamais coché.
// Les identifiants des exercices (« regle »…) sont aussi les valeurs des réglages mémorisés des visiteurs (clé « mesures_config »).
import { definir, cases, choix, fichesPourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const RAISON_CALENDRIER = 'Le calendrier relève de « Questionner le monde », pas du programme de mathématiques du cycle 2'
const PAR_DEFAUT = ['regle', 'unite', 'conversion'] as const
const CE1 = ['regle', 'unite', 'conversion', 'comparer', 'masse'] as const
const CE2 = ['regle', 'unite', 'conversion', 'comparer', 'masse', 'contenance'] as const
const HORS_PROGRAMME = [{ option: 'calendrier', raison: RAISON_CALENDRIER }] as const

export default definir({
  id: 'mesures',
  route: '/maths/mesures',
  domaine: D.grandeursMesures,
  emoji: '📏',
  niveauDefaut: 'ce1',
  competences: [K.longueurs, K.masses, K.contenances],

  // réglages communs à tous les niveaux : nombre de questions, segments sur la règle (« décalés » : ne commencent pas à 0 ; seulement
  // en jeu), segments à mesurer sur la fiche
  reglages: {
    nbQ: choix([5, 10, 15], { defaut: 10 }),
    decale: choix([false, true]),
    nbSegments: choix([4, 6, 8], { defaut: 6 }),
  },

  niveaux: {
    ce1: { reglages: { exercices: cases(CE1, { defaut: PAR_DEFAUT, horsProgramme: HORS_PROGRAMME }) } },
    ce2: { reglages: { exercices: cases(CE2, { defaut: PAR_DEFAUT, horsProgramme: HORS_PROGRAMME }) } },
  },

  // Fiches par compétence (adresses publiées : exercices-mesures-<niveau>-<fiche>)
  fiches: [
    ...fichesPourClasses('ce1-ce2', { id: 'longueurs', competence: K.longueurs, reglages: { exercices: ['regle', 'unite', 'conversion', 'comparer'] } }),
    ...fichesPourClasses('ce1-ce2', { id: 'masses', competence: K.masses, reglages: { exercices: ['masse'] } }),
    { id: 'contenances', competence: K.contenances, niveau: 'ce2', reglages: { exercices: ['contenance'] } },
  ],
})
