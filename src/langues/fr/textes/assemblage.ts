// Textes de l'interface — la fiche sur mesure (français). Source des clés : br/textes/assemblage.ts doit avoir exactement les mêmes.
export default {
  titre: 'Fiche sur mesure',
  intro: 'Réunis sur une seule feuille des fiches de plusieurs exercices : une ligne Prénom et Date, un seul corrigé. Chaque exercice garde ses réglages habituels pour la classe choisie.',
  exercices: 'Exercices à réunir',
  aucun: 'Choisis au moins un exercice pour voir la feuille.',
  aucunPourLaClasse: 'Aucun exercice n’a de fiche pour cette classe.',
  nonAssemblables: 'Pas assemblable ici : {noms}',
  titreFiche: 'Ma fiche',
  ouvrir: 'Ouvrir la fiche sur mesure',
  activer: {
    titre: 'Fiche sur mesure (en option)',
    aide: 'Une page qui réunit sur une feuille des fiches de plusieurs exercices. Cachée tant qu’on ne l’active pas.',
    case: 'Proposer la fiche sur mesure sur cet appareil',
    parSite: 'Ce site la propose d’office.',
  },
  reglage: {
    titre: 'Fiche sur mesure',
    aide: 'Choisis des exercices d’une classe, et imprime-les ensemble : une ligne Prénom et Date, un seul corrigé.',
  },
} as const
