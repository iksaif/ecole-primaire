// Les formes — textes de CONTENU : le nom des formes (qui suit la langue du contenu), les couleurs de la légende et ce que la fiche écrit
// (titre, consignes). Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages,
// consignes et retours du jeu) sont dans src/langues/<langue>/textes/formes.ts.
// Seules les formes du programme du cycle 1 : disque (forme pleine), carré, triangle, rectangle.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Les formes',
  forme: { disque: 'disque', carre: 'carré', triangle: 'triangle', rectangle: 'rectangle' },
  couleur: { rouge: 'rouge', bleu: 'bleu', vert: 'vert', jaune: 'jaune' },
  consignePS: 'Colorie toutes les formes comme celle-ci.',
  consigne: 'Colorie chaque forme de la bonne couleur.',
  compte: 'Combien y en a-t-il ? Écris le nombre.',
}, {
  br: {
    titre: 'Ar stummoù',
    forme: {
      disque: 'pladenn', // br: à relire (« disque » plein ; kelc'h = cercle)
      carre: 'karrez',
      triangle: "tric'horn",
      rectangle: 'hirgarrez',
    },
    couleur: { rouge: 'ruz', bleu: 'glas', vert: 'gwer', jaune: 'melen' },
    consignePS: 'Liv an holl stummoù evel hemañ.', // br: à relire
    consigne: 'Liv pep stumm gant al liv mat.', // br: à relire
    compte: 'Pet a zo ? Skriv an niver.', // br: à relire
  },
})
