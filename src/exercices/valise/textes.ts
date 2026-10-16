// La valise — textes de CONTENU : la question de chaque sorte de problème (dite à l'écran, écrite sous la bande de la fiche) et ce que la fiche écrit.
// Quelques mots chacune : la bande se lit de gauche à droite sans consigne. Lus par T ; la vue passe par `traducteur(CONTENU, …)`. Les textes de
// l'INTERFACE sont dans src/langues/<langue>/textes/valise.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'La valise',
  consigneEcrire: 'Regarde les images de gauche à droite. Écris le nombre dans la case.',
  consigneEntourer: 'Regarde les images de gauche à droite. Entoure le bon nombre.',
  question: {
    ajoute: 'Combien y en a-t-il maintenant ?',
    retire: 'Combien en reste-t-il ?',
    complete: 'Combien faut-il en mettre ?',
    initial: 'Combien y en avait-il au début ?',
  },
}, {
  br: {
    titre: 'Ar valizenn', // br: à relire
    consigneEcrire: 'Sell ouzh ar skeudennoù a-gleiz da zehoù. Skriv an niver er gaoued.', // br: à relire
    consigneEntourer: 'Sell ouzh ar skeudennoù a-gleiz da zehoù. Kelc’h an niver mat.', // br: à relire
    question: {
      ajoute: 'Pet a zo bremañ ?', // br: à relire
      retire: 'Pet a chom ?', // br: à relire
      complete: 'Pet a rank lakaat ?', // br: à relire
      initial: 'Pet a oa d’an deroù ?', // br: à relire
    },
  },
})
