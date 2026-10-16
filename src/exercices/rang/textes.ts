// Le premier, le dernier — textes de CONTENU : la consigne dite, les ordinaux, ce que la fiche écrit. Lus par T ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE sont dans src/langues/<langue>/textes/rang.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Le premier, le dernier',
  montre: 'Montre le {mot}, en partant de la flèche.',
  consigneFiche: 'Dans chaque file, colorie la case de l’objet que l’adulte te dit, en partant de la flèche.',
  colorie: 'Colorie le {mot}.',
  corrigeCase: 'le {mot} : la case {n}',
  ordinal: {
    premier: 'premier', deuxieme: 'deuxième', troisieme: 'troisième', quatrieme: 'quatrième', cinquieme: 'cinquième', sixieme: 'sixième',
    septieme: 'septième', huitieme: 'huitième', neuvieme: 'neuvième', dixieme: 'dixième', dernier: 'dernier', avantDernier: 'avant-dernier',
  },
}, {
  br: {
    titre: 'Ar c’hentañ, an diwezhañ', // br: à relire
    montre: 'Diskouez ar {mot}, o kregiñ gant ar benn.', // br: à relire
    consigneFiche: 'E pep renkad, liv ar gael eus an tra a lâr an hini deuet da oad dit, o kregiñ gant ar benn.', // br: à relire
    colorie: 'Liv ar {mot}.', // br: à relire
    corrigeCase: 'ar {mot} : ar gael {n}', // br: à relire
    ordinal: {
      premier: 'kentañ', deuxieme: 'eil', troisieme: 'trede', quatrieme: 'pevare', cinquieme: 'pempvet', sixieme: 'c’hwec’hvet', // br: à relire
      septieme: 'seizhvet', huitieme: 'eizhvet', neuvieme: 'navet', dixieme: 'dekvet', dernier: 'diwezhañ', avantDernier: 'diwezhañ nemet unan', // br: à relire
    },
  },
})
