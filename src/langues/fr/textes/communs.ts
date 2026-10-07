// Textes communs aux exercices et aux fiches (français) : boutons du jeu, écran de fin, tableau de correction, marques des
// réglages, mots des fiches (prénom, date, corrigé). Ne contient que ce que lit le noyau (src/noyau/) et les exercices ;
// un texte propre à un exercice va dans sa section (ex. `exemple`). `T('corrige')` d'une fiche lit aussi cette section.
export default {
  // les deux polices d'une affiche à polices par type (traducteurAffiche s'y rabat quand l'affiche n'a pas les siens)
  police: { script: 'Police du script', attache: 'Police de l’attaché' },
  commencer: '▶ Commencer',
  valider: 'Valider ✔',
  suivant: 'Suivant ➜',
  quitter: '✕ Quitter',
  quitterTitre: "Quitter l'exercice",
  rejouer: '🔄 Rejouer',
  parametres: '⚙️ Paramètres',
  niveau: 'Niveau',
  exercices: 'Exercices',
  nbQuestions: 'Nombre de questions',
  question: 'Question {n} / {total}',
  colQuestion: 'Question',
  taReponse: 'Ta réponse',
  bonneReponse: 'Bonne réponse',
  bravo: ['Bravo ! 🎉', 'Super ! ⭐', 'Parfait ! 👏', 'Excellent ! 🌟'],
  resultat100: 'Parfait, sans faute ! 🏆',
  resultat80: 'Très bien ! Continue comme ça 🌟',
  resultat60: 'Bien ! Tu peux encore progresser 💪',
  resultat40: "Courage, continue à t'entraîner ! 🤓",
  resultat0: "N'abandonne pas, pratique encore ! 📚",
  // écran de fin commun : score lu par les lecteurs d'écran
  scoreSur: '{bonnes} bonnes réponses sur {total}',
  // fin de la maternelle (étoiles)
  etoiles5: 'Parfait ! Bravo ! 🏆',
  etoiles4: 'Très bien ! 🌟',
  etoiles3: 'Bien ! Continue ! 💪',
  etoiles0: "On va s'entraîner encore ! 📚",
  etoilesSur: '{n} étoiles sur 5',
  // retour de réponse lu par les lecteurs d'écran (QCM, tableau de correction)
  juste: 'Juste',
  faux: 'Faux',
  annuler: '↩ Annuler',
  ecouter: 'Écouter la consigne',
  tempsRestant: 'Temps restant : {n} secondes',
  // mots des fiches
  prenom: 'Prénom',
  date: 'Date',
  corrige: 'Corrigé',
  // marques d'un réglage hors du programme du niveau, après son libellé
  bonus: 'bonus',
  horsProgramme: 'hors programme',
} as const
