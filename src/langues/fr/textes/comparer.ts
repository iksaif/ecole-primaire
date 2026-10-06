// Textes de l'interface — comparer les quantités (français) : la page et le jeu. Source des clés : br/textes/comparer.ts doit avoir
// exactement les mêmes. La fiche (titre, consigne) est dans le catalogue de contenu de l'exercice : src/exercices/comparer/textes.ts.
// Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'Comparer les quantités',
  description: 'Quel groupe a le plus ?',
  jusqua: "{niv} — jusqu'à {n}",
  beaucoupPlus: '{niv} — beaucoup plus',
  consignePS: 'Où y en a-t-il le plus ? Touche le groupe.',
  consigne: 'Quel groupe a le plus ?',
  aPlus: '{g} a plus',
  pareil: 'Pareil',
  memeNombre: 'Les deux groupes ont le même nombre !',
  groupe: 'Groupe {g}',
} as const
