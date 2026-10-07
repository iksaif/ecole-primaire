// Textes de l'interface — quiz (français) : la page et le jeu. Source des clés : br/textes/quiz.ts doit avoir exactement les mêmes.
// La fiche (titre, consigne, noms des thèmes) est dans le catalogue de contenu de l'exercice : src/exercices/quiz/textes.ts.
export default {
  titre: 'Quiz — Culture générale',
  description: 'Animaux, sciences, géographie, histoire : des questions à choix',
  theme: 'Thème',
  themes: {
    animaux: 'Le monde animal',
    sciences: 'Sciences & nature',
    'geo-france': 'Géographie France',
    'geo-monde': 'Capitales du monde',
    histoire: 'Histoire de France',
  },
  nbQuestions: 'Nombre de questions',
  mauvaise: 'La bonne réponse était : {r}.',
  aRetenir: 'À retenir :',
} as const
