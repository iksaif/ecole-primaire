// Textes de l'interface — La valise (breton). Traduction automatique : les passages marqués
// « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/valise.ts'

export default {
  titre: 'Ar valizenn', // br: à relire
  description: 'Serriñ a ra ar valizenn : pet pluchenn a zo e-barzh ?', // br: à relire
  types: 'Peseurt kudennoù ?', // br: à relire
  ajoute: 'Lakaat a reer', // br: à relire
  retire: 'Tennañ a reer', // br: à relire
  complete: 'Pet lakaat ?', // br: à relire
  initial: 'Pet d’an deroù ?', // br: à relire
  reponseFiche: 'War ar follenn, ar bugel…', // br: à relire
  ecrire: 'a skriv an niver', // br: à relire
  entourer: 'a gelc’h an niver mat', // br: à relire
  laReponse: 'An respont : {n}', // br: à relire
} satisfies Traductions<typeof fr>
