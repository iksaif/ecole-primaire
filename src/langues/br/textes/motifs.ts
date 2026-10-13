// Textes de l'interface — les motifs (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/motifs.ts'

export default {
  titre: 'Ar patromoù', // br: à relire
  description: "Kenderc'hel ur frizenn a en em adlavar", // br: à relire
  niveau: {
    ps: 'PS — daou dra', // br: à relire
    ms: 'MS — patromoù eeun', // br: à relire
    gs: 'GS — patromoù hiroc’h', // br: à relire
  },
  exercice: 'Poelladenn', // br: à relire
  apres: 'Ha goude ?', // br: à relire
  trou: 'Unan a vank', // br: à relire
  consigneApres: 'Petra a zeu goude ?', // br: à relire
  choixImage: 'Skeudenn {n}', // br: à relire
  consigneTrou: 'Petra a vank er frizenn ?', // br: à relire
  regarde: 'Sell mat ouzh ar pezh a en em adlavar', // br: à relire
  surFiche: 'War ar fichenn, ar bugel…', // br: à relire
  dessine: 'A dresa', // br: à relire
  colorie: 'A liv', // br: à relire
} as const satisfies Traductions<typeof fr>
