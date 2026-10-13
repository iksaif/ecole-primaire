// Textes de l'interface — le repérage (géométrie) : la page et le jeu. Source des clés : br/textes/reperage.ts doit avoir exactement les
// mêmes. Les questions, les retours et la fiche sont dans le catalogue de contenu de l'exercice : src/exercices/reperage/textes.ts.
export default {
  titre: 'Le repérage',
  description: 'Coder et suivre le déplacement d’un robot sur un quadrillage',
  // les types de questions (réglage `exercices`)
  exercices: {
    suivre: 'Suivre un programme',
    coder: 'Écrire un programme',
  },
  programme: 'Le programme du robot',
  avancer: 'Avancer',
  droite: 'Pivoter à droite',
  gauche: 'Pivoter à gauche',
  annuler: 'Enlever la dernière',
  lancer: 'Lancer le robot',
  vide: 'Touche les boutons pour écrire le programme.',
  caseDe: 'case {n}',
} as const
