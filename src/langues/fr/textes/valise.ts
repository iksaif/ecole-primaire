// Textes de l'interface — La valise (français), page /maternelle/valise : la vue et le jeu.
// Source des clés : br/textes/valise.ts doit avoir exactement les mêmes. Les questions et la fiche (consignes, corrigé) sont dans le
// catalogue de contenu de l'exercice : src/exercices/valise/textes.ts. Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'La valise',
  description: 'On met, on enlève, on complète : combien dans la valise ?',
  types: 'Quels problèmes ?',
  ajoute: 'On en met',
  retire: 'On en enlève',
  complete: 'Combien en ajouter ?',
  reponseFiche: "Sur la fiche, l'enfant…",
  ecrire: 'écrit le nombre',
  entourer: 'entoure le bon nombre',
  laReponse: 'La réponse : {n}',
} as const
