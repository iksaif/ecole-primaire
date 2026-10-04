// Contenu généré — géométrie (français) : questions, noms des figures et solides, propriétés, fiche.
// Mêmes clés que src/i18n/br/contenu/geometrie.js (vérifier avec `npm run i18n`).
// Paramètres : nom = nom d'une case (« B3 ») ou d'un segment (« [OA] ») ; r, d = longueurs en cm.

export default {
  figures: {
    carre: 'carré', rectangle: 'rectangle', triangle: 'triangle',
    triangle_rectangle: 'triangle rectangle', cercle: 'cercle', losange: 'losange',
  },
  solides: { cube: 'cube', pave: 'pavé droit', pyramide: 'pyramide', cylindre: 'cylindre', boule: 'boule', cone: 'cône' },

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
  // propriétés des figures : « Vrai ou faux ? » + affirmation, ou question à choix parmi `choixFigures`
  vraiOuFaux: 'Vrai ou faux ?',
  vraiFaux: ['Vrai', 'Faux'],
  choixFigures: ['carré', 'rectangle', 'losange', 'triangle rectangle'],
  proprietes: {
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
  // cercle : la bonne réponse est la première de chaque liste (« le centre » ; « un rayon », « un diamètre »)
  centreChoix: ['le centre', 'un rayon', 'un diamètre', 'un sommet'],
  centreQ: "Comment s'appelle le point O pour ce cercle ?",
  segmentChoix: ['un rayon', 'un diamètre', 'un côté'],
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
  presque: ({ manquantes, enTrop }) => {
    const morceaux = []
    if (manquantes) morceaux.push(`${manquantes} case${manquantes > 1 ? 's' : ''} oubliée${manquantes > 1 ? 's' : ''}`)
    if (enTrop) morceaux.push(`${enTrop} case${enTrop > 1 ? 's' : ''} en trop`)
    return `Presque ! ${morceaux.join(' et ')}. Regarde la correction.`
  },

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
}
