// Contenu généré — lire l'heure (français) : énoncés, heure dite en lettres, données, fiche.
// Mêmes clés que src/i18n/br/contenu/heure.js (vérifier avec `npm run i18n`).
// Paramètres : ecrit, debut, fin, duree = heures déjà écrites (« 3 h 05 », « 1 h 30 min ») ;
// h (1 → 12 ou 0 → 23), m = heure et minutes ; nom = matière ; act = activité de `activites`.

const HEURES_MOTS = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt',
  'vingt et une', 'vingt-deux', 'vingt-trois']
const UNITES_MOTS = ['', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const DIZAINES_MOTS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante']

// Minutes en lettres (1 → 59) : « une », « vingt et une », « quarante-sept »
function minutesMots(n) {
  if (n < 20) return UNITES_MOTS[n]
  const d = Math.floor(n / 10), u = n % 10
  if (u === 0) return DIZAINES_MOTS[d]
  if (u === 1) return DIZAINES_MOTS[d] + ' et une'
  return DIZAINES_MOTS[d] + '-' + UNITES_MOTS[u]
}
// 12 se dit « midi » (ou « minuit »)
function nomHeure12(h) {
  if (h === 12) return 'midi'
  return HEURES_MOTS[h] + (h === 1 ? ' heure' : ' heures')
}

export default {
  // Heure sur un cadran (1 → 12) dite « à l'ancienne » : « trois heures et quart », « quatre heures moins le quart ».
  // À la minute près (CE2), on dit « trois heures quarante-sept » au-delà de la demie.
  oral12: ({ h, m }) => {
    const suivante = (h % 12) + 1
    if (m === 0) return nomHeure12(h)
    if (m === 15) return nomHeure12(h) + ' et quart'
    if (m === 30) return nomHeure12(h) + (h === 12 ? ' et demi' : ' et demie')
    if (m === 45) return nomHeure12(suivante) + ' moins le quart'
    if (m < 30 || m % 5 !== 0) return nomHeure12(h) + ' ' + minutesMots(m)
    return nomHeure12(suivante) + ' moins ' + minutesMots(60 - m)
  },
  // « trois heures et quart de l'après-midi » ; pas de suffixe si l'on dit « midi » (11 h 45 → « midi moins le quart »)
  oralMoment: ({ oral, moment }) => (oral.startsWith('midi') ? oral : `${oral} ${moment.suffixe}`),
  // correction « matin / après-midi » : heure sur 24 h en lettres (« quinze heures trente »), puis l'oral du cadran
  oralJournee: ({ h, m, oral }) => {
    const base = h === 0 ? 'minuit' : h === 12 ? 'midi' : HEURES_MOTS[h] + (h === 1 ? ' heure' : ' heures')
    return `${m === 0 ? base : base + ' ' + minutesMots(m)}, ou ${oral}`
  },
  moments: {
    matin: { phrase: "C'est le matin.", suffixe: 'du matin' },
    'apres-midi': { phrase: "C'est l'après-midi.", suffixe: "de l'après-midi" },
    soir: { phrase: "C'est le soir.", suffixe: 'du soir' },
  },
  // activités des problèmes de durée (pronom : « il dure » / « elle dure »)
  activites: {
    dessinAnime: { nom: 'Le dessin animé', pronom: 'il' },
    film: { nom: 'Le film', pronom: 'il' },
    promenade: { nom: 'La promenade', pronom: 'elle' },
    match: { nom: 'Le match de foot', pronom: 'il' },
    sieste: { nom: 'La sieste', pronom: 'elle' },
    piqueNique: { nom: 'Le pique-nique', pronom: 'il' },
    piscine: { nom: 'La séance de piscine', pronom: 'elle' },
    gouter: { nom: 'Le goûter', pronom: 'il' },
    peinture: { nom: "L'atelier de peinture", pronom: 'il' },
  },
  // emploi du temps
  matieres: ['Lecture', 'Mathématiques', 'Anglais', 'Sport', 'Musique', 'Sciences', 'Dessin', 'Écriture', 'Géographie'],
  recre: 'Récréation',
  horloge: 'horloge',

  // ─── Questions ───
  lireQ: 'Quelle heure est-il ?',
  placerQ: 'Placer les aiguilles : {ecrit}',
  journeeLireQ: ({ moment }) => `${moment.phrase} Quelle heure est-il ?`,
  journeeChoisirQ: 'Quelle horloge indique {ecrit} ?',
  emploiDebutQ: ({ nom }) => `À quelle heure commence la séance de ${nom.toLowerCase()} ?`,
  emploiDureeQ: ({ nom }) => `Combien de temps dure la séance de ${nom.toLowerCase()} ?`,
  emploiDureeRecreQ: 'Combien de temps dure la récréation ?',
  emploiQuoiQ: 'Que fait-on à {ecrit} ?',
  dureeApresQ: 'Il est {debut}. Dans {duree}, quelle heure sera-t-il ?',
  dureeCombienQ: ({ act, debut, fin }) => `${act.nom} commence à ${debut} et se termine à ${fin}. Combien de temps dure-t-${act.pronom} ?`,

  // ─── Corrections ───
  lireFaux: '❌ Il est {ecrit}',
  placerFaux: '❌ Regarde les aiguilles vertes : {ecrit}',
  dureeApresFaux: '❌ Il sera {attendu}.',
  dureeCombienFaux: ({ act, attendu }) => `❌ ${act.pronom === 'elle' ? 'Elle' : 'Il'} dure ${attendu}.`,

  // ─── Fiche ───
  ficheLireConsigne: 'La petite aiguille indique les heures, la grande aiguille indique les minutes.',
  ficheDessineTitre: 'Dessine les aiguilles',
  ficheDessineConsigne: 'Dessine la petite aiguille (heures) et la grande aiguille (minutes).',
  ficheJourneeTitre: "Le matin, l'après-midi, le soir",
  ficheJourneeConsigne: "Écris l'heure comme sur une horloge numérique.",
  ficheDureesTitre: 'Les durées',
  ficheDureeApres: 'Il est {debut}. Dans {duree}, il sera : ________________',
  ficheDureeCombien: ({ act, debut, fin }) => `${act.nom} commence à ${debut} et se termine à ${fin}. ${act.pronom === 'elle' ? 'Elle' : 'Il'} dure : ________________`,
  ficheConversionTitre: 'Heures et minutes',
  ficheEmploiTitre: 'Emploi du temps',
  ficheCorrige: "Corrigé (pour l'adulte)",
  // titres des parties du corrigé
  corrigeLire: "Lis l'heure",
  corrigeJournee: 'Matin / après-midi',
  corrigeDurees: 'Durées',
  corrigeConversions: 'Conversions',
}
