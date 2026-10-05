// Textes de l'interface — page des réglages (français).
export default {
  titre: '⚙️ Réglages',
  intro: 'Ces réglages sont mémorisés sur cet appareil, dans le navigateur. Rien n’est envoyé.',
  interface: {
    titre: 'Langue de l’interface',
    aide: 'La langue des menus et des textes du site.',
  },
  regionale: {
    titre: 'Langue régionale',
    aide: 'Ajoute la langue régionale aux fiches à imprimer et au menu : nombres en lettres, alphabet, jours, mois et mots. Pratique pour les écoles bilingues ou immersives.',
    aucune: 'Aucune',
    imposee: 'Quand l’interface est dans cette langue, ses fonctions sont activées d’office.',
  },
  classe: {
    titre: 'Ma classe',
    aide: 'Filtre les exercices et les fiches selon la classe. « Toutes » montre tout.',
  },
  police: {
    titre: 'Police des fiches',
    aide: 'L’écriture utilisée sur les fiches à imprimer.',
  },
  remise: {
    titre: 'Réinitialiser',
    aide: 'Efface tous les réglages et les scores mémorisés sur cet appareil.',
    bouton: 'Tout réinitialiser',
    confirmer: 'Êtes-vous sûr ? Tout ce qui est mémorisé sur cet appareil sera effacé.',
    fait: { one: '✅ {n} réglage supprimé.', other: '✅ {n} réglages supprimés.' },
  },
  retour: '← Retour à l’accueil',
} as const
