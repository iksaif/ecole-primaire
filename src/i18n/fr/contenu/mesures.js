// Contenu généré — mesures (français) : consignes, explications, objets, calendrier, fiche.
// Mêmes clés que src/i18n/br/contenu/mesures.js (vérifier avec `npm run i18n`).
// Paramètres : longueurs et masses déjà écrites (« 3 cm 5 mm », « 500 g ») ; n, d1, d2… = nombres ;
// jour, mois = noms tirés de `jours` et `mois` ; date, date1, date2 = dates écrites avec la clé `date`.
import { regles } from '../../regles.js'

const R = regles('fr')
const nb = R.nombre

export default {
  // « Une pomme pèse 150 … » : la phrase se lit « texte valeur unité »
  phrases: {
    crayon: 'Un crayon mesure',
    gomme: 'Une gomme mesure',
    cahier: "La largeur d'un cahier est de",
    cuillere: 'Une petite cuillère mesure',
    porte: "La hauteur d'une porte est de",
    piscine: "La longueur d'une piscine est de",
    arbre: 'Un grand arbre mesure',
    classe: "La longueur d'une salle de classe est de",
    parisMarseille: 'La distance entre Paris et Marseille est de',
    voitureHeure: 'En une heure, une voiture roule',
    villes: 'La distance entre deux villes voisines est de',
    pomme: 'Une pomme pèse',
    gommeMasse: 'Une gomme pèse',
    stylo: 'Un stylo pèse',
    chocolat: 'Une tablette de chocolat pèse',
    enfant: 'Un enfant de 7 ans pèse',
    chien: 'Un chien pèse',
    pasteque: 'Une pastèque pèse',
    voiture: 'Une voiture pèse',
    baignoire: 'Une baignoire contient',
    seau: 'Un seau contient',
    arrosoir: 'Un arrosoir contient',
    aquarium: 'Un aquarium contient',
    bouteille: "Une grande bouteille d'eau contient",
    brique: 'Une brique de lait contient',
    piscineGonflable: 'Une piscine gonflable contient',
    fourmi: 'Une fourmi mesure',
    piece: "L'épaisseur d'une pièce de 1 € est de",
    cahierEpaisseur: "L'épaisseur d'un cahier est de",
    canette: 'Une canette de jus de fruits contient',
    verre: "Un verre d'eau contient",
    bol: 'Un bol contient',
    yaourt: 'Un pot de yaourt contient',
    tasse: 'Une tasse contient',
  },
  // objets posés sur la balance
  objetsMasse: {
    paquet: 'le paquet', cadeau: 'le cadeau', ours: "l'ours en peluche",
    bonbon: 'le bonbon', cle: 'la clé', clementine: 'la clémentine',
    pasteque: 'la pastèque', citrouille: 'la citrouille',
  },
  boites: { rouge: 'La boîte rouge', bleue: 'La boîte bleue', verte: 'La boîte verte', jaune: 'La boîte jaune' },
  jours: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
  mois: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
    'septembre', 'octobre', 'novembre', 'décembre'],
  // descriptions des dessins (lecteurs d'écran)
  ariaRegle: 'Règle graduée',
  ariaBalance: 'Balance à plateaux',
  ariaBroc: 'Broc gradué',
  ariaBouteilles: 'Bouteilles et seau',
  // « 1 m = 100 cm, donc 3 m = 300 cm. »
  donc: 'donc',
  completeQ: 'Complète.',

  // ─── Règle ───
  regleMmQ: 'Combien mesure le segment rouge, en millimètres ?',
  regleMmTexte: 'Segment de {s} cm à {e} sur la règle',
  // s : début en cm, e : fin (« 7 cm 4 mm »), L : longueur écrite en cm et mm, mm : longueur en mm
  regleMmExpl: ({ s, e, L, mm }) => (s === 0
    ? `Le segment commence à 0 et finit à ${e}.`
    : `Le segment commence à ${s} cm et finit à ${e} : il mesure ${L}.`) + ` 1 cm = 10 mm, donc ${L} = ${mm} mm.`,
  regleQ: 'Combien mesure le segment rouge ?',
  regleTexte: 'Segment de {s} à {e} sur la règle',
  regleExpl: ({ s, e, L }) => (s === 0
    ? `Le segment commence à 0 et finit à ${e} : il mesure ${L} cm.`
    : `Le segment commence à ${s} et finit à ${e} : ${e} − ${s} = ${L} cm. On peut aussi compter les centimètres entre ${s} et ${e}.`),

  // ─── Unités, comparaisons ───
  uniteQ: 'Choisis la bonne unité.',
  comparerQ: 'Compare avec <, = ou >.',
  comparerExpl: 'On compare dans la même unité : {A} = {vA} {u}. {vG} {u} {sym} {vD} {u}.',

  // ─── Masses ───
  // n : objet de `objetsMasse`
  masseMixQ: 'La balance est en équilibre. Combien pèse {n}, en grammes ?',
  masseEqQ: 'La balance est en équilibre. Combien pèse {n} ?',
  masseEqExpl: 'La balance est en équilibre : {n} pèse autant que les masses.',
  balance: 'Balance',
  boitesQ: 'Regarde la balance. Quelle boîte est la plus lourde ?',
  boitesTexte: '{b1} ou {b2} ?',
  boitesExpl: "Le plateau qui descend porte l'objet le plus lourd (même s'il est plus petit !).",
  seuilPlus: 'Plus de {x}',
  seuilMoins: 'Moins de {x}',
  seuilQ: 'Le paquet pèse-t-il plus ou moins de {x} ?',
  seuilTexte: 'Paquet face à {x}',
  seuilExplPlus: 'Le plateau du paquet descend : le paquet est plus lourd que {x}.',
  seuilExplMoins: 'Le plateau du paquet monte : le paquet est plus léger que {x}.',

  // ─── Contenances ───
  brocQL: "Combien de litres d'eau y a-t-il dans le broc ?",
  brocQdL: "Combien de décilitres d'eau y a-t-il dans le broc ?",
  brocTexte: "Broc gradué jusqu'à {max} {u}",
  brocExpl: "L'eau arrive au trait « {k} {u} ».",
  verresQ: 'Un verre contient {c} cL. Combien de verres faut-il pour remplir une bouteille de {b} L ?',
  // unité de la réponse (toujours plusieurs verres)
  verres: 'verres',
  verresTexte: 'Verres de {c} cL pour {b} L',
  verresExpl: 'il faut {n} verres',
  // « 3 bouteilles de 2 L »
  bouteilles: ({ n, l }) => `${nb(n, 'bouteille')} de ${l} L`,
  bouteillesQ: 'On vide toutes ces bouteilles dans le seau : il est plein ! Combien de litres contient le seau ?',
  bouteillesTexte: '{n2} bouteille(s) de 2 L et {n1} de 1 L',

  // ─── Calendrier ───
  aujourdhui: "Aujourd'hui, nous sommes {jour}.",
  nJours: ({ n }) => nb(n, 'jour'),
  date: 'le {d} {mois}',
  memeJour: 'Une semaine = 7 jours : on retombe sur le même jour !',
  demainQ: '{auj} Quel jour serons-nous demain ?',
  hierQ: '{auj} Quel jour étions-nous hier ?',
  demainTexte: "Aujourd'hui {jour} → demain ?",
  hierTexte: "Aujourd'hui {jour} → hier ?",
  joursSemaineExpl: 'Les jours de la semaine : {liste}.',
  dansNQ: '{auj} Quel jour serons-nous dans {n} jours ?',
  // au-delà d'une semaine
  dansNExplSemaine: ({ jour, n, r }) => `Dans 7 jours (une semaine), on est encore ${jour}. Encore ${nb(n - 7, 'jour')} : ${r}.`,
  dansNExpl: 'On compte {n} jours : {chemin}.',
  semaineQ: '{auj} Quel jour serons-nous dans une semaine ?',
  semaineTexte: '{jour} + 1 semaine ?',
  moisApresQ: 'Quel mois vient juste après {mois} ?',
  moisAvantQ: 'Quel mois vient juste avant {mois} ?',
  moisApresTexte: 'Mois après {mois}',
  moisAvantTexte: 'Mois avant {mois}',
  moisAnneeListe: "Les mois de l'année : {liste}.",
  numMoisQ: ({ mois }) => `Janvier est le mois n° 1. Quel est le numéro du mois ${R.de(mois)} ?`,
  numMoisTexte: ({ mois }) => `Numéro du mois ${R.de(mois)}`,
  uniteJours: 'jours',
  uniteSemaines: 'semaines',
  uniteMois: 'mois',
  semainesJoursAff: ({ n }) => `${nb(n, 'semaine')} = ? jours`,
  semainesJoursExpl: ({ n }) => (n === 1 ? '1 semaine = 7 jours.' : `1 semaine = 7 jours, donc ${n} semaines = ${Array(n).fill(7).join(' + ')} = ${7 * n} jours.`),
  joursSemainesAff: '{j} jours = ? semaines',
  nSemaines: '{n} semaines',
  joursSemainesExpl: '1 semaine = 7 jours. {n} × 7 = {j}, donc {j} jours = {n} semaines.',
  fevrier: '28 ou 29',
  joursMoisQ: ({ mois }) => `Combien de jours y a-t-il dans le mois ${R.de(mois)} ?`,
  joursMoisAttendu: '{r} jours',
  joursMoisTexte: ({ mois }) => `Jours du mois ${R.de(mois)}`,
  joursMoisExplFevrier: 'Février a 28 jours, et 29 jours les années bissextiles (une fois tous les 4 ans).',
  joursMoisExpl: ({ mois, r }) => `${mois[0].toUpperCase() + mois.slice(1)} a ${r} jours. Astuce : compte sur les bosses de tes poings !`,
  dansJoursQ: "Aujourd'hui, nous sommes {date1}. Dans combien de jours serons-nous {date2} ?",
  dansJoursTexte: 'Du {d1} au {d2} {mois}',
  dansJoursExpl: '{d2} − {d1} = {n} : il reste {n} jours.',
  // unité de la réponse « Le … 12 mars »
  dateDansUnite: '{mois}',
  dateDansQ: ({ date, n }) => `Nous sommes ${date}. Quelle date serons-nous dans ${n === 1 ? 'une semaine' : 'deux semaines'} ? Le …`,
  dateDansTexte: ({ d1, mois, n }) => `${d1} ${mois} + ${nb(n, 'semaine')}`,
  dateDansExpl: ({ n, d1, d2 }) => `${n === 1 ? '1 semaine = 7 jours' : '2 semaines = 14 jours'} : ${d1} + ${7 * n} = ${d2}.`,
  moisAnneeQ: 'Combien y a-t-il de mois dans une année ?',
  moisAnneeAttendu: '12 mois',
  moisAnneeTexte: 'Mois dans une année',
  moisAnneeExpl: 'Une année = 12 mois : {liste}.',

  // ─── Fiche ───
  ficheReponse: 'Réponse',
  ficheEntoure: 'Entoure',
  ficheTrace: 'Trace un segment de',
  ficheMesureMm: 'Mesure chaque segment avec ta règle (en cm et mm)',
  ficheMesure: 'Mesure chaque segment avec ta règle',
  ficheTraceTitre: 'Trace avec ta règle',
  ficheConversion: '🔁 Complète les conversions',
  ficheUnite: 'Écris la bonne unité',
  ficheComparer: '🟰 Compare avec &lt;, = ou &gt;',
  ficheMasse: '⚖️ Les masses',
  ficheContenance: '🥛 Les contenances',
  ficheCalendrier: '📅 Le calendrier',
  ficheTemoin: 'Pour le parent : ce trait gradué doit mesurer exactement 10 cm.',
  // corrigé : liste = longueurs à tracer
  corrigeTrace: '{liste} (à vérifier avec la règle)',
}
