// Textes de l'interface — Le plus lourd (breton). Traduction automatique : les passages marqués
// « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/lourd.ts'

export default {
  titre: 'Ar pezh a zo ar pounnerañ', // br: à relire
  description: 'Sell ouzh ar valañs : peseurt tra a zo ar pounnerañ, ar skañvañ ? (Da genta gant traoù gwir da bouezañ.)', // br: à relire
  types: 'Pet tra ?', // br: à relire
  deux: 'Daou dra, ur valañs', // br: à relire
  trois: 'Tri zra, daou valañs', // br: à relire
  laBonne: 'Ar pezh e oa : {nom}', // br: à relire
} satisfies Traductions<typeof fr>
