// Textes de l'interface — compter les objets (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire
// vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/compter.ts'

export default {
  titre: 'Kontañ an traoù',
  description: 'Kont ha kav an niver mat',
  jusqua: '{niv} — betek {n}',
  // « pet » + anv unan : Pet aval a zo ?
  combien: 'Pet {nom} a zo ?',
  ilYAvait: '{n} {emoji} a oa',
  reponseFiche: 'War ar fichenn, ar bugel…', // br: à relire
  ecrire: 'a skriv an niver', // br: à relire
  entourer: 'a gromm an niver mat', // br: à relire
} as const satisfies Traductions<typeof fr>
