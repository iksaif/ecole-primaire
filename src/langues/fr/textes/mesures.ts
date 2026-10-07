// Textes de l'interface — les mesures (français) : la page et le jeu. Source des clés : br/textes/mesures.ts doit avoir exactement les
// mêmes. Les énoncés, les explications et la fiche sont dans le catalogue de contenu de l'exercice : src/exercices/mesures/textes.ts.
// Mots communs (niveau, exercices, nombre de questions, valider, bonne réponse…) : section `communs`.
export default {
  titre: 'Mesures',
  description: 'Longueurs, masses, contenances, calendrier',
  segmentsRegle: 'Segments sur la règle',
  commencent0: 'Commencent à 0',
  pasToujours0: 'Ne commencent pas toujours à 0',
  nbSegments: 'Segments à mesurer sur la fiche',
  rappel100: "Imprimez à 100 % (« taille réelle »), sans ajustement à la page, sinon les segments n'auront pas la bonne longueur.",
  passer: 'Passer ⏭',
  passe: '(passé)',
  // les exercices proposés (réglage « exercices »)
  exercices: {
    regle: '📏 Mesurer à la règle',
    unite: '🤔 Unité adaptée',
    conversion: '🔁 Conversions',
    comparer: '🟰 Comparer',
    masse: '⚖️ Masses (balance)',
    contenance: '🥛 Contenances',
    calendrier: '📅 Calendrier (hors programme de maths)',
  },
} as const
