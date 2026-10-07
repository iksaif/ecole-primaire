// Textes de l'interface — problèmes (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire
// vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/problemes.ts'

export default {
  titre: 'Kudennoù', // br: à relire
  description: 'Lenn, kompren ha jediñ', // br: à relire
  typesProblemes: 'Seurtoù kudennoù', // br: à relire
  nombres: 'Niveroù', // br: à relire
  jusqua: 'Betek {n}', // br: à relire
  nbProblemes: 'Niver a gudennoù', // br: à relire
  passer: 'Tremen ⏭', // br: à relire
  passe: '(tremenet)', // br: à relire
  laBonneReponse: 'Ar respont mat a oa {r}', // br: à relire
  cat_ajoutRetrait: '➕➖ Ouzhpennañ / lemel', // br: à relire
  cat_comparaison: '⚖️ Keñveriañ', // br: à relire
  cat_partiesTout: '🧺 Lodennoù hag an holl', // br: à relire
  cat_multiplication: '✖️ Liesadenn', // br: à relire
  cat_partage: '🍰 Rannañ / strollañ', // br: à relire
  cat_foisPlus: '🔁 « Gwech kement »', // br: à relire
  cat_deuxEtapes: '🪜 Meur a bazenn', // br: à relire
} satisfies Traductions<typeof fr>
