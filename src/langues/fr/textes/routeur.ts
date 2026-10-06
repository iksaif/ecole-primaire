// Textes de l'interface — routeur (français) : titres de document (un par page), page introuvable, lien d'évitement.
// Source des clés : br/textes/routeur.ts doit avoir exactement les mêmes.
export default {
  evitement: 'Aller au contenu',
  avenir: 'Cette page arrive bientôt.',
  introuvable: {
    message: 'Cette adresse n’existe pas (ou n’existe plus).',
    accueil: 'Retour à l’accueil',
  },
  // titre du document (onglet du navigateur) : « <titre> — <nom du site> »
  titre: {
    accueil: 'Exercices et fiches à imprimer',
    maths: 'Mathématiques',
    francais: 'Français',
    monde: 'Le monde',
    fichesMaths: 'Fiches de mathématiques toutes prêtes',
    fichesFrancais: 'Fiches de français toutes prêtes',
    fichesMonde: 'Fiches sur le monde toutes prêtes',
    fiche: 'Fiche à imprimer',
    programme: 'Le programme',
    competence: 'Compétence du programme',
    exercice: 'Exercice',
    introuvable: 'Page introuvable',
  },
} as const
