// Textes de l'interface — Trier les images (breton). Traduction automatique : les passages marqués
// « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/trier.ts'

export default {
  titre: 'Rummata ar skeudennoù', // br: à relire
  description: 'Laka pep skeudenn er voestad vat', // br: à relire
  themes: 'Petra a fell dit rummata ?', // br: à relire
  groupes: 'Strolladoù (loened, frouezh…)', // br: à relire
  matieres: 'Danvezioù (koad, metal, mezher…)', // br: à relire
  deplacements: 'Penaos e vev al loened', // br: à relire
  mange: 'Ar pezh a zebr al loened', // br: à relire
  laBonne: 'Ar voestad vat : {nom}', // br: à relire
} satisfies Traductions<typeof fr>
