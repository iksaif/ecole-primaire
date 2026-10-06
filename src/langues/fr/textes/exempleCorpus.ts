// Textes de l'interface — exemple d'exercice à corpus (français), page /dev/exemple-corpus : la vue et le jeu.
// Source des clés : br/textes/exempleCorpus.ts doit avoir exactement les mêmes. Le contenu de la fiche (français seulement,
// jamais traduit) est dans le catalogue de contenu : src/exercices/exemple-corpus/textes.ts.
export default {
  titre: 'Les synonymes',
  themes: 'Thèmes',
  sentiments: 'Les sentiments',
  actions: 'Les actions',
  consigne: 'Quel mot veut dire presque la même chose que',
  laReponse: 'La réponse : {attendu}',
} as const
