// Textes de l'interface — exemple d'exercice simple (français), page /dev/exemple : la vue et le jeu.
// Source des clés : br/textes/exemple.ts doit avoir exactement les mêmes. Le contenu de la fiche (consigne, corrigé) est dans
// le catalogue de contenu de l'exercice : src/exercices/exemple/textes.ts. Les mots communs (niveau, valider, suivant…) :
// section `communs`.
export default {
  titre: 'Suites de nombres',
  exercices: 'Exercices',
  complete: 'Compléter la suite',
  regle: 'Trouver la règle',
  sens: 'Dans quel sens ?',
  monte: 'On monte',
  descend: 'On descend',
  pas: 'On compte…',
  deEnDe: 'de {pas} en {pas}',
  consigneComplete: 'Complète la suite de nombres.',
  consigneRegle: 'À chaque fois, on ajoute ou on enlève quel nombre ?',
  laReponse: 'La réponse : {attendu}',
  presque: 'Presque ! Tu es à {pas} de la bonne réponse : compte bien de {pas} en {pas}.',
} as const
