// Textes de l'interface — quiz (breton). Mêmes clés que fr/textes/quiz.ts. Traduction automatique : chaque texte marqué « br: à relire »
// est à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/quiz.ts'

export default {
  titre: 'Kwiz — Sevenadur hollek', // br: à relire
  description: 'Loened, skiantoù, douaroniezh, istor : goulennoù gant dibaboù', // br: à relire
  theme: 'Tem',
  themes: {
    animaux: 'Bed al loened',
    sciences: 'Skiantoù ha natur',
    'geo-france': "Douaroniezh Bro-C'hall",
    'geo-monde': 'Kêrioù-penn ar bed',
    histoire: "Istor Bro-C'hall",
  },
  nbQuestions: 'Niver a goulennoù', // br: à relire
  mauvaise: 'Ar respont mat a oa : {r}.',
  aRetenir: "Da zerc'hel soñj :",
} satisfies Traductions<typeof fr>
