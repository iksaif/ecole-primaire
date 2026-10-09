// Textes de l'interface — les mesures (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier
// par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/mesures.ts'

export default {
  titre: 'Muzulioù',
  description: "Hirderioù, pouezioù, endalc'hioù, deiziadur",
  segmentsRegle: 'Segmantoù war ar reolenn', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
  commencent0: 'A grog e 0',
  pasToujours0: 'Ne gregont ket atav e 0',
  nbSegments: 'Segmantoù da vuzuliañ war ar fichenn', // br: à relire
  rappel100: "Moullit da 100 % (« ment wir »), hep azasaat d'ar bajenn, a-hend-all ne vo ket mat hirder ar segmantoù.", // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  exercices: {
    regle: '📏 Muzuliañ gant ar reolenn',
    unite: '🤔 An unanenn a-zere',
    conversion: '🔁 Amdroadurioù',
    comparer: '🟰 Keñveriañ',
    masse: '⚖️ Pouezioù (balañs)',
    contenance: "🥛 Endalc'hioù",
    calendrier: '📅 Deiziadur (er-maez eus ar programm matematik)', // br: à relire
  },
} as const satisfies Traductions<typeof fr>
