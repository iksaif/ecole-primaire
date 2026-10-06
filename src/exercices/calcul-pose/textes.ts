// Calcul posé — textes de CONTENU : l'en-tête de la fiche (titre, opérations, nombre d'exercices). Lus par T (fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (boutons, réglages, jeu) sont dans src/langues/<langue>/textes/calculPose.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Calcul posé',
  additions: 'Additions',
  soustractions: 'Soustractions',
  multiplications: 'Multiplications',
  melange: 'Mélangé',
  pNbExercices: '{n} exercices',
}, {
  br: {
    titre: 'Jedadur lakaet', // br: à relire (« calcul posé »)
    additions: 'Sammadennoù',
    soustractions: 'Lamadennoù',
    multiplications: 'Liesadennoù', // br: à relire
    melange: 'Kemmesket',
    pNbExercices: '{n} poelladenn',
  },
})
