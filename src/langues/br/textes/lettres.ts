// Textes de l'interface — les lettres (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/lettres.ts'

export default {
  titre: 'Al lizherennoù',
  description: 'Anaout al lizherennoù hag o lakaat a-gevret e pennlizherenn, e skript hag e stag', // br: à relire
  exercice: 'Poelladenn',
  mode: { reconnaitre: 'Selaou ha kav', majuscule: 'Lak ar skriturioù a-gevret' }, // br: à relire
  modeDesc: { reconnaitre: 'Anv ul lizherenn a vez lavaret, diskouez anezhi', majuscule: 'Kav an hevelep lizherenn en ur skritur all' }, // br: à relire
  lettres: 'Lizherennoù',
  groupe: { voyelles: 'Vogalennoù', consonnes: 'Kensonennoù', toutes: 'An holl' },
  ecritures: 'Skriturioù', // br: à relire
  ecriture: { 'capitale-script': 'Pennlizherenn ha skript (A, a)', 'script-cursive': 'Skript ha stag' }, // br: à relire
  en: { capitale: 'e pennlizherenn', script: 'e skript', cursive: 'e stag' }, // br: à relire
  montreMoi: 'Diskouez din al lizherenn {l}.', // br: à relire
  ecouteEtTrouve: 'Selaou, ha diskouez al lizherenn.', // br: à relire
  trouveEn: 'Kav al lizherenn-mañ {en}.', // br: à relire
  cEst: 'Al lizherenn {l} eo.', // br: à relire
  cetait: '❌ Ar respont mat : {r}',
  noteFiche: 'Fichenn : lak pep pennlizherenn gant he lizherenn vihan.', // br: à relire
} as const satisfies Traductions<typeof fr>
