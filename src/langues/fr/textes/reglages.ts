// Textes de l'interface — page des réglages (français).
export default {
  titre: '⚙️ Réglages',
  intro: 'Ces réglages sont mémorisés sur cet appareil, dans le navigateur. Rien n’est envoyé.',
  interface: {
    titre: 'Langue de l’interface',
    aide: 'La langue des menus et des textes du site.',
  },
  langues: {
    titre: 'Langues des fiches et des exercices',
    aide: 'Français seul, français avec la langue régionale (nombres en lettres, alphabet, jours, mois, mots), ou langue régionale seule. Pratique pour les écoles bilingues ou immersives.',
  },
  classe: {
    titre: 'Ma classe',
    aide: 'Les listes montrent les exercices et les fiches de la classe. Le profil Enseignant permet d’en choisir plusieurs.',
  },
  profil: {
    titre: 'Qui utilise le site ?',
    aide: 'Le profil ne change que la disposition et le nombre de classes. Rien n’est verrouillé.',
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
