// Textes de l'interface — tables de multiplication (breton). Traduction automatique : les passages marqués « br: à relire » sont à
// faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/tables.ts'

export default {
  titre: 'Taolennoù lieskementiñ', // br: à relire (multiplication : « lieskementiñ », comme l’académie de Rennes)
  description: 'En em bleustr war an holl daolennoù',
  tablesAReviser: 'Taolennoù da adwelet',
  toutes: 'An holl',
  mode: 'Mod',
  entrainement: 'Embregerezh',
  entrainementDesc: 'Sell ouzh an daolenn, ha goude respont en urzh', // br: à relire
  aleatoire: 'Dre zegouezh',
  aleatoireDesc: 'Goulennoù kemmesket war an taolennoù dibabet',
  chrono: 'Dae a-enep an amzer', // br: à relire (« défi chrono »)
  chronoDesc: 'Ar muiañ a respontoù mat e 1 munutenn',
  multiplierJusqua: 'Liesaat betek',
  tableN: 'Taolenn {n} / {total}',
  tableDe: 'Taolenn × {n}',
  jeLaConnais: 'Gouzout a ran anezhi → Amprouiñ ! ✔',
  bonnesEn1Min: 'respont mat e 1 munutenn !',
  revoirErreurs: '❌ Adwelet ar fazioù',
  chrono50: '🏆 Souezhus !',
  chrono30: '🌟 Dispar !',
  chrono20: '💪 Mat-tre !',
  chronoBas: "📚 Kendalc'h da embreger !",
  ordreFiche: 'Urzh ar jedadurioù', // br: à relire
  dansLOrdre: 'En urzh',
  melange: 'Kemmesket',
  nbCalculs: 'Niver a jedadurioù', // br: à relire
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  laBonneReponse: '{a} × {b} = {r}',
} satisfies Traductions<typeof fr>
