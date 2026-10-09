// Comparer les quantités — textes de CONTENU : ce que la fiche écrit (titre, consigne). Lus par T (fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, consignes et retours du jeu) sont dans
// src/langues/<langue>/textes/comparer.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Comparer les quantités',
  consigne: 'Dans chaque ligne, entoure le groupe qui a le plus.',
}, {
  br: {
    titre: "Keñveriañ ar c'hementadoù", // br: à relire
    consigne: "War pep linenn, kelc'h ar strollad en deus muioc'h.", // br: à relire
  },
})
