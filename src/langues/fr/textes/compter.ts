// Textes de l'interface — compter les objets (français) : la page et le jeu. Source des clés : br/textes/compter.ts doit avoir
// exactement les mêmes. Le nom des objets comptés et la fiche (titre, consignes) sont dans le catalogue de contenu de l'exercice :
// src/exercices/compter/textes.ts. Mots communs (niveau, nombre de questions…) : section `communs`.
export default {
  titre: 'Compter les objets',
  description: 'Compte et trouve le bon nombre',
  jusqua: "{niv} — jusqu'à {n}",
  combien: 'Combien y a-t-il de {nom} ?',
  ilYAvait: 'Il y avait {n} {emoji}',
  reponseFiche: "Sur la fiche, l'enfant…",
  ecrire: 'écrit le nombre',
  entourer: 'entoure le bon nombre',
} as const
