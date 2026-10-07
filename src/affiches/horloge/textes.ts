// Les textes de l'affiche de l'horloge, par langue de la feuille (une langue par feuille), lus avec T(clé) :
//   titre, titre.<variante> (le titre de la feuille), variante.<id>.court|titre|description : la convention des affiches ;
//   legende.<id>.a|b : une ligne de la légende (a : en couleur, b : la suite) ; moment.<id> : les moments de la journée du CP.
// L'heure dite en lettres vient de « Lire l'heure » (src/exercices/heure/textes.ts). Breton : chaque texte est à faire relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: "L'horloge",
    'titre.heures': "L'horloge : les heures",
    'titre.quarts': "L'horloge : quarts et demies",
    'titre.minutes': "L'horloge : les heures et les minutes",
    'variante.heures.court': 'Horloge : heures',
    'variante.heures.titre': "Affiche de l'horloge : lire les heures entières",
    'variante.heures.description': "L'horloge à aiguilles pour lire et positionner les heures entières, avec des moments de la journée (programme du CP).",
    'variante.quarts.court': 'Horloge : quarts et demies',
    'variante.quarts.titre': "Affiche de l'horloge : et quart, et demie, moins le quart",
    'variante.quarts.description': "L'horloge à aiguilles pour lire les heures entières, les demi-heures et les quarts d'heure, avec les heures de l'après-midi (programme du CE1).",
    'variante.minutes.court': 'Horloge : minutes',
    'variante.minutes.titre': "Affiche de l'horloge : heures, minutes, quart et demie",
    'variante.minutes.description': "L'horloge avec les minutes, « et quart », « et demie » et « moins le quart », et l'affichage numérique 24 h (programme du CE2).",
    'legende.petite.a': "L'aiguille courte, rouge,", 'legende.petite.b': 'dit l\'heure',
    'legende.grandeHeures.a': "L'aiguille longue, bleue,", 'legende.grandeHeures.b': "est sur le 12 : c'est une heure pile",
    'legende.matin.a': 'Le matin', 'legende.matin.b': '7 h, 8 h… midi (12 h)',
    'legende.soir.a': 'Le soir', 'legende.soir.b': '9 h du soir = 21 h',
    'legende.grandeQuarts.a': "L'aiguille longue, bleue,", 'legende.grandeQuarts.b': "sur le 12 : l'heure pile",
    'legende.sur3.a': 'Sur le 3', 'legende.sur3.b': '… et quart',
    'legende.sur6.a': 'Sur le 6', 'legende.sur6.b': '… et demie',
    'legende.sur9.a': 'Sur le 9', 'legende.sur9.b': '… moins le quart',
    'legende.vert.a': 'Chiffres en vert', 'legende.vert.b': 'après-midi : 13 h = 1 h',
    'legende.grandeMinutes.a': "L'aiguille longue, bleue,", 'legende.grandeMinutes.b': 'indique les minutes',
    'legende.heure60.a': 'Une heure', 'legende.heure60.b': '60 minutes',
    'legende.quartHeure.a': "Un quart d'heure", 'legende.quartHeure.b': '15 minutes',
    'legende.demiHeure.a': 'Une demi-heure', 'legende.demiHeure.b': '30 minutes',
    'moment.leve': 'Je me lève',
    'moment.ecole': "Je vais à l'école",
    'moment.mange': 'Je mange',
    'moment.couche': 'Je me couche (le soir)',
  },
  br: {
    titre: 'An horolaj', // br: à relire
    'titre.heures': 'An horolaj : an eurioù', // br: à relire
    'titre.quarts': 'An horolaj : kardoù ha hanterioù', // br: à relire
    'titre.minutes': 'An horolaj : an eurioù hag ar munutennoù', // br: à relire
    'variante.heures.court': 'Horolaj : eurioù', // br: à relire
    'variante.heures.titre': 'Skritell an horolaj : lenn an eurioù klok', // br: à relire
    'variante.heures.description': "An horolaj gant biroù evit lenn ha lakaat an eurioù klok, gant mare an deiz (programm ar CP).", // br: à relire
    'variante.quarts.court': 'Horolaj : kardoù ha hanterioù', // br: à relire
    'variante.quarts.titre': 'Skritell an horolaj : ha kard, ha hanter, nemet ar c’hard', // br: à relire
    'variante.quarts.description': "An horolaj gant biroù evit lenn an eurioù klok, an hanteroù-eurioù hag ar c'hardoù-eur, gant eurioù ar goude merenn (programm ar CE1).", // br: à relire
    'variante.minutes.court': 'Horolaj : munutennoù', // br: à relire
    'variante.minutes.titre': 'Skritell an horolaj : eurioù, munutennoù, kard ha hanter', // br: à relire
    'variante.minutes.description': "An horolaj gant ar munutennoù, « ha kard », « ha hanter » ha « nemet ar c'hard », hag an diskouez niverel 24 eur (programm ar CE2).", // br: à relire
    'legende.petite.a': 'Ar bir verr, ruz,', 'legende.petite.b': 'a ziskouez an eurioù', // br: à relire
    'legende.grandeHeures.a': 'Ar bir hir, glas,', 'legende.grandeHeures.b': 'a zo war ar 12 : eur klok eo', // br: à relire
    'legende.matin.a': 'Ar mintin', 'legende.matin.b': '7 e, 8 e… kreisteiz (12 e)', // br: à relire
    'legende.soir.a': 'An noz', 'legende.soir.b': '9 eur noz = 21 e', // br: à relire
    'legende.grandeQuarts.a': 'Ar bir hir, glas,', 'legende.grandeQuarts.b': 'war ar 12 : eur klok', // br: à relire
    'legende.sur3.a': 'War ar 3', 'legende.sur3.b': '… ha kard', // br: à relire
    'legende.sur6.a': 'War ar 6', 'legende.sur6.b': '… hanter', // br: à relire
    'legende.sur9.a': 'War ar 9', 'legende.sur9.b': "… nemet ar c'hard", // br: à relire
    'legende.vert.a': 'Sifroù gwer', 'legende.vert.b': 'goude merenn : 13 e = 1 eur', // br: à relire
    'legende.grandeMinutes.a': 'Ar bir hir, glas,', 'legende.grandeMinutes.b': 'a ziskouez ar munutennoù', // br: à relire
    'legende.heure60.a': 'Un eur', 'legende.heure60.b': '60 munutenn', // br: à relire
    'legende.quartHeure.a': "Ur c'hard-eur", 'legende.quartHeure.b': '15 munutenn', // br: à relire
    'legende.demiHeure.a': 'Un hanter-eur', 'legende.demiHeure.b': '30 munutenn', // br: à relire
    'moment.leve': "Sevel a ran", // br: à relire
    'moment.ecole': "Mont a ran d'ar skol", // br: à relire
    'moment.mange': 'Debriñ a ran', // br: à relire
    'moment.couche': 'Mont a ran da gousket (da noz)', // br: à relire
  },
}
