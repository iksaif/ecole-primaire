// Les motifs — textes de CONTENU : ce que la fiche écrit (titre, consignes). Lus par T (fiche) ; la vue passe par `traducteur(CONTENU, …)`.
// Les textes de l'INTERFACE (réglages, consignes du jeu) sont dans src/langues/<langue>/textes/motifs.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Les motifs',
  consigne: 'Continue chaque collier : dessine ou colle les deux suivants.',
  consigneTrou: 'Dessine ou colle ce qui manque dans chaque collier.',
  consignePS: 'Entoure ce qui vient après.',
}, {
  br: {
    titre: 'Ar patromoù', // br: à relire
    consigne: 'Kendalc’h pep kolier : tres pe peg an daou da heul.', // br: à relire
    consigneTrou: 'Tres pe peg ar pezh a vank e pep kolier.', // br: à relire
    consignePS: 'Grenn ar pezh a zeu goude.', // br: à relire
  },
})
