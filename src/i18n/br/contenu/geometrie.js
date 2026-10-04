// Contenu généré — géométrie (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`). Paramètres : voir src/i18n/fr/contenu/geometrie.js.

export default {
  figures: {
    carre: 'karrez', rectangle: 'hirgarrez', triangle: "tric'horn",
    triangle_rectangle: "tric'horn skouer", cercle: "kelc'h", losange: 'lozanj', // br: à relire (triangle rectangle)
  },
  // br: à relire (pavé droit : « hirgarrezeg »)
  solides: { cube: 'kub', pave: 'hirgarrezeg', pyramide: 'piramid', cylindre: 'silindr', boule: 'boull', cone: 'kon' },

  // ─── Questions ───
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
  vraiFaux: ['Gwir', 'Gaou'],
  choixFigures: ['karrez', 'hirgarrez', 'lozanj', "tric'horn skouer"],
  // br: à relire — mutations après les chiffres non faites : « 4 kostez »
  proprietes: {
    'q-carre': 'Peseurt stumm en deus 4 kostez hir kement-ha-kement ha 4 korn skouer ?',
    'q-rect': "Peseurt stumm en deus 4 korn skouer, met n'eo ket hir kement-ha-kement e 4 kostez ?",
    'q-trirect': "Peseurt stumm en deus 3 kostez hag ur c'horn skouer ?",
    'q-losange': 'Peseurt stumm en deus 4 kostez hir kement-ha-kement, met korn skouer ebet ?',
    'v-carre-ad': "Ur c'harrez en deus 4 korn skouer.",
    'v-carre-cotes': "Hir kement-ha-kement eo 4 kostez ur c'harrez.",
    'v-rect-cotes': 'Hir kement-ha-kement eo atav 4 kostez un hirgarrez.',
    'v-rect-opp': "En un hirgarrez, ar c'hostezioù a-dal a zo hir kement-ha-kement.",
    'v-rect-ad': 'Un hirgarrez en deus 4 korn skouer.',
    'v-trirect-3': "Un tric'horn skouer en deus 3 korn skouer.",
    'v-trirect-1': "Un tric'horn skouer en deus ur c'horn skouer.",
    'v-carre-rect': "Ur c'harrez a zo un hirgarrez dibar.",
    'v-losange-ad': 'Ul lozanj en deus atav 4 korn skouer.',
    'v-tri-cotes': "Un tric'horn en deus 4 kostez.",
  },
  centreChoix: ["ar c'hreiz", 'ur skin', 'un treuzkiz', 'ur beg'],
  centreQ: "Petra eo ar poent O evit ar c'helc'h-mañ ?",
  segmentChoix: ['ur skin', 'un treuzkiz', "ur c'hostez"],
  segmentQ: 'Petra eo ar segment ruz {nom} ?',
  lequelRayonQ: "Peseurt segment a zo ur skin eus ar c'helc'h ?",
  lequelDiametreQ: "Peseurt segment a zo un treuzkiz eus ar c'helc'h ?",
  mesureDiametreQ: "Skin ar c'helc'h-mañ a vuzul {r} cm. Pegeit eo e dreuzkiz ?",
  mesureRayonQ: "Treuzkiz ar c'helc'h-mañ a vuzul {d} cm. Pegeit eo e skin ?",
  patronQ: "Hag-eñ eo an tresadenn-mañ ur patrom eus ar c'hub ? (Soñj e plegez anezhañ.)", // br: à relire (patrom)

  // ─── Consignes à l'écran ───
  symetrieConsigne: "Liv ar c'harrezennoù evit klokaat ar stumm : kemparzhek e rank bezañ e-keñver an ahel ruz.",
  reproductionConsigne: "Adtres ar stumm er gael a-zehou, en hevelep lec'h. Ar steredenn ★ a sikour ac'hanout da gregiñ.",
  colorieConsigne: 'Liv ar garrezenn {nom} (kolonenn {col}, linenn {ligne}).',
  lireCaseConsigne: 'Peseurt karrezenn a zo livet ? (lizherenn ar golonenn, ha goude niverenn al linenn)',

  // ─── Corrections ───
  aucun: 'hini ebet',
  nCases: '{n} karrezenn',
  anglesFaux: "❌ Ar c'hornioù skouer a zo : {attendu} (merket e ruz).",
  anglesAucunFaux: "❌ N'en deus ar stumm-mañ korn skouer ebet.",
  reperageFaux: "❌ Livet ec'h eus {donne}. Ar garrezenn vat {nom} a zo kelc'hiet en orañjez.",
  casesJustes: '{justes} / {total} karrezenn mat',
  casesEnTrop: ', {n} re',
  // br: à relire
  presque: ({ manquantes, enTrop }) => {
    const morceaux = []
    if (manquantes) morceaux.push(`${manquantes} karrezenn ankouaet`)
    if (enTrop) morceaux.push(`${enTrop} karrezenn re`)
    return `Tost ! ${morceaux.join(' ha ')}. Sell ouzh ar reizhadenn.`
  },

  // ─── Fiche ───
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
  // corrigé de la fiche (titres des parties : ceux de la fiche) ; liste = numéros des dessins, dans l'ordre de lecture
  corrigeReproduction: "an hevelep stumm hag ar patrom, en hevelep lec'h (respont da wiriañ war ar gael)", // br: à relire
  corrigeCercle: "kelc'h a skin 3 cm (treuzkiz 6 cm) — skin : {rayon} — treuzkiz : {diametre}", // br: à relire
  corrigePatrons: 'tresadennoù {liste} (o lenn a-gleiz da zehou)', // br: à relire
}
