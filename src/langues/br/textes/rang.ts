// Textes de l'interface — Le premier, le dernier (breton). Traduction automatique : les passages marqués
// « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/rang.ts'

export default {
  titre: 'Ar c’hentañ, an diwezhañ', // br: à relire
  description: 'Diskouez ar c’hentañ, an trede, an diwezhañ er renkad', // br: à relire
  jusqua: '{niv} — renkadoù betek {n}', // br: à relire
  laBonne: 'An hini-mañ e oa : {n}', // br: à relire
  place: 'Plas {n}', // br: à relire
} satisfies Traductions<typeof fr>
