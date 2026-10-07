// Textes de l'interface — plus long, plus court (breton). Traduction automatique : les passages marqués « br: à relire » sont à
// faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/longueurs.ts'

export default {
  titre: 'Hiroc’h, berroc’h', // br: à relire
  description: 'Keñveriañ ha renkañ kreionoù', // br: à relire
  niveaux: { ps: '🐣 PS — disheñvel-mat', ms: '🌱 MS — 4 kreion', gs: '🌳 GS — 5 kreion' }, // br: à relire
  modes: { comparer: 'An hirañ, ar berrañ', ranger: 'Renkañ' }, // br: à relire
  consigneLong: 'Stok ouzh ar c’hreion hirañ.', // br: à relire
  consigneCourt: 'Stok ouzh ar c’hreion berrañ.', // br: à relire
  consigneRanger: 'Stok ouzh ar c’hreionoù eus ar berrañ d’an hirañ.', // br: à relire
  regarde: '❌ Sell mat ouzh penn ar c’hreionoù', // br: à relire
  rang: 'Kreion {n}', // br: à relire
} as const satisfies Traductions<typeof fr>
