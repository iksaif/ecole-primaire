// Textes de l'interface — visite guidée de la première arrivée (français) : src/shell/AssistantAccueil.vue.
export default {
  etape: 'Étape {n} sur {total}',
  fermer: 'Fermer la visite guidée',
  passer: 'Passer la visite',
  precedent: '← Précédent',
  // quand le bouton montré est rangé dans le menu du téléphone
  menu: 'Au téléphone, ce réglage est dans le menu ☰, en haut à droite.',
  profil: {
    titre: 'Bienvenue sur {nom} !',
    texte: 'Des exercices à faire à l’écran et des fiches à imprimer, de la petite section au CM2. Quelques conseils pour bien commencer.',
    question: 'Vous êtes parent ou enseignant·e ?',
    parentDesc: 'Mon enfant s’entraîne à la maison, à l’écran ou sur papier.',
    enseignantDesc: 'Je prépare des exercices et des fiches pour ma classe ou mes classes.',
  },
  classes: {
    titreParent: 'La classe de votre enfant',
    texteParent: 'Choisissez-la ici, ou plus tard avec le bouton « Classe » de la barre du haut : les exercices et les fiches proposés s’y adaptent. Plusieurs enfants ? Choisissez plusieurs classes.',
    titreEnseignant: 'Vos classes',
    texteEnseignant: 'Le bouton « Classe » de la barre du haut garde vos classes en mémoire : une seule, ou plusieurs pour une classe à plusieurs niveaux. Les listes montrent alors tout ce qui les concerne.',
  },
  enfant: {
    titre: 'Le mode enfant',
    texte: 'Quand votre enfant utilise le site seul, passez en mode enfant avec ce bouton de profil : l’écran se simplifie et ne montre que ses exercices, en grand.',
    cadenas: 'Sa classe est alors verrouillée par un cadenas 🔒 : pour la changer, un adulte le maintient appuyé 2 secondes. Pour revenir au mode parent, c’est le même bouton de profil.',
  },
  langue: {
    titre: 'Et le {langue} ?',
    texte: 'Le bouton « Langue » de la barre du haut propose le français seul, le français avec le {langue} (les deux langues sur les fiches et les exercices, pour les écoles bilingues) ou le {langue} seul. Choisissez maintenant ou plus tard :',
  },
  programme: {
    titre: 'Trouver une compétence précise',
    texte: 'L’entrée « Programme » reprend les programmes officiels : pour chaque classe, les domaines et les compétences, et pour chaque compétence, les exercices et les fiches qui la travaillent. Le meilleur chemin pour trouver exactement ce que vous cherchez.',
  },
  fin: {
    titre: 'C’est parti !',
    texte: 'Tout se change à tout moment dans la barre du haut ou sur la page des réglages ⚙️, où vous pourrez aussi revoir cette visite. Rien n’est envoyé : vos choix restent sur cet appareil.',
    enfant: '🧒 Passer en mode enfant',
    programme: '📚 Ouvrir le programme',
    commencer: 'Découvrir le site',
  },
  revoir: {
    titre: 'Visite guidée',
    aide: 'Les conseils de la première visite : profil, classes, langue, programme.',
    bouton: '🧭 Revoir la visite guidée',
  },
} as const
