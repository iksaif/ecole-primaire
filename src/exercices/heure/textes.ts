// Lire l'heure — textes de CONTENU : ce que les fiches et les énoncés écrivent (énoncés, heure dite en lettres, activités, emploi du
// temps, corrigés), en français et en breton. Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les textes de
// l'INTERFACE (boutons, réglages, légendes) sont dans src/langues/<langue>/textes/heure.ts.
//
// Pourquoi des listes en une chaîne (`mots.*`, éléments séparés par « | ») : T ne lit que des textes, pas des listes ; le générateur
// les découpe (oral.ts). Même nombre d'éléments dans les deux langues (tests/heure.test.mjs). L'heure dite à l'oral n'est pas
// composée par une règle de langue dans le code : les mots et les modèles de phrase sont ici, le code ne fait que choisir.
//   mots.heures12  : 13 éléments, indice 0 vide puis 1 → 12 (« trois heures », 12 → « midi »)
//   mots.heures24  : 24 éléments, 0 → 23 (« minuit », « quinze heures »)
//   mots.minutes   : 60 éléments, indice 0 vide puis 1 → 59 (« une », « vingt et une » ; en breton, des chiffres : « 20 munut »)
import { catalogue } from '../../langues/catalogue.ts'

// ── Français : les mots des minutes (1 → 59), au féminin (« une minute ») ──
const UNITES_FR = ['', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze',
  'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const DIZAINES_FR = ['', '', 'vingt', 'trente', 'quarante', 'cinquante']
function minuteFr(n: number): string {
  if (n === 0) return ''
  if (n < 20) return UNITES_FR[n]
  const d = Math.floor(n / 10), u = n % 10
  if (u === 0) return DIZAINES_FR[d]
  return u === 1 ? `${DIZAINES_FR[d]} et une` : `${DIZAINES_FR[d]}-${UNITES_FR[u]}`
}
const MINUTES_FR = Array.from({ length: 60 }, (_, n) => minuteFr(n)).join('|')
const HEURES_FR = ['une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze']
const heures12Fr = ['', ...HEURES_FR.map((h, i) => `${h} heure${i ? 's' : ''}`), 'midi'].join('|')
const heures24Fr = ['minuit', ...HEURES_FR.map((h, i) => `${h} heure${i ? 's' : ''}`), 'midi', 'treize heures', 'quatorze heures', 'quinze heures',
  'seize heures', 'dix-sept heures', 'dix-huit heures', 'dix-neuf heures', 'vingt heures', 'vingt et une heures', 'vingt-deux heures', 'vingt-trois heures'].join('|')

// ── Breton : « teir eur ha kard », minutes en chiffres, nom au singulier ──
const HEURES_BR = ['', 'un eur', 'div eur', 'teir eur', 'peder eur', 'pemp eur', "c'hwec'h eur", 'seizh eur', 'eizh eur', 'nav eur', 'dek eur', 'unnek eur', 'kreisteiz']
const heures12Br = HEURES_BR.join('|')
// pas d'heure « sur 24 h » dite en lettres en breton : l'oral du cadran (le modèle `oral.journee` ne s'en sert pas)
const heures24Br = ['hanternoz', ...HEURES_BR.slice(1), ...HEURES_BR.slice(1, 12)].join('|')
const minutesBr = Array.from({ length: 60 }, (_, n) => (n ? `${n} munut` : '')).join('|')

export const CONTENU = catalogue({
  titre: "Lire l'heure",
  horloge: 'horloge',
  quelleHeure: 'Quelle heure est-il ?',
  debut: 'Début',
  fin: 'Fin',
  activite: 'Activité',
  rappel: 'Rappel',

  // L'heure dite en lettres (modèles de phrase ; {h} : l'heure de `mots.heures12`, {m} : les minutes de `mots.minutes`)
  mots: { heures12: heures12Fr, heures24: heures24Fr, minutes: MINUTES_FR },
  oral: {
    // « trois heures et quart », « quatre heures moins le quart » ; à la minute près (CE2) : « trois heures quarante-sept »
    quart: '{h} et quart',
    demie: '{h} et demie',
    demieMidi: '{h} et demi',
    moinsQuart: '{h} moins le quart',
    apres: '{h} {m}',
    moins: '{h} moins {m}',
    // correction « matin / après-midi » : l'heure sur 24 h en lettres (« quinze heures trente »), puis l'oral du cadran
    journee: '{lettres}, ou {oral}',
  },
  moments: {
    matin: { phrase: "C'est le matin.", suffixe: 'du matin' },
    apresMidi: { phrase: "C'est l'après-midi.", suffixe: "de l'après-midi" },
    soir: { phrase: "C'est le soir.", suffixe: 'du soir' },
  },
  // activités des problèmes de durée (leur genre — `genre` dans generateur.ts — choisit la variante `m` ou `f` des énoncés : « il dure » / « elle dure »)
  activites: {
    dessinAnime: 'Le dessin animé',
    film: 'Le film',
    promenade: 'La promenade',
    match: 'Le match de foot',
    sieste: 'La sieste',
    piqueNique: 'Le pique-nique',
    piscine: 'La séance de piscine',
    gouter: 'Le goûter',
    peinture: "L'atelier de peinture",
  },
  // emploi du temps : le nom de la matière (tableau), et sa forme dans une phrase (« la séance de lecture »)
  matieres: {
    lecture: 'Lecture', maths: 'Mathématiques', anglais: 'Anglais', sport: 'Sport', musique: 'Musique', sciences: 'Sciences',
    dessin: 'Dessin', ecriture: 'Écriture', geographie: 'Géographie',
  },
  matieresPhrase: {
    lecture: 'lecture', maths: 'mathématiques', anglais: 'anglais', sport: 'sport', musique: 'musique', sciences: 'sciences',
    dessin: 'dessin', ecriture: 'écriture', geographie: 'géographie',
  },
  recre: 'Récréation',

  // ─── Questions ───
  lireQ: 'Quelle heure est-il ?',
  placerQ: 'Placer les aiguilles : {ecrit}',
  journeeLireQ: '{phrase} Quelle heure est-il ?',
  journeeChoisirQ: 'Quelle horloge indique {ecrit} ?',
  emploiDebutQ: 'À quelle heure commence la séance de {nom} ?',
  emploiDureeQ: 'Combien de temps dure la séance de {nom} ?',
  emploiDureeRecreQ: 'Combien de temps dure la récréation ?',
  emploiQuoiQ: 'Que fait-on à {ecrit} ?',
  dureeApresQ: 'Il est {debut}. Dans {duree}, quelle heure sera-t-il ?',
  dureeCombienQ: {
    m: '{nom} commence à {debut} et se termine à {fin}. Combien de temps dure-t-il ?',
    f: '{nom} commence à {debut} et se termine à {fin}. Combien de temps dure-t-elle ?',
  },

  // ─── Corrections ───
  lireFaux: '❌ Il est {ecrit}',
  placerFaux: '❌ Regarde les aiguilles vertes : {ecrit}',
  dureeApresFaux: '❌ Il sera {attendu}.',
  dureeCombienFaux: { m: '❌ Il dure {attendu}.', f: '❌ Elle dure {attendu}.' },

  // ─── Fiche ───
  ficheLireConsigne: 'La petite aiguille indique les heures, la grande aiguille indique les minutes.',
  ficheDessineTitre: 'Dessine les aiguilles',
  ficheDessineConsigne: 'Dessine la petite aiguille (heures) et la grande aiguille (minutes).',
  ficheJourneeTitre: "Le matin, l'après-midi, le soir",
  ficheJourneeConsigne: "Écris l'heure comme sur une horloge numérique.",
  ficheDureesTitre: 'Les durées',
  ficheDureeApres: 'Il est {debut}. Dans {duree}, il sera : ________________',
  ficheDureeCombien: {
    m: '{nom} commence à {debut} et se termine à {fin}. Il dure : ________________',
    f: '{nom} commence à {debut} et se termine à {fin}. Elle dure : ________________',
  },
  ficheConversionTitre: 'Heures et minutes',
  ficheEmploiTitre: 'Emploi du temps',
  ficheCorrige: "Corrigé (pour l'adulte)",
  // titres des parties du corrigé
  corrigeLire: "Lis l'heure",
  corrigeJournee: 'Matin / après-midi',
  corrigeDurees: 'Durées',
  corrigeConversions: 'Conversions',
}, {
  // Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
  br: {
    titre: 'Lenn an eur',
    horloge: 'horolaj',
    quelleHeure: 'Pe eur eo ?',
    debut: 'Deroù',
    fin: 'Fin',
    activite: 'Obererezh',
    rappel: "Dalc'h soñj",

    // br: à relire
    mots: { heures12: heures12Br, heures24: heures24Br, minutes: minutesBr },
    oral: {
      quart: '{h} ha kard',   // br: à relire
      demie: '{h} hanter',   // br: à relire
      demieMidi: '{h} hanter',   // br: à relire
      moinsQuart: '{h} nemet kard',   // br: à relire
      apres: '{h} ha {m}',   // br: à relire
      moins: '{h} nemet {m}',   // br: à relire
      journee: '{oral}',   // br: à relire
    },
    // br: à relire (« eizh eur vintin », « teir eur goude merenn », « eizh eur noz »)
    moments: {
      matin: { phrase: 'Mintin eo.', suffixe: 'vintin' },
      apresMidi: { phrase: 'Goude merenn eo.', suffixe: 'goude merenn' },
      soir: { phrase: 'Noz eo.', suffixe: 'noz' },
    },
    // br: à relire
    activites: {
      dessinAnime: 'An tresadenn-vev',
      film: 'Ar film',
      promenade: 'Ar valeadenn',
      match: 'Ar match mell-droad',
      sieste: "Ar c'housk-kreisteiz",
      piqueNique: 'Ar piknik',
      piscine: 'An neuial',
      gouter: 'Ar verenn-vihan',
      peinture: 'An atalier livañ',
    },
    matieres: {
      lecture: 'Lenn', maths: 'Matematikoù', anglais: 'Saozneg', sport: 'Sport', musique: 'Sonerezh', sciences: 'Skiantoù',
      dessin: 'Tresañ', ecriture: 'Skrivañ', geographie: 'Douaroniezh',
    },
    matieresPhrase: {   // br: à relire (même mot que dans le tableau)
      lecture: 'Lenn', maths: 'Matematikoù', anglais: 'Saozneg', sport: 'Sport', musique: 'Sonerezh', sciences: 'Skiantoù',
      dessin: 'Tresañ', ecriture: 'Skrivañ', geographie: 'Douaroniezh',
    },
    recre: 'Diskuizh',

    // ─── Questions ───
    lireQ: 'Pe eur eo ?',
    placerQ: 'Lakaat an nadozioù : {ecrit}',
    journeeLireQ: '{phrase} Pe eur eo ?',
    journeeChoisirQ: 'Peseurt horolaj a ziskouez {ecrit} ?',
    emploiDebutQ: 'Da bet eur e krog ar gentel « {nom} » ?',
    emploiDureeQ: 'Pegeit e pad ar gentel « {nom} » ?',
    emploiDureeRecreQ: 'Pegeit e pad an diskuizh ?',
    emploiQuoiQ: 'Petra a vez graet da {ecrit} ?',
    dureeApresQ: '{debut} eo. A-benn {duree}, pe eur e vo ?',
    // pas de genre à marquer en breton : les variantes `m` et `f` sont identiques
    dureeCombienQ: { m: '{nom} a grog da {debut} hag a echu da {fin}. Pegeit e pad ?', f: '{nom} a grog da {debut} hag a echu da {fin}. Pegeit e pad ?' },

    // ─── Corrections ───
    lireFaux: '❌ {ecrit} eo.',
    placerFaux: '❌ Sell ouzh an nadozioù gwer : {ecrit}',
    dureeApresFaux: '❌ {attendu} e vo.',
    dureeCombienFaux: { m: '❌ Padout a ra {attendu}.', f: '❌ Padout a ra {attendu}.' },

    // ─── Fiche ───
    ficheLireConsigne: 'An nadoz vihan a ziskouez an eurioù, an nadoz vras a ziskouez ar munutoù.',
    ficheDessineTitre: 'Tres an nadozioù',
    ficheDessineConsigne: 'Tres an nadoz vihan (eurioù) hag an nadoz vras (munutoù).',
    ficheJourneeTitre: 'Ar mintin, ar goude merenn, an noz',
    ficheJourneeConsigne: 'Skriv an eur evel war un horolaj niverel.',
    ficheDureesTitre: 'Ar padelezhioù',
    ficheDureeApres: '{debut} eo. A-benn {duree} e vo : ________________',
    ficheDureeCombien: { m: '{nom} a grog da {debut} hag a echu da {fin}. Padout a ra : ________________', f: '{nom} a grog da {debut} hag a echu da {fin}. Padout a ra : ________________' },
    ficheConversionTitre: 'Eurioù ha munutoù',   // br: à relire
    ficheEmploiTitre: 'Implij-amzer',
    ficheCorrige: 'Reizhadenn (evit an dud deuet)',
    corrigeLire: 'Lenn an eur',
    corrigeJournee: 'Mintin / goude merenn',
    corrigeDurees: 'Padelezhioù',   // br: à relire
    corrigeConversions: 'Amdroadurioù',
  },
})
