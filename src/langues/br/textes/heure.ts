// Textes de l'interface — lire l'heure (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire
// vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/heure.ts'

export default {
  titre: 'Lenn an eur',
  description: 'Eurioù, hanterioù ha kardoù war un horolaj',
  precision: 'Resisded', // br: à relire
  aideCp: 'Er CP : an eurioù rik hepken, eus 1 eur da 12 eur.', // br: à relire
  aideCe1: "Er CE1 : an eurioù rik, an hanter-eurioù hag ar c'hardoù-eur. Ar 5 munut a zo ur bonus.", // br: à relire
  reponseLire: 'Respont (lenn an eur)',
  propositions4: '4 kinnig',
  jEcris: 'Skrivañ a ran an eur',
  aide: 'Skoazell',
  afficherMinutes: "Diskouez ar munutoù en-dro d'an horolaj",
  nbHorloges: 'Horolajoù dre boelladenn', // br: à relire
  legH: 'nadoz vihan = eurioù',
  legM: 'nadoz vras = munutoù',
  placeAiguilles: 'Lak an nadozioù evit diskouez',
  glisser: 'Rikla an nadozioù gant da viz, pe implij ar boutonoù.', // br: à relire
  petiteAiguille: 'Nadoz vihan (eurioù)',
  grandeAiguille: 'Nadoz vras (munutoù)',
  reculerHeure: 'Lakaat an nadoz vihan un eur war-gil', // br: à relire
  avancerHeure: 'Lakaat an nadoz vihan un eur war-raok', // br: à relire
  reculerMinutes: 'Lakaat an nadoz vras {n} munut war-gil', // br: à relire
  avancerMinutes: 'Lakaat an nadoz vras {n} munut war-raok', // br: à relire
  choixHorloge: 'Horolaj {n}', // br: à relire
  ecrisNumerique: '(skriv anezhi evel war un horolaj niverel)',
  maintenant: 'Bremañ',
  plusTard: "Diwezhatoc'h",
  complete: 'Leunia',
  lisEmploi: 'Lenn an implij-amzer.',
  heures: 'Eurioù', // br: à relire
  minutes: 'Munutoù', // br: à relire
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  exercices: {
    lire: 'Lenn an eur',
    placer: 'Lakaat an nadozioù',
    journee: 'Mintin / goude merenn',
    duree: 'Padelezhioù', // br: à relire
    conversion: 'h ha min', // br: à relire
    emploi: 'Implij-amzer',
  },
  precisions: {
    heure: 'Eurioù rik', // br: à relire
    demi: 'Hanter-eurioù',
    quart: 'Kardoù-eur',
    cinq: '5 munut',
    minute: 'Betek ar munut', // br: à relire
  },
} satisfies Traductions<typeof fr>
