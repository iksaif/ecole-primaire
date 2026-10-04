// Contenu généré — lire l'heure (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`). Paramètres : voir src/i18n/fr/contenu/heure.js.

// « teir eur ha kard », « div eur hanter », « peder eur nemet kard »,
// « teir eur ha 20 munut », « peder eur nemet 20 munut » (minutes en chiffres, nom au singulier).
const HEURES_BR = ['', 'un eur', 'div eur', 'teir eur', 'peder eur', 'pemp eur', "c'hwec'h eur", 'seizh eur',
  'eizh eur', 'nav eur', 'dek eur', 'unnek eur', 'kreisteiz']

export default {
  // br: à relire
  oral12: ({ h, m }) => {
    const suivante = (h % 12) + 1
    if (m === 0) return HEURES_BR[h]
    if (m === 15) return HEURES_BR[h] + ' ha kard'
    if (m === 30) return HEURES_BR[h] + ' hanter'
    if (m === 45) return HEURES_BR[suivante] + ' nemet kard'
    if (m < 30 || m % 5 !== 0) return `${HEURES_BR[h]} ha ${m} munut`
    return `${HEURES_BR[suivante]} nemet ${60 - m} munut`
  },
  oralMoment: ({ oral, moment }) => (oral.startsWith('kreisteiz') ? oral : `${oral} ${moment.suffixe}`),
  // pas d'heure « sur 24 h » dite en lettres, seulement l'oral du cadran
  oralJournee: ({ oral }) => oral, // br: à relire
  // br: à relire (« eizh eur vintin », « teir eur goude merenn », « eizh eur noz »)
  moments: {
    matin: { phrase: 'Mintin eo.', suffixe: 'vintin' },
    'apres-midi': { phrase: 'Goude merenn eo.', suffixe: 'goude merenn' },
    soir: { phrase: 'Noz eo.', suffixe: 'noz' },
  },
  // br: à relire
  activites: {
    dessinAnime: { nom: 'An tresadenn-vev' },
    film: { nom: 'Ar film' },
    promenade: { nom: 'Ar valeadenn' },
    match: { nom: 'Ar match mell-droad' },
    sieste: { nom: "Ar c'housk-kreisteiz" },
    piqueNique: { nom: 'Ar piknik' },
    piscine: { nom: 'An neuial' },
    gouter: { nom: 'Ar verenn-vihan' },
    peinture: { nom: 'An atalier livañ' },
  },
  matieres: ['Lenn', 'Matematikoù', 'Saozneg', 'Sport', 'Sonerezh', 'Skiantoù', 'Tresañ', 'Skrivañ', 'Douaroniezh'],
  recre: 'Diskuizh',
  horloge: 'horolaj',

  // ─── Questions ───
  lireQ: 'Pe eur eo ?',
  placerQ: 'Lakaat an nadozioù : {ecrit}',
  journeeLireQ: ({ moment }) => `${moment.phrase} Pe eur eo ?`,
  journeeChoisirQ: 'Peseurt horolaj a ziskouez {ecrit} ?',
  emploiDebutQ: 'Da bet eur e krog ar gentel « {nom} » ?',
  emploiDureeQ: 'Pegeit e pad ar gentel « {nom} » ?',
  emploiDureeRecreQ: 'Pegeit e pad an diskuizh ?',
  emploiQuoiQ: 'Petra a vez graet da {ecrit} ?',
  dureeApresQ: '{debut} eo. A-benn {duree}, pe eur e vo ?',
  dureeCombienQ: ({ act, debut, fin }) => `${act.nom} a grog da ${debut} hag a echu da ${fin}. Pegeit e pad ?`,

  // ─── Corrections ───
  lireFaux: '❌ {ecrit} eo.',
  placerFaux: '❌ Sell ouzh an nadozioù gwer : {ecrit}',
  dureeApresFaux: '❌ {attendu} e vo.',
  dureeCombienFaux: '❌ Padout a ra {attendu}.',

  // ─── Fiche ───
  ficheLireConsigne: 'An nadoz vihan a ziskouez an eurioù, an nadoz vras a ziskouez ar munutoù.',
  ficheDessineTitre: 'Tres an nadozioù',
  ficheDessineConsigne: 'Tres an nadoz vihan (eurioù) hag an nadoz vras (munutoù).',
  ficheJourneeTitre: 'Ar mintin, ar goude merenn, an noz',
  ficheJourneeConsigne: 'Skriv an eur evel war un horolaj niverel.',
  ficheDureesTitre: 'Ar padelezhioù',
  ficheDureeApres: '{debut} eo. A-benn {duree} e vo : ________________',
  ficheDureeCombien: ({ act, debut, fin }) => `${act.nom} a grog da ${debut} hag a echu da ${fin}. Padout a ra : ________________`,
  ficheConversionTitre: 'Eurioù, munutoù, eilennoù',
  ficheEmploiTitre: 'Implij-amzer',
  ficheCorrige: 'Reizhadenn (evit an dud deuet)',
  corrigeLire: 'Lenn an eur',
  corrigeJournee: 'Mintin / goude merenn',
  corrigeDurees: 'Padelezhioù', // br: à relire
  corrigeConversions: 'Amdroadurioù',
}
