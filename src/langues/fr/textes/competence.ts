// Textes de l'interface — page d'une compétence du programme (français). Source des clés : br/textes/competence.ts.
export default {
  titre: 'Compétence du programme',
  inconnue: { titre: 'Compétence introuvable', message: 'Cette compétence n’existe pas dans le programme du site.', retour: 'Voir le programme' },
  fil: 'Fil d’Ariane',
  accueil: 'Accueil',
  programme: 'Le programme',
  domaine: 'Domaine',
  voirMatiere: 'Voir la page de la matière',
  classes: 'Classes concernées',
  classeVue: 'Vous consultez la compétence pour la classe {classe}.',
  officiel: { titre: 'Programme officiel', page: 'p. PDF {page}', ouvre: 'ouvre le PDF dans un nouvel onglet', extrait: 'Extrait' },
  interpretation: 'Notre lecture du programme',
  ressources: { titre: 'Toutes les ressources liées', nombre: { one: '{n} ressource', other: '{n} ressources' } },
  groupes: { exercices: 'Exercices et générateurs de fiches', affiches: 'Affiches et leçons', fiches: 'Fiches toutes prêtes' },
  vide: {
    exercices: 'Pas encore d’exercice pour cette compétence.',
    affiches: 'Pas encore d’affiche pour cette compétence.',
    fiches: 'Pas encore de fiche toute prête pour cette compétence.',
  },
  voisines: { titre: 'Compétences voisines', precision: 'même domaine', aucune: 'Pas d’autre compétence dans ce domaine.' },
} as const
