// Textes de l'interface — navigation (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/nav.ts'

export default {
  accueil: 'Degemer',
  reglages: 'Arventennoù',
  apropos: 'Diwar-benn',
  telechargements: 'Da voullañ', // br: à relire
  nouveautes: 'Nevezentioù', // br: à relire
  dev: 'Diorren', // br: à relire
  langueRegionale: 'Yezh rannvroel',
  toutes: 'An holl',
} satisfies Traductions<typeof fr>
