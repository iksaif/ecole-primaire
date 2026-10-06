// Textes de l'interface — ranger les nombres (français) : la page et le jeu. Source des clés : br/textes/ranger.ts doit avoir
// exactement les mêmes. La fiche (titre, consignes) est dans le catalogue de contenu de l'exercice : src/exercices/ranger/textes.ts.
// Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'Ranger les nombres',
  description: 'Du plus petit au plus grand',
  nombresDe: '{niv} — nombres 1 à {n}',
  petitGrand: 'Du plus petit au plus grand',
  croissant: 'Croissant',
  decroissant: 'Décroissant',
  melange: 'Mélangé',
  combien: 'Combien de nombres à ranger ?',
  rangeCroissant: 'Range du plus petit au plus grand',
  rangeDecroissant: 'Range du plus grand au plus petit',
  petitGrandMin: 'du plus petit au plus grand',
  grandPetitMin: 'du plus grand au plus petit',
  ordreCorrect: "L'ordre correct : {ordre}",
} as const
