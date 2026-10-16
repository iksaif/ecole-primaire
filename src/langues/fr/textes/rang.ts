// Textes de l'interface — Le premier, le dernier (français), page /maternelle/rang : la vue.
// Source des clés : br/textes/rang.ts doit avoir exactement les mêmes. La consigne dite, les ordinaux et la fiche sont dans le catalogue de
// contenu de l'exercice : src/exercices/rang/textes.ts. Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'Le premier, le dernier',
  description: 'Montre le premier, le troisième, le dernier de la file',
  jusqua: "{niv} — files jusqu'à {n}",
  laBonne: "C'était celui-là : {n}",
  place: 'Place {n}',
} as const
