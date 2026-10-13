// Tracer à la règle — textes de CONTENU : les questions, les retours et ce que la fiche écrit. Lus par T (générateur, fiche) ; la vue passe
// par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, boutons) sont dans src/langues/<langue>/textes/tracerRegle.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Tracer à la règle',

  // ─── Questions ───
  alignesQ: 'Quel point est aligné avec A et B ?',
  aucun: 'Aucun point',
  // la case de la fiche (le mot de la consigne)
  aucunCase: 'aucun',
  completerQ: {
    carre: 'Termine le carré : place les deux sommets qui manquent.',
    rectangle: 'Termine le rectangle : place le sommet qui manque.',
    triangleRectangle: 'Termine le triangle rectangle : l’angle droit est en A, et ses deux côtés de l’angle droit ont la même longueur.',
  },
  reproduireQ: {
    pointe: 'Reproduis la figure sur le papier pointé : relie les points.',
    quadrille: 'Reproduis la figure sur le quadrillage : relie les points.',
  },
  reproduireAttendu: 'la même figure',
  construireQ: {
    rectangle: 'Trace un rectangle de {a} carreaux de longueur et {b} carreaux de largeur.',
    carre: 'Trace un carré de {a} carreaux de côté.',
    triangleRectangle: 'Trace un triangle rectangle : les côtés de l’angle droit mesurent {a} carreaux et {b} carreaux.',
  },
  construireAttendu: {
    rectangle: 'un rectangle de {a} sur {b}',
    carre: 'un carré de {a}',
    triangleRectangle: 'un triangle rectangle de {a} et {b}',
  },

  // ─── Retours ───
  traitsTraces: { one: '{n} trait', other: '{n} traits' },
  alignesFaux: 'C’est le point {lettre} : pose ta règle sur A et B, il est sur le bord de la règle.',
  alignesAucunFaux: 'Aucun point n’est aligné avec A et B : pose ta règle sur A et B, aucune croix n’est sur le bord.',
  completerFaux: {
    carre: 'Un carré a quatre côtés de la même longueur et quatre angles droits.',
    // au CP, sans l'angle droit (CE1)
    carreCP: 'Un carré a quatre côtés de la même longueur : compte les points sur chaque côté.',
    rectangle: 'Dans un rectangle, les côtés opposés ont la même longueur.',
    triangleRectangle: 'Le côté qui manque part de A, à angle droit, et il est aussi long que le côté tracé : compte les points.',
  },
  reproduireFaux: 'Compte les points : chaque côté doit avoir la même longueur et la même direction que sur le modèle.',
  construireFaux: {
    rectangle: 'Un rectangle a quatre angles droits : deux côtés de {a} carreaux et deux côtés de {b} carreaux.',
    carre: 'Un carré a quatre angles droits et quatre côtés de {a} carreaux.',
    triangleRectangle: 'Le triangle rectangle a un angle droit, entre un côté de {a} carreaux et un côté de {b} carreaux.',
  },

  // ─── Fiche ───
  ficheAlignes: 'Les points alignés',
  ficheAlignesConsigne: 'Trace à la règle la droite qui passe par A et B. Entoure le point qui est aligné avec A et B ; s’il n’y en a aucun, coche « aucun ».',
  ficheCompleter: 'Compléter des figures',
  ficheCompleterConsigne: {
    carre: 'Termine le carré à la règle.',
    rectangle: 'Termine le rectangle à la règle.',
    triangleRectangle: 'Termine le triangle rectangle à la règle : l’angle droit est en A, ses deux côtés de l’angle droit ont la même longueur.',
  },
  ficheReproduire: 'Reproduire des figures',
  ficheReproduireConsigne: {
    pointe: 'Reproduis la figure à la règle sur le papier pointé de droite.',
    quadrille: 'Reproduis la figure à la règle sur le quadrillage de droite.',
  },
  ficheCompleterConsigneEquerre: {
    carre: 'Termine le carré à la règle et à l’équerre.',
    rectangle: 'Termine le rectangle à la règle et à l’équerre.',
    triangleRectangle: 'Termine le triangle rectangle à la règle et à l’équerre : l’angle droit est en A, ses deux côtés de l’angle droit ont la même longueur.',
  },
  ficheConstruire: 'Construire des figures',
  ficheConstruireConsigne: 'Construis chaque figure dans son cadre, à la règle graduée et à l’équerre, puis code les angles droits.',
  ficheConstruireConsigneCE2: 'Construis chaque figure dans son cadre, à la règle graduée et à l’équerre, puis code les angles droits et les côtés de même longueur.',
  ficheConstruireFigure: {
    rectangle: 'Un rectangle de {a} cm de longueur et {b} cm de largeur.',
    carre: 'Un carré de {a} cm de côté.',
    triangleRectangle: 'Un triangle rectangle dont les côtés de l’angle droit mesurent {a} cm et {b} cm.',
  },
  corrigeConstruire: 'Les figures, réduites, avec leur codage. Vérifie avec la règle graduée (les mesures) et avec l’équerre (les angles droits) ; la figure peut être placée n’importe où dans le cadre, dans n’importe quel sens.',
  modele: 'Modèle',
  aToi: 'À toi',
  corrigeAlignes: 'le point aligné',
  corrigeReproduire: 'la même figure que le modèle (elle peut être placée ailleurs sur la grille)',
  corrigeDeuxCarres: 'Un carré ou un triangle rectangle peut aussi se tracer de l’autre côté du côté donné.',
}, {
  br: {
    titre: 'Tresañ gant ar reolenn', // br: à relire
    alignesQ: 'Peseurt pik a zo war an hevelep linenn gant A ha B ?', // br: à relire
    aucun: 'Pik ebet', // br: à relire
    aucunCase: 'hini ebet', // br: à relire
    completerQ: { // br: à relire
      carre: 'Echu ar c’harrez : lak an daou vegenn a vank.',
      rectangle: 'Echu ar skouergorneg : lak ar begenn a vank.',
      triangleRectangle: 'Echu an tric’horn skouer : emañ ar c’horn skouer en A, ha daou gostez ar c’horn skouer o deus an hevelep hed.',
    },
    reproduireQ: { // br: à relire
      pointe: 'Adtres ar stumm war ar paper pikoù : liamm ar pikoù.',
      quadrille: 'Adtres ar stumm war ar c’harrezennoù : liamm ar pikoù.',
    },
    reproduireAttendu: 'an hevelep stumm', // br: à relire
    construireQ: { // br: à relire
      rectangle: 'Tres ur skouergorneg {a} karrezenn a hed ha {b} karrezenn a led.',
      carre: 'Tres ur c’harrez {a} karrezenn e gostez.',
      triangleRectangle: 'Tres un tric’horn skouer : kostezioù ar c’horn skouer a vuzul {a} karrezenn ha {b} karrezenn.',
    },
    construireAttendu: { // br: à relire
      rectangle: 'ur skouergorneg {a} war {b}',
      carre: 'ur c’harrez {a}',
      triangleRectangle: 'un tric’horn skouer {a} ha {b}',
    },
    traitsTraces: { one: '{n} linenn', other: '{n} linenn' }, // br: à relire
    alignesFaux: 'Ar pik {lettre} eo : lak da reolenn war A ha B, emañ war bord ar reolenn.', // br: à relire
    alignesAucunFaux: 'Pik ebet n’eo a-linenn gant A ha B : lak da reolenn war A ha B, kroaz ebet n’emañ war ar bord.', // br: à relire
    completerFaux: { // br: à relire
      carre: 'Ur c’harrez en deus pevar c’hostez a-hed par ha pevar c’horn skouer.',
      carreCP: 'Ur c’harrez en deus pevar c’hostez a-hed par : kont ar pikoù war pep kostez.',
      rectangle: 'En ur skouergorneg, ar c’hostezioù a-dal o deus an hevelep hed.',
      triangleRectangle: 'Ar c’hostez a vank a grog en A, a-skouer, ha ken hir eo hag ar c’hostez tresañ : kont ar pikoù.',
    },
    reproduireFaux: 'Kont ar pikoù : pep kostez a rank kaout an hevelep hed hag an hevelep tu eget war ar skouer.', // br: à relire
    construireFaux: { // br: à relire
      rectangle: 'Ur skouergorneg en deus pevar c’horn skouer : daou gostez {a} karrezenn ha daou gostez {b} karrezenn.',
      carre: 'Ur c’harrez en deus pevar c’horn skouer ha pevar c’hostez {a} karrezenn.',
      triangleRectangle: 'An tric’horn skouer en deus ur c’horn skouer, etre ur c’hostez {a} karrezenn hag ur c’hostez {b} karrezenn.',
    },
    ficheAlignes: 'Ar pikoù a-linenn', // br: à relire
    ficheAlignesConsigne: 'Tres gant ar reolenn al linenn a dremen dre A ha B. Lak ur c’helc’h en-dro d’ar pik a zo a-linenn gant A ha B ; ma n’eus hini ebet, merk « hini ebet ».', // br: à relire
    ficheCompleter: 'Klokaat stummoù', // br: à relire
    ficheCompleterConsigne: { // br: à relire
      carre: 'Echu ar c’harrez gant ar reolenn.',
      rectangle: 'Echu ar skouergorneg gant ar reolenn.',
      triangleRectangle: 'Echu an tric’horn skouer gant ar reolenn : emañ ar c’horn skouer en A, daou gostez ar c’horn skouer o deus an hevelep hed.',
    },
    ficheReproduire: 'Adtresañ stummoù', // br: à relire
    ficheReproduireConsigne: { // br: à relire
      pointe: 'Adtres ar stumm gant ar reolenn war ar paper pikoù a-zehou.',
      quadrille: 'Adtres ar stumm gant ar reolenn war ar c’harrezennoù a-zehou.',
    },
    ficheCompleterConsigneEquerre: { // br: à relire
      carre: 'Echu ar c’harrez gant ar reolenn hag ar skouer.',
      rectangle: 'Echu ar skouergorneg gant ar reolenn hag ar skouer.',
      triangleRectangle: 'Echu an tric’horn skouer gant ar reolenn hag ar skouer : emañ ar c’horn skouer en A, daou gostez ar c’horn skouer o deus an hevelep hed.',
    },
    ficheConstruire: 'Sevel stummoù', // br: à relire
    ficheConstruireConsigne: 'Sav pep stumm en e stern, gant ar reolenn hag ar skouer, ha merk ar c’hornioù skouer.', // br: à relire
    ficheConstruireConsigneCE2: 'Sav pep stumm en e stern, gant ar reolenn hag ar skouer, ha merk ar c’hornioù skouer hag ar c’hostezioù a-hed par.', // br: à relire
    ficheConstruireFigure: { // br: à relire
      rectangle: 'Ur skouergorneg {a} cm a hed ha {b} cm a led.',
      carre: 'Ur c’harrez {a} cm e gostez.',
      triangleRectangle: 'Un tric’horn skouer : kostezioù ar c’horn skouer a vuzul {a} cm ha {b} cm.',
    },
    corrigeConstruire: 'Ar stummoù, bihanaet, gant o merkoù. Gwiriañ gant ar reolenn (ar muzulioù) ha gant ar skouer (ar c’hornioù skouer) ; gallout a ra ar stumm bezañ e forzh pelec’h er stern, e forzh peseurt tu.', // br: à relire
    modele: 'Skouer', // br: à relire
    aToi: 'Da dro', // br: à relire
    corrigeAlignes: 'ar pik a-linenn', // br: à relire
    corrigeReproduire: 'an hevelep stumm hag ar skouer (gallout a ra bezañ lec’hiet e lec’h all war ar c’harrezennoù)', // br: à relire
    corrigeDeuxCarres: 'Gallout a reer ivez tresañ ar c’harrez pe an tric’horn skouer en tu all d’ar c’hostez roet.', // br: à relire
  },
})
