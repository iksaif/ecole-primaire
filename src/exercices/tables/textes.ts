// Tables de multiplication — textes de CONTENU : l'en-tête de la fiche. Lus par T (fiche) ; la vue passe par `traducteur(CONTENU, …)`.
// Les textes de l'INTERFACE (boutons, réglages, jeu) sont dans src/langues/<langue>/textes/tables.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Tables de multiplication',
  pTable: 'Table de {n}',
  pTables: 'Tables : {liste}',
  pJusqua: "× jusqu'à {n}",
  pNbQuestions: '{n} questions',
}, {
  br: {
    titre: 'Taolennoù lieskementiñ', // br: à relire (multiplication : « lieskementiñ », comme l’académie de Rennes)
    pTable: 'Taolenn {n}',
    pTables: 'Taolennoù : {liste}',
    pJusqua: '× betek {n}',
    pNbQuestions: '{n} goulenn',
  },
})
