// @ts-check
// Les mesures — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   CE1 : longueurs (m, cm, km) et masses (g, kg, 1 kg = 1 000 g) ; pas de contenances avant le CE2 (c2maths p. 27-30) ;
//   CE2 : + mm, contenances (L, dL, cL) (p. 29-30).
// Écarts connus (plan 09, « Étape 2 — audit maths ») : le CE2 ne propose ni le dm, ni la tonne, ni le périmètre.
// Le calendrier (jours, mois) n'est pas dans le programme de mathématiques : exercice « hors programme », jamais coché.

const RAISON_CALENDRIER = 'Le calendrier relève de « Questionner le monde », pas du programme de mathématiques du cycle 2'

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'mesures',
  route: '/maths/mesures',
  domaine: 'grandeurs-mesures',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // réglages communs à tous les niveaux : nombre de questions, segments sur la règle (« décalés » : ne commencent
  // pas à 0 ; seulement en jeu), segments à mesurer sur la fiche
  reglages: { nbQ: 10, decale: false, nbSegments: 6 },
  options: { nbQ: [5, 10, 15], decale: [false, true], nbSegments: [4, 6, 8] },
  niveaux: {
    ce1: {
      competences: ['longueurs', 'masses'],
      options: { exercices: ['regle', 'unite', 'conversion', 'comparer', 'masse', 'calendrier'] },
      reglages: { exercices: ['regle', 'unite', 'conversion'] },
      horsProgramme: [{ reglage: 'exercices', option: 'calendrier', raison: RAISON_CALENDRIER }],
    },
    ce2: {
      competences: ['longueurs', 'masses', 'contenances'],
      options: { exercices: ['regle', 'unite', 'conversion', 'comparer', 'masse', 'contenance', 'calendrier'] },
      reglages: { exercices: ['regle', 'unite', 'conversion'] },
      horsProgramme: [{ reglage: 'exercices', option: 'calendrier', raison: RAISON_CALENDRIER }],
    },
  },
  // fiches par compétence (mêmes que src/impression/exercices.js)
  fiches: [
    ...['ce1', 'ce2'].flatMap(niveau => [
      { id: 'longueurs', competence: 'longueurs', niveau, reglages: { exercices: ['regle', 'unite', 'conversion', 'comparer'] } },
      { id: 'masses', competence: 'masses', niveau, reglages: { exercices: ['masse'] } },
    ]),
    { id: 'contenances', competence: 'contenances', niveau: 'ce2', reglages: { exercices: ['contenance'] } },
  ],
}
