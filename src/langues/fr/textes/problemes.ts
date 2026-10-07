// Textes de l'interface — problèmes (français) : la page et le jeu. Source des clés : br/textes/problemes.ts doit avoir exactement
// les mêmes. Les énoncés, les questions et le contenu de la fiche sont dans le catalogue de contenu de l'exercice :
// src/exercices/problemes/textes.ts. Les mots communs (niveau, valider, suivant…) : section `communs`.
export default {
  titre: 'Problèmes',
  description: 'Lire, comprendre et calculer',
  typesProblemes: 'Types de problèmes',
  nombres: 'Nombres',
  jusqua: "Jusqu'à {n}",
  nbProblemes: 'Nombre de problèmes',
  passer: 'Passer ⏭',
  passe: '(passé)',
  laBonneReponse: 'La bonne réponse était {r}',
  // types de problèmes (réglages)
  cat_ajoutRetrait: '➕➖ Ajout / retrait',
  cat_comparaison: '⚖️ Comparaison',
  cat_partiesTout: '🧺 Parties et tout',
  cat_multiplication: '✖️ Multiplication',
  cat_partage: '🍰 Partage / groupements',
  cat_foisPlus: '🔁 « Fois plus »',
  cat_deuxEtapes: '🪜 Plusieurs étapes',
} as const
