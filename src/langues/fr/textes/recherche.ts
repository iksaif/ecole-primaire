// Textes de l'interface — recherche (français) : la palette ouverte par Ctrl+K, ⌘K ou « / ».
// Source des clés : br/textes/recherche.ts doit avoir exactement les mêmes.
export default {
  titre: 'Recherche',
  champ: 'Rechercher',
  placeholder: 'Chercher un exercice, une fiche, une compétence…',
  fermer: 'Fermer la recherche',
  resultats: 'Résultats',
  aide: 'Tapez quelques lettres pour chercher. Les accents sont facultatifs.',
  classe: 'Classe : {classes}',
  toutesLesClasses: 'Toutes les classes',
  masques: { one: '+ {n} dans les autres classes', other: '+ {n} dans les autres classes' },
  nombre: { zero: 'Aucun résultat', one: '{n} résultat', other: '{n} résultats' },
  aucun: 'Aucun résultat pour « {requete} » en {classes}.',
  aucunPartout: 'Aucun résultat pour « {requete} ».',
  essayerToutes: 'Chercher dans toutes les classes',
  autres: '+ {n} autres',
  groupes: {
    exercice: 'Exercices',
    affiche: 'Affiches',
    fiche: 'Fiches toutes prêtes',
    competence: 'Compétences du programme',
    page: 'Pages',
  },
  aideClavier: {
    choisir: '↑ ↓ pour choisir',
    ouvrir: '↵ pour ouvrir',
    fermer: 'Échap pour fermer',
    accents: 'Accents facultatifs',
  },
} as const
