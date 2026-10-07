// Textes de l'interface — les lettres (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/lettres.ts'

export default {
  titre: 'Al lizherennoù',
  description: 'Anaout ha lakaat a-gevret pennlizherennoù ha lizherennoù bihan', // br: à relire
  exercice: 'Poelladenn',
  mode: { reconnaitre: 'Anaout', majuscule: 'Pennlizherenn / Lizherenn vihan' }, // br: à relire
  modeDesc: { reconnaitre: 'Kav al lizherenn a vez diskouezet dit', majuscule: 'Kav stumm all al lizherenn' }, // br: à relire
  lettres: 'Lizherennoù',
  groupe: { voyelles: 'Vogalennoù', consonnes: 'Kensonennoù', toutes: 'An holl' },
  quelleLettre: 'Peseurt lizherenn eo ?',
  quelleMinuscule: 'Pehini eo al lizherenn vihan ?',
  quelleMajuscule: 'Pehini eo ar bennlizherenn ?',
  cetait: '❌ Ar respont mat : {r}',
  noteFiche: 'Fichenn : lak pep pennlizherenn gant he lizherenn vihan.', // br: à relire
} as const satisfies Traductions<typeof fr>
