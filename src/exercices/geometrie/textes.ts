// La géométrie — textes de CONTENU : les noms des figures et des solides, les questions, les consignes, les corrections et ce que la fiche
// écrit. Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, boutons du jeu,
// légende des cases) sont dans src/langues/<langue>/textes/geometrie.ts.
// Paramètres : nom = nom d'une case (« B3 ») ou d'un segment (« [OA] ») ; r, d = longueurs en cm ; n = nombre de cases.
// Pas de liste dans le catalogue : les listes d'autrefois (noms des figures, choix du cercle, vrai / faux) sont des clés une à une.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Géométrie',
  figure: {
    carre: 'carré', rectangle: 'rectangle', triangle: 'triangle',
    triangle_rectangle: 'triangle rectangle', cercle: 'cercle', losange: 'losange',
  },
  solide: { cube: 'cube', pave: 'pavé droit', pyramide: 'pyramide', cylindre: 'cylindre', boule: 'boule', cone: 'cône' },
  oui: 'Oui',
  non: 'Non',

  // ─── Questions ───
  symetrieV: 'Symétrie (axe vertical)',
  symetrieH: 'Symétrie (axe horizontal)',
  reproductionQ: 'Reproduction sur quadrillage',
  colorieQ: 'Colorie la case {nom}',
  lireCaseQ: 'Quelle case est coloriée ?',
  figureNomQ: 'Quel est le nom de cette figure ?',
  figureCotesQ: 'Combien de côtés a cette figure ?',
  figureAngleQ: 'Cette figure a-t-elle au moins un angle droit ?',
  solideNomQ: "Comment s'appelle ce solide ?",
  solideRoulerQ: 'Ce solide peut-il rouler ?',
  solideFacesQ: 'Combien de faces a ce solide ?',
  solideSommetsQ: 'Combien de sommets a ce solide ?',
  anglesQ: 'Quels angles sont droits ?',
  // propriétés des figures : « Vrai ou faux ? » + affirmation, ou question à choix parmi `choixFigure` (dans l'ordre de PROPRIETES, donnees.ts)
  vraiOuFaux: 'Vrai ou faux ?',
  vrai: 'Vrai',
  faux: 'Faux',
  choixFigure: { carre: 'carré', rectangle: 'rectangle', losange: 'losange', triangleRectangle: 'triangle rectangle' },
  propriete: {
    'q-carre': 'Quelle figure a 4 côtés de même longueur et 4 angles droits ?',
    'q-rect': 'Quelle figure a 4 angles droits, mais pas ses 4 côtés de même longueur ?',
    'q-trirect': 'Quelle figure a 3 côtés et un angle droit ?',
    'q-losange': "Quelle figure a 4 côtés de même longueur, mais pas d'angle droit ?",
    'v-carre-ad': 'Un carré a 4 angles droits.',
    'v-carre-cotes': "Les 4 côtés d'un carré ont la même longueur.",
    'v-rect-cotes': 'Un rectangle a toujours ses 4 côtés de la même longueur.',
    'v-rect-opp': 'Dans un rectangle, les côtés opposés ont la même longueur.',
    'v-rect-ad': 'Un rectangle a 4 angles droits.',
    'v-trirect-3': 'Un triangle rectangle a 3 angles droits.',
    'v-trirect-1': 'Un triangle rectangle a un angle droit.',
    'v-carre-rect': 'Un carré est un rectangle particulier.',
    'v-losange-ad': 'Un losange a toujours 4 angles droits.',
    'v-tri-cotes': 'Un triangle a 4 côtés.',
  },
  // cercle : la bonne réponse est « le centre » ; « un rayon », « un diamètre »
  centreChoix: { centre: 'le centre', rayon: 'un rayon', diametre: 'un diamètre', sommet: 'un sommet' },
  centreQ: "Comment s'appelle le point O pour ce cercle ?",
  segmentChoix: { rayon: 'un rayon', diametre: 'un diamètre', cote: 'un côté' },
  segmentQ: "Comment s'appelle le segment rouge {nom} ?",
  lequelRayonQ: 'Quel segment est un rayon du cercle ?',
  lequelDiametreQ: 'Quel segment est un diamètre du cercle ?',
  mesureDiametreQ: 'Le rayon de ce cercle mesure {r} cm. Combien mesure son diamètre ?',
  mesureRayonQ: 'Le diamètre de ce cercle mesure {d} cm. Combien mesure son rayon ?',
  patronQ: 'Ce dessin est-il un patron du cube ? (Imagine que tu le plies.)',

  // ─── Consignes à l'écran ───
  symetrieConsigne: "Colorie les cases pour compléter la figure : elle doit être symétrique par rapport à l'axe rouge.",
  reproductionConsigne: "Reproduis la figure dans la grille de droite, au même endroit. L'étoile ★ t'aide à démarrer.",
  colorieConsigne: 'Colorie la case {nom} (colonne {col}, ligne {ligne}).',
  lireCaseConsigne: 'Quelle case est coloriée ? (la lettre de la colonne, puis le numéro de la ligne)',

  // ─── Corrections ───
  aucun: 'aucun',
  nCases: '{n} cases',
  anglesFaux: '❌ Les angles droits sont : {attendu} (marqués en rouge).',
  anglesAucunFaux: "❌ Cette figure n'a aucun angle droit.",
  reperageFaux: '❌ Tu as colorié {donne}. La bonne case {nom} est entourée en orange.',
  casesJustes: '{justes} / {total} cases justes',
  casesEnTrop: ', {n} en trop',
  // « Presque ! 2 cases oubliées et 1 case en trop. Regarde la correction. »
  presque: 'Presque ! {morceaux}. Regarde la correction.',
  presqueOubliees: { one: '{n} case oubliée', other: '{n} cases oubliées' },
  presqueEnTrop: { one: '{n} case en trop', other: '{n} cases en trop' },
  presqueEt: ' et ',

  // ─── Fiche ───
  ficheSymetrie: 'Symétrie',
  ficheSymetrieConsigne: "Colorie les cases pour que la figure soit symétrique par rapport à l'axe rouge.",
  ficheReproduction: 'Reproduction',
  ficheReproductionConsigne: "Reproduis la figure dans la grille de droite, au même endroit. Le point t'aide à démarrer.",
  ficheReperage: 'Repérage',
  ficheColorie: 'Colorie les cases',
  ficheNomCase: 'Écris le nom de chaque case',
  ficheFigures: 'Figures',
  ficheFiguresConsigne: 'Écris le nom de chaque figure.',
  ficheSolides: 'Solides',
  ficheSolidesConsigne: 'Écris le nom de chaque solide.',
  ficheAngles: 'Angles droits',
  ficheAnglesConsigne: 'Avec ton équerre, cherche les angles droits. Écris leurs lettres (ou « aucun »).',
  ficheVraiFauxTitre: 'Vrai ou faux ?',
  ficheVraiFauxConsigne: 'Entoure la bonne réponse.',
  ficheVraiFaux: 'Vrai — Faux',
  ficheCercle: 'Cercle',
  ficheCercleTrace: 'Avec ton compas, trace un cercle de centre O et de rayon 3 cm.',
  ficheCercleRepasse: 'Repasse en bleu un rayon et en rouge un diamètre.',
  fichePatrons: 'Patrons du cube',
  fichePatronsConsigne: 'Entoure les dessins qui sont des patrons du cube. Tu peux les découper pour vérifier !',
  ficheAvertissement: 'Imprimer à 100 %, sans ajustement à la page : chaque carreau mesure alors 1 cm.',
  // corrigé de la fiche (titres des parties : ceux de la fiche) ; liste = numéros des dessins, dans l'ordre de lecture
  corrigeReproduction: 'la même figure que le modèle, au même endroit (réponse à vérifier sur le quadrillage)',
  corrigeCercle: 'cercle de rayon 3 cm (6 cm de diamètre) — rayon : {rayon} — diamètre : {diametre}',
  corrigePatrons: 'dessins {liste} (en lisant de gauche à droite)',
}, {
  br: {
    titre: 'Mentoniezh',
    figure: {
      carre: 'karrez', rectangle: 'hirgarrez', triangle: "tric'horn",
      triangle_rectangle: "tric'horn skouer", cercle: "kelc'h", losange: 'lozanj', // br: à relire (triangle rectangle)
    },
    // br: à relire (pavé droit : « hirgarrezeg »)
    solide: { cube: 'kub', pave: 'hirgarrezeg', pyramide: 'piramid', cylindre: 'silindr', boule: 'boull', cone: 'kon' },
    oui: 'Ya',
    non: 'Nann',

    symetrieV: 'Kemparzhded (ahel a-serzh)',
    symetrieH: 'Kemparzhded (ahel a-blaen)',
    reproductionQ: "Adtresañ war ar c'harrezennoù",
    colorieQ: 'Liv ar garrezenn {nom}',
    lireCaseQ: 'Peseurt karrezenn a zo livet ?',
    figureNomQ: 'Petra eo anv ar stumm-mañ ?',
    figureCotesQ: 'Pet kostez en deus ar stumm-mañ ?',
    figureAngleQ: "Hag-eñ en deus ar stumm-mañ ur c'horn skouer d'an nebeutañ ?",
    solideNomQ: 'Petra eo anv ar solud-mañ ?',
    solideRoulerQ: "Hag-eñ e c'hall ar solud-mañ ruilhal ?",
    solideFacesQ: 'Pet tal en deus ar solud-mañ ?',
    solideSommetsQ: 'Pet beg en deus ar solud-mañ ?',
    anglesQ: 'Peseurt kornioù a zo skouer ?',
    vraiOuFaux: 'Gwir pe gaou ?',
    vrai: 'Gwir',
    faux: 'Gaou',
    choixFigure: { carre: 'karrez', rectangle: 'hirgarrez', losange: 'lozanj', triangleRectangle: "tric'horn skouer" },
    // br: à relire — mutations après les chiffres non faites : « 4 kostez »
    propriete: {
      'q-carre': 'Peseurt stumm en deus 4 kostez hir kement-ha-kement ha 4 korn skouer ?', // br: à relire
      'q-rect': "Peseurt stumm en deus 4 korn skouer, met n'eo ket hir kement-ha-kement e 4 kostez ?", // br: à relire
      'q-trirect': "Peseurt stumm en deus 3 kostez hag ur c'horn skouer ?", // br: à relire
      'q-losange': 'Peseurt stumm en deus 4 kostez hir kement-ha-kement, met korn skouer ebet ?', // br: à relire
      'v-carre-ad': "Ur c'harrez en deus 4 korn skouer.", // br: à relire
      'v-carre-cotes': "Hir kement-ha-kement eo 4 kostez ur c'harrez.", // br: à relire
      'v-rect-cotes': 'Hir kement-ha-kement eo atav 4 kostez un hirgarrez.', // br: à relire
      'v-rect-opp': "En un hirgarrez, ar c'hostezioù a-dal a zo hir kement-ha-kement.", // br: à relire
      'v-rect-ad': 'Un hirgarrez en deus 4 korn skouer.', // br: à relire
      'v-trirect-3': "Un tric'horn skouer en deus 3 korn skouer.", // br: à relire
      'v-trirect-1': "Un tric'horn skouer en deus ur c'horn skouer.", // br: à relire
      'v-carre-rect': "Ur c'harrez a zo un hirgarrez dibar.", // br: à relire
      'v-losange-ad': 'Ul lozanj en deus atav 4 korn skouer.', // br: à relire
      'v-tri-cotes': "Un tric'horn en deus 4 kostez.", // br: à relire
    },
    centreChoix: { centre: "ar c'hreiz", rayon: 'ur skin', diametre: 'un treuzkiz', sommet: 'ur beg' },
    centreQ: "Petra eo ar poent O evit ar c'helc'h-mañ ?",
    segmentChoix: { rayon: 'ur skin', diametre: 'un treuzkiz', cote: "ur c'hostez" },
    segmentQ: 'Petra eo ar segment ruz {nom} ?',
    lequelRayonQ: "Peseurt segment a zo ur skin eus ar c'helc'h ?",
    lequelDiametreQ: "Peseurt segment a zo un treuzkiz eus ar c'helc'h ?",
    mesureDiametreQ: "Skin ar c'helc'h-mañ a vuzul {r} cm. Pegeit eo e dreuzkiz ?",
    mesureRayonQ: "Treuzkiz ar c'helc'h-mañ a vuzul {d} cm. Pegeit eo e skin ?",
    patronQ: "Hag-eñ eo an tresadenn-mañ ur patrom eus ar c'hub ? (Soñj e plegez anezhañ.)", // br: à relire (patrom)

    symetrieConsigne: "Liv ar c'harrezennoù evit klokaat ar stumm : kemparzhek e rank bezañ e-keñver an ahel ruz.",
    reproductionConsigne: "Adtres ar stumm er gael a-zehou, en hevelep lec'h. Ar steredenn ★ a sikour ac'hanout da gregiñ.",
    colorieConsigne: 'Liv ar garrezenn {nom} (kolonenn {col}, linenn {ligne}).',
    lireCaseConsigne: 'Peseurt karrezenn a zo livet ? (lizherenn ar golonenn, ha goude niverenn al linenn)',

    aucun: 'hini ebet',
    nCases: '{n} karrezenn',
    anglesFaux: "❌ Ar c'hornioù skouer a zo : {attendu} (merket e ruz).",
    anglesAucunFaux: "❌ N'en deus ar stumm-mañ korn skouer ebet.",
    reperageFaux: "❌ Livet ec'h eus {donne}. Ar garrezenn vat {nom} a zo kelc'hiet en orañjez.",
    casesJustes: '{justes} / {total} karrezenn mat',
    casesEnTrop: ', {n} re',
    presque: 'Tost ! {morceaux}. Sell ouzh ar reizhadenn.', // br: à relire
    presqueOubliees: { other: '{n} karrezenn ankouaet' }, // br: à relire
    presqueEnTrop: { other: '{n} karrezenn re' }, // br: à relire
    presqueEt: ' ha ',

    ficheSymetrie: 'Kemparzhded',
    ficheSymetrieConsigne: "Liv ar c'harrezennoù evit ma vo kemparzhek ar stumm e-keñver an ahel ruz.",
    ficheReproduction: 'Adtresañ',
    ficheReproductionConsigne: "Adtres ar stumm er gael a-zehou, en hevelep lec'h. Ar poent a sikour ac'hanout da gregiñ.",
    ficheReperage: "Lec'hiañ",
    ficheColorie: "Liv ar c'harrezennoù",
    ficheNomCase: 'Skriv anv pep karrezenn',
    ficheFigures: 'Stummoù',
    ficheFiguresConsigne: 'Skriv anv pep stumm.',
    ficheSolides: 'Soludoù',
    ficheSolidesConsigne: 'Skriv anv pep solud.',
    ficheAngles: 'Kornioù skouer',
    ficheAnglesConsigne: "Gant da skouer, klask ar c'hornioù skouer. Skriv o lizherennoù (pe « hini ebet »).",
    ficheVraiFauxTitre: 'Gwir pe gaou ?',
    ficheVraiFauxConsigne: "Kelc'hia ar respont mat.",
    ficheVraiFaux: 'Gwir — Gaou',
    ficheCercle: "Kelc'h",
    ficheCercleTrace: "Gant da gelc'hier, tres ur c'helc'h a greiz O hag a skin 3 cm.",
    ficheCercleRepasse: 'Adtremen e glas ur skin hag e ruz un treuzkiz.',
    fichePatrons: "Patromoù ar c'hub",
    fichePatronsConsigne: "Kelc'hia an tresadennoù a zo patromoù ar c'hub. Gallout a rez o didroc'hañ evit gwiriañ !",
    ficheAvertissement: "Moullañ da 100 %, hep azasaat d'ar bajenn : neuze e vuzul pep karrezenn 1 cm.",
    corrigeReproduction: "an hevelep stumm hag ar patrom, en hevelep lec'h (respont da wiriañ war ar gael)", // br: à relire
    corrigeCercle: "kelc'h a skin 3 cm (treuzkiz 6 cm) — skin : {rayon} — treuzkiz : {diametre}", // br: à relire
    corrigePatrons: 'tresadennoù {liste} (o lenn a-gleiz da zehou)', // br: à relire
  },
})
