// Textes de l'interface — page d'accueil (français) : trois dispositions (enfant, parent, enseignant).
export default {
  titre: 'Affiches, fiches à imprimer et exercices pour s’entraîner',
  sousTitre: 'De la petite section au CM2, gratuit, sans compte.',
  titreEnfant: 'Bonjour !',
  maClasse: 'Ma classe',
  mesClasses: 'Mes classes',
  verrou: 'La classe est verrouillée (cadenas en haut) : un adulte peut l’ouvrir.',
  tuile: {
    maths: 'Maths',
    francais: 'Français',
    monde: 'Le Monde',
    programme: 'Programme',
    fiches: 'Fiches toutes prêtes',
  },
  // n = nombre de ressources (la forme), classes = « CE1 + CE2 »
  compte: { one: '{n} ressource · {classes}', other: '{n} ressources · {classes}' },
  aucune: 'Les ressources arrivent · {classes}',
  mondeDesc: 'Le quiz et des affiches : le corps, la journée, la météo, le vivant',
  programmeDesc: 'Ce qu’on apprend : {classes}',
  programmeDescEnseignant: 'Classe × domaine → compétences → ressources',
  fichesDesc: 'PDF à télécharger et imprimer, sans rien régler',
  reprendre: 'Reprendre',
  anciennete: { aujourdhui: 'aujourd’hui', hier: 'hier', jours: { one: 'il y a {n} jour', other: 'il y a {n} jours' } },
  profil: {
    phrase: 'Vous êtes plutôt :',
    facultatif: '(facultatif, ne change que la disposition)',
    enfant: 'enfant',
    parent: 'parent',
    enseignant: 'enseignant',
  },
  copier: 'Copier le lien pour les familles',
  copierAide: 'Les familles arrivent sur le site déjà réglé sur {classes}.',
  copie: 'Lien copié : les familles arriveront sur {classes}.',
  copieEchec: 'Copie impossible. Voici le lien à envoyer :',
  // le site régional (skoolik) : ce qu'il est, ce qui manque, comment aider ; {nom} : son nom, {reference} : le site de référence (adresse sans https://)
  versionRegionale: {
    titre: '{nom}, la version franco-bretonne d’{reference}',
    texte: '{nom} propose les mêmes exercices, affiches et fiches que sur {reference}, avec les textes en breton quand ils existent. Le site est en construction : une partie des traductions bretonnes est automatique et n’a pas encore été relue.',
    aide: 'Nous cherchons de l’aide pour relire et améliorer les traductions. Si vous parlez breton, si vous enseignez en classe bilingue ou si vous avez une remarque, écrivez-nous :',
    sujet: 'Aide pour les traductions bretonnes',
  },
} as const
