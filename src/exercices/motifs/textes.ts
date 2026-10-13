// Les motifs — textes de CONTENU : ce que la fiche écrit (titre, consignes). Lus par T (fiche) ; la vue passe par `traducteur(CONTENU, …)`.
// Les textes de l'INTERFACE (réglages, consignes du jeu) sont dans src/langues/<langue>/textes/motifs.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Les motifs',
  consigne: 'Continue chaque frise : dessine ce qui vient dans chaque case.',
  consigneTrou: 'Dessine ce qui manque dans chaque frise.',
  consigneColorie: 'Continue chaque frise : colorie chaque case de la bonne couleur.',
  consigneColorieTrou: 'Colorie la case vide de la bonne couleur.',
  consigneDecoupe: 'Lignes marquées ✂ : découpe les images du bas de la feuille et colle-les.',
  aDecouper: 'À découper',
  consignePS: 'Entoure ce qui vient après.',
  consignePSTrou: 'Entoure ce qui manque.',
}, {
  br: {
    titre: 'Ar patromoù', // br: à relire
    consigne: 'Kendalc’h pep frizenn : tres ar pezh a zeu e pep kombod.', // br: à relire
    consigneTrou: 'Tres ar pezh a vank e pep frizenn.', // br: à relire
    consigneColorie: 'Kendalc’h pep frizenn : liv pep kombod gant al liv mat.', // br: à relire
    consigneColorieTrou: 'Liv ar c’hombod goullo gant al liv mat.', // br: à relire
    consigneDecoupe: 'Linennoù merket gant ✂ : troc’h ar skeudennoù e traoñ ar follenn ha peg anezho.', // br: à relire
    aDecouper: 'Da droc’hañ', // br: à relire
    consignePS: 'Grenn ar pezh a zeu goude.', // br: à relire
    consignePSTrou: 'Grenn ar pezh a vank.', // br: à relire
  },
})
