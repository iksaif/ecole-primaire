// Quiz — textes de CONTENU, en français et en breton : le titre et la consigne de la fiche, les noms des thèmes. Les questions sont dans
// questions/ (une banque par langue). Les textes de l'INTERFACE sont dans src/langues/<langue>/textes/quiz.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Quiz — Culture générale',
  consigne: 'Lis chaque question et entoure la bonne réponse.',
  corrige: 'Corrigé',
  theme: {
    animaux: 'Le monde animal',
    sciences: 'Sciences & nature',
    'geo-france': 'Géographie France',
    'geo-monde': 'Capitales du monde',
    histoire: 'Histoire de France',
  },
}, {
  br: {
    titre: 'Kwiz — Sevenadur hollek', // br: à relire
    consigne: 'Lenn pep goulenn ha gromm ar respont mat.', // br: à relire
    corrige: 'Reizhadenn',
    theme: {
      animaux: 'Bed al loened',
      sciences: 'Skiantoù ha natur',
      'geo-france': "Douaroniezh Bro-C'hall",
      'geo-monde': 'Kêrioù-penn ar bed',
      histoire: "Istor Bro-C'hall",
    },
  },
})
