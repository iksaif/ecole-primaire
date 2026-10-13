// Textes de l'interface — les ceintures de compétences (français). Source des clés : br/textes/ceintures.ts doit avoir exactement les mêmes.
export default {
  titre: 'Ceintures',
  ongletIntro: 'Le brevet papier de cette piste : choisis la ceinture à passer, imprime les questions et le corrigé.',
  description: 'Livret, ceintures à découper, diplôme et passeport : des paliers de couleur pour suivre ses progrès',
  intro: 'Des paliers de couleur, comme au judo : on s’entraîne, on passe un brevet, on gagne la ceinture suivante. Choisis le support à imprimer et la piste ; les couleurs se règlent dans « Sur la fiche » ou dans les réglages.',
  support: { livret: 'Livret', bandes: 'Ceintures à découper', diplome: 'Diplôme', passeport: 'Passeport' },
  supportDesc: {
    livret: 'Une ligne par ceinture : objectifs à cocher, date, signature',
    bandes: 'Des bandes à découper et à coller sur le livret',
    diplome: 'Une page pour une ceinture, à emporter à la maison',
    passeport: 'Huit cartes de la taille d’une carte bancaire',
  },
  // les pistes fournies prennent le titre de leur exercice (tables, calcul mental, lettres) ; la piste libre a le sien
  pisteLibre: 'Mes objectifs (je les écris)',
  pisteTitre: 'Piste',
  supportTitre: 'Support',
  intituleTitre: 'Titre de la piste',
  intituleAuto: 'Mes objectifs',
  objectifsTitre: 'Objectifs (un par ligne, un par ceinture)',
  copies: 'Exemplaires de chaque ceinture',
  numero: 'Ceinture du diplôme',
  prenomTitre: 'Prénom (laisser vide pour l’écrire à la main)',
  // le nom écrit de chaque ceinture (la couleur ne porte jamais seule l'information) : « Ceinture verte »
  ceinture: {
    blanche: 'Ceinture blanche', jaune: 'Ceinture jaune', orange: 'Ceinture orange', verte: 'Ceinture verte', bleue: 'Ceinture bleue',
    marron: 'Ceinture marron', noire: 'Ceinture noire', rouge: 'Ceinture rouge', rose: 'Ceinture rose', violette: 'Ceinture violette',
    palier1: 'Niveau 1', palier2: 'Niveau 2', palier3: 'Niveau 3', palier4: 'Niveau 4', palier5: 'Niveau 5',
  },
  palette: {
    judo: 'Judo (7) : blanche à noire',
    'judo-rouge': 'Judo et rouge (8)',
    'rose-violet': 'Rose à violette (6)',
    paliers: 'Sans couleur : cinq niveaux',
  },
  style: { ruban: 'Ruban noué', bandeau: 'Bandeau', rond: 'Rond (gommette)' },
  // l'option (onglet « Appareil » des réglages) : cachée par défaut, comme le mode enseignant
  activer: {
    titre: 'Ceintures de compétences (en option)',
    aide: 'Des paliers de couleur pour suivre ses progrès : des fiches à imprimer (livret, brevets, ceintures à découper, tableau de la classe) et, plus tard, des brevets à passer à l’écran. Cachées tant qu’on ne les active pas.',
    case: 'Proposer les ceintures sur cet appareil',
    parSite: 'Ce site les propose d’office.',
  },
  // les réglages communs : page des réglages (onglet « Fiches ») et « Sur la fiche » des exercices
  reglage: {
    titre: 'Ceintures',
    aide: 'La palette et le dessin des ceintures, pour toutes les fiches de ceintures. Le nom de la couleur est toujours écrit à côté.',
    palette: 'Couleurs des ceintures',
    style: 'Dessin',
    noirEtBlanc: 'Noir et blanc (des motifs à la place des couleurs)',
    nb: 'Nombre de ceintures',
    seuil: 'Pour réussir un brevet',
    seuilValeur: '{n} % de bonnes réponses',
    questions: 'Questions d’un brevet',
    chronometre: 'Chronomètre',
    chrono: { aucun: 'Aucun', doux: 'Doux', strict: 'Strict' },
  },
} as const
