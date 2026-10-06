// Ranger les nombres — textes de CONTENU : ce que la fiche écrit (titre, consignes). Lus par T (fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, consignes et retours du jeu) sont dans
// src/langues/<langue>/textes/ranger.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Ranger les nombres',
  consigne: 'Écris les nombres dans les cases, dans le bon ordre.',
  rangeCroissant: 'Range du plus petit au plus grand',
  rangeDecroissant: 'Range du plus grand au plus petit',
}, {
  br: {
    titre: 'Renkañ an niveroù',
    consigne: 'Skriv an niveroù er c\'haoued, en urzh mat.', // br: à relire
    rangeCroissant: "Renk eus ar bihanañ d'ar brasañ",
    rangeDecroissant: "Renk eus ar brasañ d'ar bihanañ",
  },
})
