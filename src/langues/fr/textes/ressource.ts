// Textes de l'interface — cartes, lignes et groupes de ressources (français) : src/ressources/composants/.
// Source des clés : br/textes/ressource.ts doit avoir exactement les mêmes.
export default {
  plusieursDomaines: 'Plusieurs domaines',
  enLigne: 'en ligne',
  imprimable: 'imprimable',
  classes: 'Classes',
  classeChoisie: '(classe choisie)',
  // une plage de classes lue en entier (PastillesClasses) : « de la PS » + « au CM2 » ; l'article suit la classe (la PS, le CP)
  plage: {
    phrase: '{debut} {fin}',
    debut: { maternelle: 'de la {classe}', elementaire: 'du {classe}' },
    fin: { maternelle: 'à la {classe}', elementaire: 'au {classe}' },
  },
  // une plage qui contient des classes choisies (elle est mise en évidence) : lesquelles
  plageChoisie: { one: '(dont la classe choisie : {classes})', other: '(dont les classes choisies : {classes})' },
  ouvrir: 'Ouvrir',
  imprimer: 'Imprimer',
  ouvrirTitre: 'Ouvrir : {titre}',
  imprimerTitre: 'Imprimer : {titre}',
  apprendre: 'À afficher',
  sentrainer: 'Pour s’entraîner',
  rien: 'Rien dans cette catégorie pour cette sélection.',
  ressources: { one: '{n} ressource', other: '{n} ressources' },
  // n = nombre de classes (choisit la forme), total = nombre de ressources hors de ces classes
  horsClasse: { one: 'Hors de la classe {classes} : {total}', other: 'Hors des classes {classes} : {total}' },
  genre: { exercice: 'exercice', generateur: 'générateur', affiche: 'affiche', fiche: 'fiche prête' },
  vue: { titre: 'Présentation', cartes: 'Cartes', liste: 'Liste' },
  videAction: 'Voir le programme',
} as const
