// Les mesures — textes de CONTENU : ce que les énoncés, les explications et la fiche écrivent. Lus par T (générateurs, fiche) ; la vue
// passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, boutons, retours du jeu) sont dans
// src/langues/<langue>/textes/mesures.ts.
//
// Paramètres : longueurs et masses déjà écrites (« 3 cm 5 mm », « 500 g ») ; n, d1, d2… = nombres ; jour, mois = noms tirés de `jours` et
// `mois` ; moisDe = le mois après « de » (« d'avril ») ; date, date1, date2 = dates écrites avec la clé `date`.
// Les listes sont des chaînes séparées par « | » (T ne lit que des textes ; le générateur les découpe, calendrier.ts) : `jours` (lundi →
// dimanche), `mois` (janvier → décembre), `moisDe` (la même liste avec « de » ou « d' » : en breton la liste ne change pas).
// Les accords (« 1 jour », « 3 jours ») sont des pluriels `{ one, other }` lus avec le paramètre `n`.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Mesures',
  // « et » devant un nombre ; « ou » ; « donc » dans « 1 m = 100 cm, donc 3 m = 300 cm. »
  et: 'et',
  ou: 'ou',
  donc: 'donc',
  completeQ: 'Complète.',
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
  jours: 'lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche',
  mois: 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre',
  moisDe: 'de janvier|de février|de mars|d\'avril|de mai|de juin|de juillet|d\'août|de septembre|d\'octobre|de novembre|de décembre',
  // descriptions des dessins (lecteurs d'écran)
  ariaRegle: 'Règle graduée',
  ariaBalance: 'Balance à plateaux',
  ariaBroc: 'Broc gradué',
  ariaBouteilles: 'Bouteilles et seau',

  // ─── Règle ───
  regleMmQ: 'Combien mesure le segment rouge, en millimètres ?',
  regleMmTexte: 'Segment de {s} cm à {e} sur la règle',
  // s : début en cm, e : fin (« 7 cm 4 mm »), L : longueur écrite en cm et mm, mm : longueur en mm
  regleMmExpl0: 'Le segment commence à 0 et finit à {e}. 1 cm = 10 mm, donc {L} = {mm} mm.',
  regleMmExplDecale: 'Le segment commence à {s} cm et finit à {e} : il mesure {L}. 1 cm = 10 mm, donc {L} = {mm} mm.',
  regleQ: 'Combien mesure le segment rouge ?',
  regleTexte: 'Segment de {s} à {e} sur la règle',
  regleExpl0: 'Le segment commence à 0 et finit à {e} : il mesure {L} cm.',
  regleExplDecale: 'Le segment commence à {s} et finit à {e} : {e} − {s} = {L} cm. On peut aussi compter les centimètres entre {s} et {e}.',

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
  bouteilles: { one: '{n} bouteille de {l} L', other: '{n} bouteilles de {l} L' },
  bouteillesQ: 'On vide toutes ces bouteilles dans le seau : il est plein ! Combien de litres contient le seau ?',
  bouteillesTexte: '{n2} bouteille(s) de 2 L et {n1} de 1 L',

  // ─── Calendrier ───
  aujourdhui: "Aujourd'hui, nous sommes {jour}.",
  nJours: { one: '{n} jour', other: '{n} jours' },
  date: 'le {d} {mois}',
  memeJour: 'Une semaine = 7 jours : on retombe sur le même jour !',
  demainQ: '{auj} Quel jour serons-nous demain ?',
  hierQ: '{auj} Quel jour étions-nous hier ?',
  demainTexte: "Aujourd'hui {jour} → demain ?",
  hierTexte: "Aujourd'hui {jour} → hier ?",
  joursSemaineExpl: 'Les jours de la semaine : {liste}.',
  dansNQ: '{auj} Quel jour serons-nous dans {n} jours ?',
  // au-delà d'une semaine ; reste : les jours en plus, déjà écrits (« 2 jours »)
  dansNExplSemaine: 'Dans 7 jours (une semaine), on est encore {jour}. Encore {reste} : {r}.',
  dansNExpl: 'On compte {n} jours : {chemin}.',
  semaineQ: '{auj} Quel jour serons-nous dans une semaine ?',
  semaineTexte: '{jour} + 1 semaine ?',
  moisApresQ: 'Quel mois vient juste après {mois} ?',
  moisAvantQ: 'Quel mois vient juste avant {mois} ?',
  moisApresTexte: 'Mois après {mois}',
  moisAvantTexte: 'Mois avant {mois}',
  moisAnneeListe: "Les mois de l'année : {liste}.",
  numMoisQ: 'Janvier est le mois n° 1. Quel est le numéro du mois {moisDe} ?',
  numMoisTexte: 'Numéro du mois {moisDe}',
  uniteJours: 'jours',
  uniteSemaines: 'semaines',
  uniteMois: 'mois',
  semainesJoursAff: { one: '{n} semaine = ? jours', other: '{n} semaines = ? jours' },
  // somme : « 7 + 7 », total : 7 × n
  semainesJoursExpl: { one: '1 semaine = 7 jours.', other: '1 semaine = 7 jours, donc {n} semaines = {somme} = {total} jours.' },
  joursSemainesAff: '{j} jours = ? semaines',
  nSemaines: '{n} semaines',
  joursSemainesExpl: '1 semaine = 7 jours. {n} × 7 = {j}, donc {j} jours = {n} semaines.',
  fevrier: '28 ou 29',
  joursMoisQ: 'Combien de jours y a-t-il dans le mois {moisDe} ?',
  joursMoisAttendu: '{r} jours',
  joursMoisTexte: 'Jours du mois {moisDe}',
  joursMoisExplFevrier: 'Février a 28 jours, et 29 jours les années bissextiles (une fois tous les 4 ans).',
  // Mois : le nom du mois avec une majuscule
  joursMoisExpl: '{Mois} a {r} jours. Astuce : compte sur les bosses de tes poings !',
  dansJoursQ: "Aujourd'hui, nous sommes {date1}. Dans combien de jours serons-nous {date2} ?",
  dansJoursTexte: 'Du {d1} au {d2} {mois}',
  dansJoursExpl: '{d2} − {d1} = {n} : il reste {n} jours.',
  // unité de la réponse « Le … 12 mars »
  dateDansUnite: '{mois}',
  dateDansQ: {
    one: 'Nous sommes {date}. Quelle date serons-nous dans une semaine ? Le …',
    other: 'Nous sommes {date}. Quelle date serons-nous dans deux semaines ? Le …',
  },
  dateDansTexte: { one: '{d1} {mois} + {n} semaine', other: '{d1} {mois} + {n} semaines' },
  // s : 7 × n
  dateDansExpl: { one: '1 semaine = 7 jours : {d1} + {s} = {d2}.', other: '2 semaines = 14 jours : {d1} + {s} = {d2}.' },
  moisAnneeQ: 'Combien y a-t-il de mois dans une année ?',
  moisAnneeAttendu: '12 mois',
  moisAnneeTexte: 'Mois dans une année',
  moisAnneeExpl: 'Une année = 12 mois : {liste}.',

  // ─── Fiche ───
  ficheReponse: 'Réponse',
  ficheEntoure: 'Entoure :',
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
}, {
  br: {
    titre: 'Muzulioù',
    et: 'ha',
    ou: 'pe',
    donc: 'neuze',
    completeQ: 'Klok.', // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    phrases: { // br: à relire
      crayon: "Ur c'hreion a vuzul",
      gomme: 'Ur gomenn a vuzul',
      cahier: "Ledander ur c'haier :",
      cuillere: 'Ul loa vihan a vuzul',
      porte: 'Uhelder un nor :',
      piscine: 'Hirder ur poull-neuial :',
      arbre: 'Ur wezenn vras a vuzul',
      classe: 'Hirder ur sal-klas :',
      parisMarseille: 'Ar pellder etre Pariz ha Marseilh :',
      voitureHeure: 'En un eur, ur wetur a ra',
      villes: 'Ar pellder etre div gêr amezek :',
      pomme: 'Un aval a bouez',
      gommeMasse: 'Ur gomenn a bouez',
      stylo: 'Ur bluenn a bouez',
      chocolat: 'Un dablezenn chokolad a bouez',
      enfant: 'Ur bugel 7 vloaz a bouez',
      chien: "Ur c'hi a bouez",
      pasteque: 'Ur melon-dour a bouez',
      voiture: 'Ur wetur a bouez',
      baignoire: "Ur gibell a zalc'h",
      seau: "Ur sailh a zalc'h",
      arrosoir: "Un arroser a zalc'h",
      aquarium: "Un akwariom a zalc'h",
      bouteille: "Ur voutailh dour vras a zalc'h",
      brique: "Ur brikenn laezh a zalc'h",
      piscineGonflable: "Ur poull-neuial c'hwezhet a zalc'h",
      fourmi: 'Ur verienn a vuzul',
      piece: 'Tevder ur pezh 1 € :',
      cahierEpaisseur: "Tevder ur c'haier :",
      canette: "Ur voestig chug frouezh a zalc'h",
      verre: "Ur werennad dour a zalc'h",
      bol: "Ur bolenn a zalc'h",
      yaourt: "Ur pod yaourt a zalc'h",
      tasse: "Un dasenn a zalc'h",
    },
    objetsMasse: { // br: à relire
      paquet: 'ar pakad', cadeau: 'ar prof', ours: 'an arzh pluch',
      bonbon: 'ar bonbon', cle: "an alc'hwez", clementine: 'ar vandarinenn',
      pasteque: 'ar melon-dour', citrouille: 'ar sitrouilhenn',
    },
    boites: { rouge: 'Ar voest ruz', bleue: "Ar voest c'hlas", verte: 'Ar voest wer', jaune: 'Ar voest velen' },
    // formes adverbiales « dilun… » (« Hiziv eo dilun ») — br: à relire
    jours: "dilun|dimeurzh|dimerc'her|diriaou|digwener|disadorn|disul", // br: à relire
    mois: "Genver|C'hwevrer|Meurzh|Ebrel|Mae|Mezheven|Gouere|Eost|Gwengolo|Here|Du|Kerzu",
    // en breton, pas de « de » devant le mois : la liste est celle des mois
    moisDe: "Genver|C'hwevrer|Meurzh|Ebrel|Mae|Mezheven|Gouere|Eost|Gwengolo|Here|Du|Kerzu",
    ariaRegle: 'Reolenn derezennet',
    ariaBalance: 'Balañs',
    ariaBroc: 'Pod derezennet',
    ariaBouteilles: 'Boutailhoù ha sailh',

    regleMmQ: 'Pegeit eo ar segmant ruz, e milimetroù ?', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleMmTexte: 'Segmant eus {s} cm betek {e} war ar reolenn', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleMmExpl0: 'Kregiñ a ra ar segmant e 0 hag echuiñ a ra e {e}. 1 cm = 10 mm, neuze {L} = {mm} mm.', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleMmExplDecale: 'Kregiñ a ra ar segmant e {s} cm hag echuiñ a ra e {e} : {L} eo e hirder. 1 cm = 10 mm, neuze {L} = {mm} mm.', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleQ: 'Pegeit eo ar segmant ruz ?', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleTexte: 'Segmant eus {s} betek {e} war ar reolenn', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleExpl0: 'Kregiñ a ra ar segmant e 0 hag echuiñ a ra e {e} : {L} cm eo e hirder.', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    regleExplDecale: "Kregiñ a ra ar segmant e {s} hag echuiñ a ra e {e} : {e} − {s} = {L} cm. Gallout a reer ivez kontañ ar c'hantimetroù etre {s} ha {e}.", // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)

    uniteQ: 'Dibab an unanenn vat.',
    comparerQ: 'Keñveria gant <, = pe >.',
    comparerExpl: 'Keñveriañ a reer gant an hevelep unanenn : {A} = {vA} {u}. {vG} {u} {sym} {vD} {u}.',

    masseMixQ: 'Kempouez eo ar balañs. Pegement e pouez {n}, e gramoù ?',
    masseEqQ: 'Kempouez eo ar balañs. Pegement e pouez {n} ?',
    masseEqExpl: 'Kempouez eo ar balañs : {n} a bouez kement hag ar pouezioù.',
    balance: 'Balañs',
    boitesQ: 'Sell ouzh ar balañs. Peseurt boest eo ar pounnerañ ?',
    boitesTexte: '{b1} pe {b2} ?',
    boitesExpl: "Ar plad a ziskenn a zoug an tra pounnerañ (ha pa vefe bihanoc'h !).",
    seuilPlus: "Muioc'h eget {x}",
    seuilMoins: "Nebeutoc'h eget {x}",
    seuilQ: "Hag-eñ e pouez ar pakad muioc'h pe nebeutoc'h eget {x} ?",
    seuilTexte: 'Pakad e-keñver {x}',
    seuilExplPlus: "Diskenn a ra plad ar pakad : pounneroc'h eo ar pakad eget {x}.",
    seuilExplMoins: "Pignat a ra plad ar pakad : skañvoc'h eo ar pakad eget {x}.",

    brocQL: 'Pet litr dour a zo er pod ?',
    brocQdL: 'Pet desilitr dour a zo er pod ?',
    brocTexte: 'Pod derezennet betek {max} {u}',
    brocExpl: 'Betek ar merk « {k} {u} » emañ an dour.',
    verresQ: "Ur werenn a zalc'h {c} cL. Pet gwerenn a zo ezhomm evit leuniañ ur voutailh {b} L ?",
    verres: 'gwerenn',
    verresTexte: 'Gwerennoù {c} cL evit {b} L',
    verresExpl: '{n} gwerenn a zo ezhomm',
    bouteilles: { other: '{n} boutailh {l} L' },
    bouteillesQ: "Skarzhet e vez an holl voutailhoù-se er sailh : leun eo ! Pet litr a zalc'h ar sailh ?",
    bouteillesTexte: '{n2} boutailh 2 L ha {n1} boutailh 1 L',

    // dates « an 12 a viz Here » — br: à relire
    aujourdhui: 'Hiziv eo {jour}.',
    nJours: { other: '{n} devezh' },
    date: 'an {d} a viz {mois}', // br: à relire
    memeJour: 'Ur sizhun = 7 devezh : adkavout a reer an hevelep devezh !',
    demainQ: "{auj} Pe zevezh e vo warc'hoazh ?",
    hierQ: "{auj} Pe zevezh e oa dec'h ?",
    demainTexte: "Hiziv {jour} → warc'hoazh ?",
    hierTexte: "Hiziv {jour} → dec'h ?",
    joursSemaineExpl: 'Devezhioù ar sizhun : {liste}.',
    dansNQ: '{auj} Pe zevezh e vo a-benn {n} devezh ?',
    dansNExplSemaine: "A-benn 7 devezh (ur sizhun), {jour} e vo c'hoazh. {reste} ouzhpenn : {r}.",
    dansNExpl: 'Kontañ a reer {n} devezh : {chemin}.',
    semaineQ: '{auj} Pe zevezh e vo a-benn ur sizhun ?',
    semaineTexte: '{jour} + 1 sizhun ?',
    moisApresQ: "Pe viz a zeu war-lerc'h miz {mois} ?",
    moisAvantQ: 'Pe viz a zeu a-raok miz {mois} ?',
    moisApresTexte: "Miz war-lerc'h {mois}",
    moisAvantTexte: 'Miz a-raok {mois}',
    moisAnneeListe: 'Mizioù ar bloaz : {liste}.',
    numMoisQ: 'Genver eo ar miz niverenn 1. Pe niverenn en deus miz {mois} ?',
    numMoisTexte: 'Niverenn miz {mois}',
    uniteJours: 'devezh',
    uniteSemaines: 'sizhun',
    uniteMois: 'miz',
    semainesJoursAff: { other: '{n} sizhun = ? devezh' },
    semainesJoursExpl: { one: '1 sizhun = 7 devezh.', other: '1 sizhun = 7 devezh, neuze {n} sizhun = {somme} = {total} devezh.' },
    joursSemainesAff: '{j} devezh = ? sizhun',
    nSemaines: '{n} sizhun',
    joursSemainesExpl: '1 sizhun = 7 devezh. {n} × 7 = {j}, neuze {j} devezh = {n} sizhun.',
    fevrier: '28 pe 29',
    joursMoisQ: 'Pet devezh a zo e miz {mois} ?',
    joursMoisAttendu: '{r} devezh',
    joursMoisTexte: 'Devezhioù miz {mois}',
    joursMoisExplFevrier: "28 devezh en deus C'hwevrer, ha 29 devezh er bloavezhioù bisextil (ur wech bep 4 bloaz).",
    joursMoisExpl: '{r} devezh en deus {mois}. Tun : kont war mellou da zaouarn serret !',
    dansJoursQ: 'Hiziv eo {date1}. A-benn pet devezh e vo {date2} ?',
    dansJoursTexte: 'Eus an {d1} betek an {d2} a viz {mois}',
    dansJoursExpl: '{d2} − {d1} = {n} : {n} devezh a chom.',
    dateDansUnite: 'a viz {mois}',
    dateDansQ: {
      one: 'Hiziv eo {date}. Pe zeiziad e vo a-benn ur sizhun ? An …',
      other: 'Hiziv eo {date}. Pe zeiziad e vo a-benn div sizhun ? An …',
    },
    dateDansTexte: { other: '{d1} {mois} + {n} sizhun' },
    dateDansExpl: { one: '1 sizhun = 7 devezh : {d1} + {s} = {d2}.', other: '2 sizhun = 14 devezh : {d1} + {s} = {d2}.' },
    moisAnneeQ: 'Pet miz a zo en ur bloavezh ?',
    moisAnneeAttendu: '12 miz',
    moisAnneeTexte: 'Mizioù en ur bloavezh',
    moisAnneeExpl: 'Ur bloavezh = 12 miz : {liste}.',

    ficheReponse: 'Respont',
    ficheEntoure: "Kelc'h :", // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    ficheTrace: 'Tres ur segmant hir a', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    ficheMesureMm: 'Muzulia pep segmant gant da reolenn (e cm hag e mm)', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    ficheMesure: 'Muzulia pep segmant gant da reolenn', // br: à relire (Termofis via Geriafurch : « segmant », « nadoz » ; académie de Rennes : « Tres »)
    ficheTraceTitre: 'Tres gant da reolenn',
    ficheConversion: '🔁 Klok an amdroadurioù', // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
    ficheUnite: 'Skriv an unanenn vat',
    ficheComparer: '🟰 Keñveria gant &lt;, = pe &gt;',
    ficheMasse: '⚖️ Ar pouezioù',
    ficheContenance: "🥛 An endalc'hioù",
    ficheCalendrier: '📅 An deiziadur',
    ficheTemoin: 'Evit an dud : 10 cm resis a rank muzuliañ al linenn derezennet-mañ.',
    corrigeTrace: '{liste} (da wiriañ gant ar reolenn)', // br: à relire
  },
})
