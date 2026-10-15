// Textes de l'interface — Trier les images (français), page /maternelle/trier : la vue et le jeu.
// Source des clés : br/textes/trier.ts doit avoir exactement les mêmes. Les consignes, le nom des images et des boîtes et la fiche sont
// dans le catalogue de contenu de l'exercice : src/exercices/trier/textes.ts. Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'Trier les images',
  description: 'Range chaque image dans la bonne boîte',
  themes: 'Que veux-tu trier ?',
  groupes: 'Des groupes (animaux, fruits…)',
  matieres: 'Des matières (bois, métal, tissu…)',
  deplacements: 'Comment les animaux se déplacent',
  mange: 'Ce que mangent les animaux',
  laBonne: 'La bonne boîte : {nom}',
} as const
