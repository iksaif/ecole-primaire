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
  },
  // le mode enseignant est caché par défaut : une idée en construction (src/contexte/enseignant.ts)
  enseignant: {
    titre: 'Mode enseignant (idée en construction)',
    aide: 'Un profil pour les enseignants : plusieurs classes, l’entrée Programme, un lien à envoyer aux familles. C’est une idée en construction : rien n’y est validé, et ses contenus et ses outils doivent encore être relus avec des enseignants.',
    case: 'Afficher le mode enseignant sur cet appareil',
    parSite: 'Ce site le propose d’office.',
  },
  police: {
    titre: 'Police des fiches',
    aide: 'L’écriture utilisée sur les fiches à imprimer.',
  },
  voix: {
    titre: 'Voix',
    aide: 'La voix qui lit les consignes, le nom des lettres et la dictée. Elle vient du navigateur : elle change d’un appareil à l’autre.',
    voixPour: 'Voix pour le {langue}',
    automatique: 'Automatique (recommandé) : {nom}',
    automatiqueSeul: 'Automatique (recommandé)',
    surAppareil: 'Sur cet appareil',
    enLigne: 'En ligne',
    qualite: 'meilleure qualité',
    aucune: 'Aucune voix pour cette langue sur cet appareil : les textes restent écrits.',
    noteEnLigne: 'Voix en ligne : pour la faire parler, le navigateur envoie le texte lu au service de son éditeur (Google, Microsoft, Apple…). Notre site, lui, n’envoie rien. Les voix « sur cet appareil » ne laissent rien sortir.',
    astuce: 'Pour une voix plus naturelle : sur Mac, iPhone et iPad, téléchargez une voix « Premium » ou « Améliorée » (Réglages › Accessibilité › Contenu énoncé) ; sous Windows, ajoutez une voix française (Paramètres › Heure et langue › Voix) ; sous Android, dans Accessibilité › Synthèse vocale. Rechargez ensuite la page.',
    vitesse: 'Vitesse',
    plusLente: 'plus lente',
    plusRapide: 'plus rapide',
    pourcent: '{n} %',
    ecouter: '▶️ Écouter un exemple',
    exemple: 'Bonjour ! Écoute bien : montre-moi la lettre B, comme ballon.',
    sansVoix: 'Pas encore de voix pour : {langues}. Ces textes restent écrits, pour que l’adulte les lise.',
    sansSynthese: 'Ce navigateur ne sait pas lire à voix haute : les consignes restent écrites.',
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
