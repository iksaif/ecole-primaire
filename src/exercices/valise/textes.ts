// La valise — textes de CONTENU : les questions (dites à l'écran, écrites sous la scène de la fiche) et ce que la fiche écrit. Lus par T ; la vue
// passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE sont dans src/langues/<langue>/textes/valise.ts. Le nom des objets (« pommes »)
// vient de l'exercice « compter » (objets.ts) : `{nom}`.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'La valise',
  consigneEcrire: 'Regarde la valise. Compte et écris le nombre dans la case.',
  consigneEntourer: 'Regarde la valise. Compte et entoure le bon nombre.',
  question: {
    ajoute: 'Dans la valise, il y a ces {nom}, et on en met d’autres. Combien y en a-t-il maintenant ?',
    ajouteCache: 'Dans la valise, il y en a autant que de points. Dehors, il y a ces {nom} : on les met dans la valise. Combien y en a-t-il maintenant ?',
    retire: 'Dans la valise, il y a ces {nom}. On enlève ceux qui ont une croix. Combien en reste-t-il ?',
    complete: 'Il en faut {n} dans la valise. Il y a déjà ces {nom}. Combien faut-il en ajouter ?',
  },
}, {
  br: {
    titre: 'Ar valizenn', // br: à relire
    consigneEcrire: 'Sell ouzh ar valizenn. Kont ha skriv an niver er gaoued.', // br: à relire
    consigneEntourer: 'Sell ouzh ar valizenn. Kont ha kelc’h an niver mat.', // br: à relire
    question: {
      ajoute: 'Er valizenn ez eus an traoù-mañ, ha lakaat a reer re all. Pet a zo bremañ ?', // br: à relire
      ajouteCache: 'Er valizenn ez eus kement ha pikoù. Er-maez ez eus an traoù-mañ : lakaat a reer anezho er valizenn. Pet a zo bremañ ?', // br: à relire
      retire: 'Er valizenn ez eus an traoù-mañ. Tennet e vez ar re a zo ur c’hroaz warno. Pet a chom ?', // br: à relire
      complete: 'Ret eo kaout {n} er valizenn. Dija ez eus an traoù-mañ. Pet a rankomp ouzhpennañ ?', // br: à relire
    },
  },
})
