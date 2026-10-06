// Textes communs aux exercices et aux fiches (breton). Portés à l'identique de src/i18n/br/commun.js. Traduction
// automatique : voir nav.ts ; les passages marqués « br: à relire » sont à faire vérifier par un brittophone.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/communs.ts'

export default {
  commencer: '▶ Kregiñ',
  valider: 'Gwiriañ ✔',
  suivant: "Da-heul ➜",
  quitter: '✕ Kuitaat',
  quitterTitre: 'Kuitaat ar boelladenn',
  rejouer: "🔄 C'hoari en-dro",
  parametres: '⚙️ Arventennoù',
  niveau: 'Live',
  exercices: 'Poelladennoù',
  nbQuestions: "Niver a c'houlennoù",
  question: 'Goulenn {n} / {total}',
  colQuestion: 'Goulenn',
  taReponse: 'Da respont',
  bonneReponse: 'Ar respont mat',
  bravo: ['Brav eo ! 🎉', 'Dispar ! ⭐', 'Mat-tre ! 👏', 'Gwellañ ! 🌟'],
  resultat100: 'Dispar, hep fazi ebet ! 🏆',
  resultat80: 'Mat-tre ! Kendalc\'h evel-se 🌟',
  resultat60: "Mat ! Gallout a rez ober gwelloc'h c'hoazh 💪",
  resultat40: "Kalon vat, kendalc'h da embreger ! 🤓",
  resultat0: "Na ziskoulz ket, kendalc'h da embreger ! 📚",
  scoreSur: '{bonnes} respont mat diwar {total}', // br: à relire
  etoiles5: 'Dispar ! Brav eo ! 🏆',
  etoiles4: 'Mat-tre ! 🌟',
  etoiles3: "Mat ! Kendalc'h ! 💪",
  etoiles0: "Embreger a raimp c'hoazh ! 📚",
  etoilesSur: '{n} steredenn war 5', // br: à relire
  prenom: 'Anv-bihan',
  date: 'Deiziad',
  corrige: 'Reizhadenn',
  bonus: 'bonus', // br: à relire
  horsProgramme: 'er-maez ar programm', // br: à relire
} satisfies Traductions<typeof fr>
