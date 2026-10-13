// Textes de l'interface — tracer à la règle (géométrie) : la page et le jeu. Source des clés : br/textes/tracerRegle.ts doit avoir exactement
// les mêmes. Les questions, les retours et la fiche sont dans le catalogue de contenu de l'exercice : src/exercices/tracer-regle/textes.ts.
export default {
  titre: 'Tracer à la règle',
  description: 'Points alignés, compléter et reproduire des figures sur papier pointé',
  // les types de questions (réglage `exercices`)
  exercices: {
    alignes: 'Points alignés',
    completer: 'Compléter une figure',
    reproduire: 'Reproduire une figure',
    construire: 'Construire une figure',
  },
  aideRegle: 'Pour vérifier, pose la règle : touche deux points.',
  regle: 'La règle',
  enleverRegle: 'Enlever la règle',
  aideTrace: 'Touche les points un par un : un trait les relie. Reviens au premier point pour fermer la figure.',
  annuler: 'Annuler le dernier trait',
  aideCompleter: 'Touche les points qui manquent, puis valide.',
  aideConstruire: 'Touche les coins des carreaux un par un : un trait les relie. Reviens au premier coin pour fermer la figure.',
  enlever: 'Enlever le dernier point',
  point: 'point {n}',
} as const
