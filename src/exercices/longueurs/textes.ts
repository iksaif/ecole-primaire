// Plus long, plus court — textes de CONTENU : ce que la fiche écrit (titre, consignes). Lus par T (fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (niveaux, réglages, consignes et retours du jeu) sont dans
// src/langues/<langue>/textes/longueurs.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Plus long, plus court',
  fConsigne: 'Entoure le crayon demandé.',
  fConsigneRanger: 'Numérote les crayons du plus court (1) au plus long.',
  fConsignePS: 'Entoure le crayon le plus long.',
  fLong: 'le plus long',
  fCourt: 'le plus court',
}, {
  br: {
    titre: 'Hiroc’h, berroc’h', // br: à relire
    fConsigne: 'Grenn ar c’hreion goulennet.', // br: à relire
    fConsigneRanger: 'Niverenn ar c’hreionoù eus ar berrañ (1) d’an hirañ.', // br: à relire
    fConsignePS: 'Grenn ar c’hreion hirañ.', // br: à relire
    fLong: 'an hirañ', // br: à relire
    fCourt: 'ar berrañ', // br: à relire
  },
})
