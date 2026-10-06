// Textes de l'interface — comparer les quantités (breton). Traduction automatique : les passages marqués « br: à relire » sont à
// faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/comparer.ts'

export default {
  titre: "Keñveriañ ar c'hementadoù", // br: à relire
  description: 'Peseurt strollad en deus ar muiañ ?',
  jusqua: '{niv} — betek {n}',
  beaucoupPlus: "{niv} — kalz muioc'h", // br: à relire
  consignePS: "E pelec'h ez eus ar muiañ ? Stok ouzh ar strollad.", // br: à relire
  consigne: "Peseurt strollad en deus muioc'h ?",
  aPlus: "Muioc'h gant {g}",
  pareil: 'Kement ha kement', // br: à relire
  memeNombre: 'An daou strollad o deus ar memes niver !',
  groupe: 'Strollad {g}', // br: à relire
} as const satisfies Traductions<typeof fr>
