// Textes de l'interface — calcul mental (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire
// vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/calculMental.ts'

export default {
  titre: 'Jediñ e penn',
  description: 'Sammadennoù, lamadennoù, doubl, hanter, taolennoù', // br: à relire
  operations: 'Oberiadurioù',
  tables: 'Taolennoù', // br: à relire
  nbCalculsFiche: 'Niver a jedadurioù war ar fichenn', // br: à relire
  tempsParQuestion: 'Amzer evit pep goulenn',
  sansLimite: 'Hep bevenn',
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  laBonneReponse: 'Ar respont mat a oa {r}',
  tempsEcoule: '⏰ Echu eo an amzer ! Ar respont a oa {r}',
} satisfies Traductions<typeof fr>
