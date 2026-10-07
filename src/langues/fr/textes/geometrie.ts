// Textes de l'interface — la géométrie (français) : la page et le jeu. Source des clés : br/textes/geometrie.ts doit avoir exactement
// les mêmes. Les questions, les consignes, les corrections et la fiche sont dans le catalogue de contenu de l'exercice :
// src/exercices/geometrie/textes.ts. Mots communs (niveau, exercices, nombre de questions, valider…) : section `communs`.
export default {
  titre: 'Géométrie',
  description: 'Symétrie, quadrillage, figures et solides',
  optionsSym: 'Options de symétrie',
  axeV: 'Axe vertical seulement',
  axeH: 'Axe horizontal aussi',
  modele: 'Modèle',
  aToi: 'À toi !',
  astuceEquerre: "Astuce : vérifie avec ton équerre ou le coin d'une feuille !",
  aucunBtn: 'Aucun',
  legJuste: 'juste',
  legOubliee: 'oubliée',
  legEnTrop: 'en trop',
  passer: 'Passer ⏭',
  passe: '(passé)',
  effacer: '🧽 Effacer',
  // les exercices (réglage `exercices`)
  exercices: {
    symetrie: '🦋 Symétrie',
    reproduction: '✏️ Reproduction',
    reperage: '📍 Repérage',
    figures: '🔷 Figures',
    solides: '🧊 Solides',
    angles: '📐 Angles droits',
    proprietes: '📋 Propriétés',
    cercle: '⭕ Cercle',
    patrons: '🎲 Patrons du cube',
  },
} as const
