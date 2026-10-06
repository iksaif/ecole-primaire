// Textes de l'interface — pages de développement /dev et /dev/affiches (français). Ces pages n'existent qu'avec `npm run dev`.
// Source des clés : br/textes/dev.ts doit avoir exactement les mêmes.
export default {
  titre: 'Développement',
  intro: 'Cette page et ses exemples n’existent qu’avec <code>npm run dev</code> : rien n’en reste dans le build.',
  exemples: 'Exemples de départ',
  documentation: 'Documentation',
  exerciceSimpleTitre: 'Exemple d’exercice simple',
  exerciceSimpleDescription: 'une suite de nombres à compléter : niveaux, bonus, hors programme, fiche par compétence, jeu et fiche imprimable ; interface dans la langue de l’écran, contenu de la fiche traduit aussi',
  exerciceCorpusTitre: 'Exemple d’exercice à corpus',
  exerciceCorpusDescription: 'les synonymes : exercice de français (contenu toujours en français, catalogue français seulement), corpus dans src/data/, QCM, textes d’interface traduits à part',
  afficheTitre: 'Exemple d’affiche',
  afficheDescription: 'la bande numérique : variantes MS et GS, options, formulaire générique, impression A4 / A3',
  docExercice: 'créer un exercice (npm run nouveau -- exercice <id> "<Titre>" --modele simple|corpus, ou copier un exemple)',
  docAffiche: 'créer une affiche (npm run nouveau -- affiche <id> "<Titre>", ou copier exemple/)',
  afficheDevTitre: 'Affiche d’exemple (dev)',
  afficheDevIntro: 'Voir src/affiches/README.md. Cette page n’existe pas en production.',
} as const
