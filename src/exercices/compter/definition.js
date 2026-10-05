// @ts-check
// Compter les objets — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   PS : collection jusqu'à 3 (« voire 4 » : pas systématique), réponse en constellation de points, jamais de chiffre à écrire ;
//   MS : jusqu'à 6 ; GS : jusqu'à 10 (« voire au-delà »). Sur la fiche, l'enfant écrit le nombre ou entoure le bon.

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'compter',
  route: '/maternelle/compter',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ms',
  // reponse (fiche) : 'ecrire' le nombre dans une case, ou 'entourer' le bon nombre
  reglages: { nbQ: 10, reponse: 'ecrire' },
  options: { nbQ: [5, 10], reponse: ['ecrire', 'entourer'] },
  niveaux: {
    // PS : 5 questions (enfants de 3 ans) ; on entoure toujours la bonne constellation
    ps: { competences: ['denombrer-3'], reglages: { nbQ: 5, reponse: 'entourer' }, options: { reponse: ['entourer'] } },
    ms: { competences: ['denombrer-6'], reglages: {} },
    gs: { competences: ['denombrer-10'], reglages: {} },
  },
  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
}
