// Textes de l'interface — la géométrie (français) : la page et le jeu. Source des clés : br/textes/geometrie.ts doit avoir exactement
// les mêmes. Les questions, les consignes, les corrections et la fiche sont dans le catalogue de contenu de l'exercice :
// src/moteurs/geometrie/textes.ts (commun aux exercices de géométrie). Mots communs (niveau, exercices, nombre de questions, valider…) : section `communs`.
export default {
  titre: 'Géométrie',
  description: 'Symétrie, quadrillage, figures et solides',
  optionsSym: 'Options de symétrie',
  axeV: 'Axe vertical seulement',
  axeH: 'Axe horizontal aussi',
  aToi: 'À toi !',
  astuceEquerre: "Astuce : vérifie avec ton équerre ou le coin d'une feuille !",
  aucunBtn: 'Aucun',
  legJuste: 'juste',
  legOubliee: 'oubliée',
  legEnTrop: 'en trop',
  passe: '(passé)',
  effacer: 'Effacer',
  // les exercices (réglage `exercices`)
  exercices: {
    symetrie: 'Symétrie',
    figures: 'Figures',
    solides: 'Solides',
    aigus: 'Aigu, droit ou obtus',
    justifier: 'Justifier',
    angles: 'Angles droits',
    proprietes: 'Propriétés',
    cercle: 'Cercle',
    patrons: 'Patrons du cube',
  },
} as const
