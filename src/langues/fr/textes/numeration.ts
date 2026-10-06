// Textes de l'interface — les nombres (français) : la page et le jeu. Source des clés : br/textes/numeration.ts doit avoir exactement
// les mêmes. Les énoncés et la fiche (consignes, noms des unités, titres des fiches publiées) sont dans le catalogue de contenu de
// l'exercice : src/exercices/numeration/textes.ts. Les mots communs (niveau, valider…) : section `communs`.
export default {
  titre: 'Les nombres',
  description: "Jusqu'à 1 000 (CE1) et 10 000 (CE2) : décomposer, comparer, ranger",
  titrePlage: "Les nombres jusqu'à {n}",
  nombresJusqua: "Nombres jusqu'à",
  legendeMillier: '1 gros cube = 1000',
  legende: '1 plaque = 100 · 1 barre = 10 · 1 cube = 1',
  cliqueTous: 'Clique sur tous les nombres 😉',
  laBonne: '❌ La bonne réponse : {r}',
  passer: 'Passer ⏭',
  passe: '(passé)',
  // types d'exercices (boutons de réglage)
  type_decomposer: '🧱 Décomposer',
  type_representation: '🟦 Représentation',
  type_lettresChiffres: '✏️ Écrire en chiffres',
  type_chiffresLettres: '🔤 Écrire en lettres',
  type_comparer: '⚖️ Comparer',
  type_suites: '➡️ Suivant / suites',
  type_droite: '📏 Droite graduée',
  type_ranger: '📶 Ranger',
} as const
