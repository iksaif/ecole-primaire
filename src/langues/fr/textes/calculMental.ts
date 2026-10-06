// Textes de l'interface — calcul mental (français) : la page et le jeu. Source des clés : br/textes/calculMental.ts doit avoir
// exactement les mêmes. Le contenu des fiches et des énoncés (« Double de 7 = ? », libellés des opérations) est dans le catalogue de
// contenu de l'exercice : src/exercices/calcul-mental/textes.ts. Les mots communs (niveau, valider…) : section `communs`.
export default {
  titre: 'Calcul mental',
  description: 'Additions, soustractions, doubles, moitiés, tables',
  operations: 'Opérations',
  tables: 'Tables',
  nbCalculsFiche: 'Nombre de calculs sur la fiche',
  tempsParQuestion: 'Temps par question',
  sansLimite: 'Sans limite',
  passer: 'Passer ⏭',
  passe: '(passé)',
  laBonneReponse: 'La bonne réponse était {r}',
  tempsEcoule: '⏰ Temps écoulé ! La réponse était {r}',
} as const
