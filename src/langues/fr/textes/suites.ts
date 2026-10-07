// Textes de l'interface — suites de nombres (français), page /maths/suites : la vue et le jeu.
// Source des clés : br/textes/suites.ts doit avoir exactement les mêmes. Le contenu de la fiche (consignes, corrigé) est dans
// le catalogue de contenu de l'exercice : src/exercices/suites/textes.ts. Les mots communs (niveau, valider, suivant…) :
// section `communs`.
export default {
  titre: 'Les suites de nombres',
  description: 'Poursuivre une suite, trouver le terme qui manque ou le pas',
  exercices: 'Exercices',
  poursuivre: 'Poursuivre la suite',
  complete: 'Trouver le terme manquant',
  regle: 'Trouver le pas',
  sens: 'Quel sens ?',
  monte: 'On monte',
  descend: 'On descend',
  pas: 'On compte…',
  deEnDe: 'compter de {pas} en {pas}',
  nbSuitesFiche: 'Nombre de suites sur la fiche',
  consignePoursuivre: 'Poursuis la suite de nombres.',
  consigneComplete: 'Complète la suite.',
  consigneRegle: 'Quel nombre ajoute-t-on ou enlève-t-on à chaque fois ?',
  laReponse: 'La bonne réponse était {attendu}',
  presque: "Presque ! Il y a {pas} d'écart avec la bonne réponse : compte de {pas} en {pas}.",
} as const
